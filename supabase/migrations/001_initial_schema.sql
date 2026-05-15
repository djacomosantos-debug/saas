-- AutoRecall CRM - Initial Schema
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  workshop_name text,
  phone text,
  created_at timestamptz default now()
);
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamptz default now()
);
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  plate text not null,
  brand text,
  model text,
  year integer,
  engine text,
  fuel text,
  current_mileage integer,
  created_at timestamptz default now()
);
create table if not exists service_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  vehicle_id uuid references vehicles(id) on delete cascade not null,
  diagnosis text,
  services_description text,
  parts_description text,
  parts_total numeric(10,2) default 0,
  labor_total numeric(10,2) default 0,
  total_amount numeric(10,2) generated always as (parts_total + labor_total) stored,
  mileage integer,
  status text default 'open',
  next_service_date date,
  next_service_mileage integer,
  charge_on_complete boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz
);
create table if not exists estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  vehicle_id uuid references vehicles(id) on delete cascade,
  service_order_id uuid references service_orders(id),
  items jsonb default '[]',
  total_amount numeric(10,2),
  status text default 'pending',
  approval_token text unique,
  created_at timestamptz default now()
);
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  vehicle_id uuid references vehicles(id) on delete cascade,
  service_order_id uuid references service_orders(id),
  reminder_type text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text default 'scheduled',
  created_at timestamptz default now()
);
create table if not exists charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  service_order_id uuid references service_orders(id),
  amount numeric(10,2),
  due_date date,
  status text default 'pending',
  asaas_charge_id text,
  pix_payload text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_user_policy') THEN CREATE POLICY "profiles_user_policy" ON profiles USING (id = auth.uid()) WITH CHECK (id = auth.uid()); END IF; END $$;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'customers_user_policy') THEN CREATE POLICY "customers_user_policy" ON customers USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vehicles' AND policyname = 'vehicles_user_policy') THEN CREATE POLICY "vehicles_user_policy" ON vehicles USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_orders' AND policyname = 'service_orders_user_policy') THEN CREATE POLICY "service_orders_user_policy" ON service_orders USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'estimates' AND policyname = 'estimates_user_policy') THEN CREATE POLICY "estimates_user_policy" ON estimates USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reminders' AND policyname = 'reminders_user_policy') THEN CREATE POLICY "reminders_user_policy" ON reminders USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'charges' AND policyname = 'charges_user_policy') THEN CREATE POLICY "charges_user_policy" ON charges USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid()); END IF; END $$;
