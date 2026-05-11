-- Orders/payments persistence for Stripe Checkout (PromptPay supported via Stripe)

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  provider TEXT NOT NULL DEFAULT 'stripe',
  checkout_session_id TEXT NOT NULL UNIQUE,
  payment_intent_id TEXT,

  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','pending','paid','failed','canceled')),
  payment_status TEXT,

  currency TEXT NOT NULL DEFAULT 'thb',
  amount_total NUMERIC(12,2),

  customer_email TEXT,
  customer_name TEXT,

  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  shipping JSONB,
  metadata JSONB,

  invoice_email TEXT,
  invoice_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated user to read their own orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Users can view their own orders'
  ) THEN
    CREATE POLICY "Users can view their own orders"
      ON public.orders
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS orders_user_id_created_at_idx
  ON public.orders (user_id, created_at DESC);

