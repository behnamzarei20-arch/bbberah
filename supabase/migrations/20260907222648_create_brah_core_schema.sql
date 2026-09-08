/*
# براه (Brah) - Core Database Schema

## Overview
Creates the complete database schema for براه (Brah), a Persian RTL logistics marketplace.

## New Tables
1. profiles, driver_profiles, shipper_profiles, vehicles, cargo, offers, shipments,
   shipment_events, ratings, notifications, wallet_transactions, return_cargo_suggestions,
   commission_settings
*/

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'shipper' CHECK (role IN ('driver', 'shipper', 'admin')),
  phone text,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'shipper'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- DRIVER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  national_id text,
  license_number text,
  license_expiry date,
  license_image_url text,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_note text,
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  total_ratings integer NOT NULL DEFAULT 0,
  total_deliveries integer NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  current_location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS driver_profiles_updated_at ON public.driver_profiles;
CREATE TRIGGER driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP POLICY IF EXISTS "driver_profiles_select_own_or_admin" ON public.driver_profiles;
CREATE POLICY "driver_profiles_select_own_or_admin" ON public.driver_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "driver_profiles_insert_own" ON public.driver_profiles;
CREATE POLICY "driver_profiles_insert_own" ON public.driver_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "driver_profiles_update_own_or_admin" ON public.driver_profiles;
CREATE POLICY "driver_profiles_update_own_or_admin" ON public.driver_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- SHIPPER PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipper_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  national_id text,
  company_registration_number text,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_note text,
  rating numeric(3,2) NOT NULL DEFAULT 0.00,
  total_ratings integer NOT NULL DEFAULT 0,
  total_shipments integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipper_profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS shipper_profiles_updated_at ON public.shipper_profiles;
CREATE TRIGGER shipper_profiles_updated_at BEFORE UPDATE ON public.shipper_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP POLICY IF EXISTS "shipper_profiles_select_own_or_admin" ON public.shipper_profiles;
CREATE POLICY "shipper_profiles_select_own_or_admin" ON public.shipper_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "shipper_profiles_insert_own" ON public.shipper_profiles;
CREATE POLICY "shipper_profiles_insert_own" ON public.shipper_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "shipper_profiles_update_own_or_admin" ON public.shipper_profiles;
CREATE POLICY "shipper_profiles_update_own_or_admin" ON public.shipper_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- VEHICLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate_number text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('truck_light', 'truck_medium', 'truck_heavy', 'trailer', 'pickup', 'van')),
  capacity_kg numeric(10,2) NOT NULL DEFAULT 0,
  capacity_volume numeric(10,2),
  length_m numeric(6,2),
  width_m numeric(6,2),
  height_m numeric(6,2),
  insurance_number text,
  insurance_expiry date,
  registration_image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_verification')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS vehicles_updated_at ON public.vehicles;
CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);

DROP POLICY IF EXISTS "vehicles_select_own_or_admin" ON public.vehicles;
CREATE POLICY "vehicles_select_own_or_admin" ON public.vehicles FOR SELECT
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin());

DROP POLICY IF EXISTS "vehicles_insert_own" ON public.vehicles;
CREATE POLICY "vehicles_insert_own" ON public.vehicles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "vehicles_update_own_or_admin" ON public.vehicles;
CREATE POLICY "vehicles_update_own_or_admin" ON public.vehicles FOR UPDATE
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin())
  WITH CHECK (auth.uid() = driver_id OR public.is_admin());

DROP POLICY IF EXISTS "vehicles_delete_own_or_admin" ON public.vehicles;
CREATE POLICY "vehicles_delete_own_or_admin" ON public.vehicles FOR DELETE
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin());

-- ============================================================================
-- CARGO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cargo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  origin_city text NOT NULL,
  origin_address text,
  destination_city text NOT NULL,
  destination_address text,
  cargo_type text NOT NULL CHECK (cargo_type IN ('general', 'construction', 'food', 'industrial', 'agricultural', 'hazardous', 'refrigerated', 'vehicles', 'other')),
  weight_kg numeric(10,2) NOT NULL DEFAULT 0,
  volume numeric(10,2),
  required_vehicle_type text CHECK (required_vehicle_type IN ('truck_light', 'truck_medium', 'truck_heavy', 'trailer', 'pickup', 'van', 'any')),
  loading_type text NOT NULL DEFAULT 'manual' CHECK (loading_type IN ('manual', 'forklift', 'crane', 'ramp')),
  pickup_date date NOT NULL,
  delivery_date date,
  price_toman numeric(14,0) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  commission_amount numeric(14,0) NOT NULL DEFAULT 0,
  insurance_required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_transit', 'delivered', 'completed', 'cancelled', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cargo ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS cargo_updated_at ON public.cargo;
