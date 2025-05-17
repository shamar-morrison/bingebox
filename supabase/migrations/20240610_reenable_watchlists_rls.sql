ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watchlist items"
  ON public.watchlists
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own watchlist items"
  ON public.watchlists
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own watchlist items"
  ON public.watchlists
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own watchlist items"
  ON public.watchlists
  FOR DELETE
  USING (auth.uid()::text = user_id);
