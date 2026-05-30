-- Explicit Data API grants for Supabase's public-schema grant change.
-- RLS policies still decide which rows each role can access.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Remove legacy broad grants before adding the app's intended API surface.
REVOKE ALL PRIVILEGES ON TABLE public.phones FROM anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.phone_images FROM anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.products FROM anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon, authenticated, service_role;
REVOKE ALL PRIVILEGES ON TABLE public.orders FROM anon, authenticated, service_role;

-- Public catalog data used by the storefront.
GRANT SELECT ON TABLE public.phones TO anon;
GRANT SELECT ON TABLE public.phone_images TO anon;
GRANT SELECT ON TABLE public.products TO anon, authenticated;

-- Authenticated inventory management, guarded by table RLS policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phone_images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

-- Authenticated user data.
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.orders TO authenticated;

-- Server-side edge functions and maintenance scripts use service_role.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phones TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.phone_images TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO service_role;
