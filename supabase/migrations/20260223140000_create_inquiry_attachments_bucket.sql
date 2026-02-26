-- Create storage bucket for inquiry attachments
insert into storage.buckets (id, name, public)
values ('inquiry-attachments', 'inquiry-attachments', true);

-- Allow anonymous and authenticated users to upload
create policy "Anyone can upload inquiry attachments"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'inquiry-attachments');

-- Allow anyone to read attachments
create policy "Anyone can read inquiry attachments"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'inquiry-attachments');
