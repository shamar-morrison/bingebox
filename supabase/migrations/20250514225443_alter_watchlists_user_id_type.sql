-- Alter the user_id column in the watchlists table to be TEXT.

-- Step 1: Drop existing RLS policies that use user_id
DROP POLICY IF EXISTS "Users can view their own watchlist items" ON public.watchlists;
DROP POLICY IF EXISTS "Users can insert their own watchlist items" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update their own watchlist items" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete their own watchlist items" ON public.watchlists;

-- Step 2: Drop the existing foreign key constraint if it exists from a previous attempt
ALTER TABLE public.watchlists
DROP CONSTRAINT IF EXISTS watchlists_user_id_fkey;

-- Step 3: Alter the column type
ALTER TABLE public.watchlists
ALTER COLUMN user_id TYPE TEXT;

-- NOTE: Foreign Key and RLS policies will be added back carefully after this.
-- For now, RLS will be effectively disabled on this table once policies are dropped.