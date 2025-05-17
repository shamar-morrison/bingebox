-- Create the watchlists table
CREATE TABLE public.watchlists (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    media_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    status TEXT NOT NULL CHECK (status IN ('watching', 'should-watch', 'dropped')),
    title TEXT,
    poster_path TEXT,
    release_date DATE, -- Or TEXT if you prefer 'YYYY-MM-DD' strings
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_watchlist_item UNIQUE (user_id, media_id, media_type) -- Ensures a user can't add the same item multiple times
);

-- Add an index for faster lookups by user_id and status
CREATE INDEX idx_watchlists_user_status ON public.watchlists(user_id, status);

-- Add an index for faster lookups by user_id, media_id, and media_type (supports the unique constraint and GET by item)
CREATE INDEX idx_watchlists_user_media ON public.watchlists(user_id, media_id, media_type);

-- RLS Policies
-- Enable Row Level Security
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select their own watchlist items
CREATE POLICY "Users can view their own watchlist items"
ON public.watchlists
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own watchlist items
CREATE POLICY "Users can insert their own watchlist items"
ON public.watchlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own watchlist items
CREATE POLICY "Users can update their own watchlist items"
ON public.watchlists
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own watchlist items
CREATE POLICY "Users can delete their own watchlist items"
ON public.watchlists
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER handle_watchlist_update
BEFORE UPDATE ON public.watchlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();