CREATE TRIGGER cargo_updated_at BEFORE UPDATE ON public.cargo
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_cargo_shipper_id ON public.cargo(shipper_id);
CREATE INDEX IF NOT EXISTS idx_cargo_status ON public.cargo(status);
CREATE INDEX IF NOT EXISTS idx_cargo_origin_city ON public.cargo(origin_city);
CREATE INDEX IF NOT EXISTS idx_cargo_destination_city ON public.cargo(destination_city);
CREATE INDEX IF NOT EXISTS idx_cargo_pickup_date ON public.cargo(pickup_date);

DROP POLICY IF EXISTS "cargo_select_all" ON public.cargo;
CREATE POLICY "cargo_select_all" ON public.cargo FOR SELECT
  TO authenticated USING (
    auth.uid() = shipper_id
    OR public.is_admin()
    OR public.get_current_role() = 'driver'
  );

DROP POLICY IF EXISTS "cargo_insert_shipper" ON public.cargo;
CREATE POLICY "cargo_insert_shipper" ON public.cargo FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = shipper_id);

DROP POLICY IF EXISTS "cargo_update_own_or_admin" ON public.cargo;
CREATE POLICY "cargo_update_own_or_admin" ON public.cargo FOR UPDATE
  TO authenticated USING (auth.uid() = shipper_id OR public.is_admin())
  WITH CHECK (auth.uid() = shipper_id OR public.is_admin());

DROP POLICY IF EXISTS "cargo_delete_own_or_admin" ON public.cargo;
CREATE POLICY "cargo_delete_own_or_admin" ON public.cargo FOR DELETE
  TO authenticated USING (auth.uid() = shipper_id OR public.is_admin());

-- ============================================================================
-- OFFERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id uuid NOT NULL REFERENCES public.cargo(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  offered_price_toman numeric(14,0) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  commission_amount numeric(14,0) NOT NULL DEFAULT 0,
  message text,
  estimated_pickup_time text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS offers_updated_at ON public.offers;
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_offers_cargo_id ON public.offers(cargo_id);
CREATE INDEX IF NOT EXISTS idx_offers_driver_id ON public.offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

DROP POLICY IF EXISTS "offers_select_related" ON public.offers;
CREATE POLICY "offers_select_related" ON public.offers FOR SELECT
  TO authenticated USING (
    auth.uid() = driver_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cargo
      WHERE cargo.id = offers.cargo_id
      AND cargo.shipper_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "offers_insert_driver" ON public.offers;
CREATE POLICY "offers_insert_driver" ON public.offers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "offers_update_own_or_shipper_or_admin" ON public.offers;
CREATE POLICY "offers_update_own_or_shipper_or_admin" ON public.offers FOR UPDATE
  TO authenticated USING (
    auth.uid() = driver_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cargo
      WHERE cargo.id = offers.cargo_id
      AND cargo.shipper_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = driver_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.cargo
      WHERE cargo.id = offers.cargo_id
      AND cargo.shipper_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "offers_delete_own" ON public.offers;
CREATE POLICY "offers_delete_own" ON public.offers FOR DELETE
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin());

-- ============================================================================
-- SHIPMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id uuid NOT NULL REFERENCES public.cargo(id) ON DELETE CASCADE,
  shipper_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  agreed_price_toman numeric(14,0) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  commission_amount numeric(14,0) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'created' CHECK (status IN (
    'created', 'accepted', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'
  )),
  pickup_time timestamptz,
  delivery_time timestamptz,
  completion_time timestamptz,
  pickup_confirmed boolean NOT NULL DEFAULT false,
  delivery_confirmed boolean NOT NULL DEFAULT false,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS shipments_updated_at ON public.shipments;
CREATE TRIGGER shipments_updated_at BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_shipments_shipper_id ON public.shipments(shipper_id);
CREATE INDEX IF NOT EXISTS idx_shipments_driver_id ON public.shipments(driver_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_cargo_id ON public.shipments(cargo_id);

DROP POLICY IF EXISTS "shipments_select_participants" ON public.shipments;
CREATE POLICY "shipments_select_participants" ON public.shipments FOR SELECT
  TO authenticated USING (
    auth.uid() = shipper_id
    OR auth.uid() = driver_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "shipments_insert_shipper" ON public.shipments;
CREATE POLICY "shipments_insert_shipper" ON public.shipments FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = shipper_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "shipments_update_participants_or_admin" ON public.shipments;
CREATE POLICY "shipments_update_participants_or_admin" ON public.shipments FOR UPDATE
  TO authenticated USING (
    auth.uid() = shipper_id
    OR auth.uid() = driver_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = shipper_id
    OR auth.uid() = driver_id
    OR public.is_admin()
  );

-- ============================================================================
-- SHIPMENT EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'created', 'accepted', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled', 'note'
  )),
  status_from text,
  status_to text NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);

DROP POLICY IF EXISTS "shipment_events_select_participants" ON public.shipment_events;
CREATE POLICY "shipment_events_select_participants" ON public.shipment_events FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE shipments.id = shipment_events.shipment_id
      AND (shipments.shipper_id = auth.uid() OR shipments.driver_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "shipment_events_insert_participants" ON public.shipment_events;
CREATE POLICY "shipment_events_insert_participants" ON public.shipment_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shipments
      WHERE shipments.id = shipment_events.shipment_id
      AND (shipments.shipper_id = auth.uid() OR shipments.driver_id = auth.uid() OR public.is_admin())
    )
  );

