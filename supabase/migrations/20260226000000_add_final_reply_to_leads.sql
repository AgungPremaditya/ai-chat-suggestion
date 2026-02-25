-- Add final_reply column to leads table
-- Stores the actual reply sent to the inquiry (as opposed to recommended_reply which is AI-generated)
alter table public.leads
  add column final_reply text,
  add column replied_at timestamptz;
