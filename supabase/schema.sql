-- Supabase PostgreSQL Schema & Row-Level Security Hardening for RevTerm
-- Applied to Supabase Postgres 17 (matches Sequelize models in server/src/models/)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Users_role') THEN
    CREATE TYPE "enum_Users_role" AS ENUM ('admin', 'member');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Organizations_planTier') THEN
    CREATE TYPE "enum_Organizations_planTier" AS ENUM ('free', 'pro', 'enterprise');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Customers_status') THEN
    CREATE TYPE "enum_Customers_status" AS ENUM ('active', 'past_due', 'canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_Transactions_eventType') THEN
    CREATE TYPE "enum_Transactions_eventType" AS ENUM (
      'charge.succeeded',
      'charge.failed',
      'subscription.created',
      'subscription.canceled',
      'invoice.paid'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public."Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "role" "enum_Users_role" DEFAULT 'admin',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."Organizations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES public."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "stripeAccountId" VARCHAR(255),
  "stripeApiKey" VARCHAR(255),
  "currency" VARCHAR(3) DEFAULT 'usd',
  "planTier" "enum_Organizations_planTier" DEFAULT 'pro',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."Customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID REFERENCES public."Organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "plan" VARCHAR(255) NOT NULL,
  "mrrContribution" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  "status" "enum_Customers_status" DEFAULT 'active',
  "joinedDate" DATE DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."Transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID REFERENCES public."Organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "stripeChargeId" VARCHAR(255),
  "eventType" "enum_Transactions_eventType" NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'usd',
  "customerEmail" VARCHAR(255) NOT NULL,
  "description" VARCHAR(255),
  "occurredAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS "idx_organizations_user_id" ON public."Organizations" ("userId");
CREATE INDEX IF NOT EXISTS "idx_customers_status" ON public."Customers" ("status");
CREATE INDEX IF NOT EXISTS "idx_customers_email" ON public."Customers" ("email");
CREATE INDEX IF NOT EXISTS "idx_customers_mrr" ON public."Customers" ("mrrContribution");
CREATE INDEX IF NOT EXISTS "idx_customers_org_id" ON public."Customers" ("organizationId");
CREATE INDEX IF NOT EXISTS "idx_customers_org_status" ON public."Customers" ("organizationId", "status");
CREATE INDEX IF NOT EXISTS "idx_transactions_occurred_at" ON public."Transactions" ("occurredAt");
CREATE INDEX IF NOT EXISTS "idx_transactions_event_type" ON public."Transactions" ("eventType");
CREATE INDEX IF NOT EXISTS "idx_transactions_org_id" ON public."Transactions" ("organizationId");
CREATE INDEX IF NOT EXISTS "idx_transactions_org_occurred" ON public."Transactions" ("organizationId", "occurredAt");
CREATE INDEX IF NOT EXISTS "idx_transactions_customer_email" ON public."Transactions" ("customerEmail");

-- Row-Level Security & Data API lockdown
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transactions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."Users" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Organizations" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Customers" FROM anon, authenticated;
REVOKE ALL ON TABLE public."Transactions" FROM anon, authenticated;
