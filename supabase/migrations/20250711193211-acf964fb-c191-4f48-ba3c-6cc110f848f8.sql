
-- Update transactions table to include stripe_session_id for webhook processing
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create an index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session_id 
ON public.transactions(stripe_session_id);

-- Add RLS policy for webhook processing (system operations)
CREATE POLICY "System can create transactions via webhook" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);
