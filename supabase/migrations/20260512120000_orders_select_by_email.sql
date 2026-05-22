-- Allow users to see orders tied to their account OR guest orders placed with their email (same inbox as login)

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR (
      user_id IS NULL
      AND customer_email IS NOT NULL
      AND lower(trim(customer_email)) = lower(trim(auth.email()))
    )
  );
