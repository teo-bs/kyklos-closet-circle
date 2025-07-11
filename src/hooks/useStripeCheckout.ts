
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CheckoutParams {
  listingId: string;
  amount: number;
  title: string;
}

export const useStripeCheckout = () => {
  return useMutation({
    mutationFn: async ({ listingId, amount, title }: CheckoutParams) => {
      console.log('Creating Stripe checkout session for listing:', listingId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          listingId,
          amount,
          title,
        },
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Checkout session created:', data.url);
      return data.url;
    },
    onSuccess: (checkoutUrl) => {
      // Open Stripe checkout in a new tab
      window.open(checkoutUrl, '_blank');
    },
    onError: (error) => {
      console.error('Stripe checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    },
  });
};
