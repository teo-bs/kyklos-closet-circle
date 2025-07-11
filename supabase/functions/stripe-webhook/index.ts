
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
      undefined,
      cryptoProvider
    );

    console.log(`Received event: ${receivedEvent.type}`);

    if (receivedEvent.type === "checkout.session.completed") {
      const session = receivedEvent.data.object as Stripe.Checkout.Session;
      
      console.log("Processing successful payment for session:", session.id);
      
      const listingId = session.metadata?.listingId;
      const buyerId = session.metadata?.buyerId;
      
      if (!listingId || !buyerId) {
        console.error("Missing metadata in session:", session.metadata);
        return new Response("Missing metadata", { status: 400 });
      }

      // Use service role key to bypass RLS
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Get listing details
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingError || !listing) {
        console.error("Error fetching listing:", listingError);
        return new Response("Listing not found", { status: 404 });
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: listing.user_id,
          amount: session.amount_total || 0,
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
        });

      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        return new Response("Transaction creation failed", { status: 500 });
      }

      // Update listing status to sold
      const { error: updateError } = await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", listingId);

      if (updateError) {
        console.error("Error updating listing status:", updateError);
        return new Response("Listing update failed", { status: 500 });
      }

      console.log("Successfully processed payment for listing:", listingId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
});