-- ============================================================================
-- RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ratee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rater_role text NOT NULL CHECK (rater_role IN ('shipper', 'driver')),
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ratings_shipment_id ON public.ratings(shipment_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ratee_id ON public.ratings(ratee_id);

DROP POLICY IF EXISTS "ratings_select_participants" ON public.ratings;
CREATE POLICY "ratings_select_participants" ON public.ratings FOR SELECT
  TO authenticated USING (
    auth.uid() = rater_id
    OR auth.uid() = ratee_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "ratings_insert_participant" ON public.ratings;
CREATE POLICY "ratings_insert_participant" ON public.ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = rater_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'offer_received', 'offer_accepted', 'offer_rejected', 'offer_withdrawn',
    'shipment_created', 'shipment_status_update', 'shipment_pickup_confirmed',
    'shipment_delivery_confirmed', 'rating_received', 'verification_update',
    'vehicle_approved', 'admin_message', 'return_cargo_suggestion'
  )),
  title text NOT NULL,
  body text,
  related_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_insert_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_insert_own_or_admin" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_delete_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_delete_own_or_admin" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- WALLET TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'commission', 'refund', 'bonus', 'penalty')),
  amount_toman numeric(14,0) NOT NULL DEFAULT 0,
  balance_after numeric(14,0) NOT NULL DEFAULT 0,
  description text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions(created_at);

DROP POLICY IF EXISTS "wallet_select_own_or_admin" ON public.wallet_transactions;
CREATE POLICY "wallet_select_own_or_admin" ON public.wallet_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wallet_insert_own_or_admin" ON public.wallet_transactions;
CREATE POLICY "wallet_insert_own_or_admin" ON public.wallet_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "wallet_update_own_or_admin" ON public.wallet_transactions;
CREATE POLICY "wallet_update_own_or_admin" ON public.wallet_transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- RETURN CARGO SUGGESTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.return_cargo_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cargo_id uuid REFERENCES public.cargo(id) ON DELETE CASCADE,
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE SET NULL,
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  match_score numeric(5,2) NOT NULL DEFAULT 0.00,
  status text NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'accepted', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.return_cargo_suggestions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_return_cargo_driver_id ON public.return_cargo_suggestions(driver_id);

DROP POLICY IF EXISTS "return_cargo_select_own_or_admin" ON public.return_cargo_suggestions;
CREATE POLICY "return_cargo_select_own_or_admin" ON public.return_cargo_suggestions FOR SELECT
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin());

DROP POLICY IF EXISTS "return_cargo_insert_own_or_admin" ON public.return_cargo_suggestions;
CREATE POLICY "return_cargo_insert_own_or_admin" ON public.return_cargo_suggestions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = driver_id OR public.is_admin());

DROP POLICY IF EXISTS "return_cargo_update_own_or_admin" ON public.return_cargo_suggestions;
CREATE POLICY "return_cargo_update_own_or_admin" ON public.return_cargo_suggestions FOR UPDATE
  TO authenticated USING (auth.uid() = driver_id OR public.is_admin())
  WITH CHECK (auth.uid() = driver_id OR public.is_admin());

-- ============================================================================
-- COMMISSION SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.commission_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_percent numeric(5,2) NOT NULL DEFAULT 0.00,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS commission_settings_updated_at ON public.commission_settings;
CREATE TRIGGER commission_settings_updated_at BEFORE UPDATE ON public.commission_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

INSERT INTO public.commission_settings (rate_percent, description)
VALUES (0.00, 'کمیسیون پیش‌فرض براه - رایگان در دوره MVP')
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "commission_settings_select_all" ON public.commission_settings;
CREATE POLICY "commission_settings_select_all" ON public.commission_settings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "commission_settings_update_admin" ON public.commission_settings;
CREATE POLICY "commission_settings_update_admin" ON public.commission_settings FOR UPDATE
  TO authenticated USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "commission_settings_insert_admin" ON public.commission_settings;
CREATE POLICY "commission_settings_insert_admin" ON public.commission_settings FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, related_id)
  VALUES (p_user_id, p_type, p_title, p_body, p_related_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_shipment_event(
  p_shipment_id uuid,
  p_event_type text,
  p_status_to text,
  p_status_from text DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.shipment_events (shipment_id, event_type, status_from, status_to, note, created_by)
  VALUES (p_shipment_id, p_event_type, p_status_from, p_status_to, p_note, p_created_by);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
