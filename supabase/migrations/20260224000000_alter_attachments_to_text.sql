-- Change attachments column from jsonb to text (stores file URL)
alter table public.inquiries
  alter column attachments drop default,
  alter column attachments type text using null,
  alter column attachments set default null;
