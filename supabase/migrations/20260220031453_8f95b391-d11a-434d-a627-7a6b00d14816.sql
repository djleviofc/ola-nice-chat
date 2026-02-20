
-- Drop the broken restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a proper permissive INSERT policy
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);
