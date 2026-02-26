-- Rate limiting function: max 5 submissions per IP per hour.
-- Uses SECURITY DEFINER so the anon role can call it without read access on the table.
create or replace function public.check_rate_limit(p_ip inet)
returns boolean
language sql
security definer
stable
as $$
  select count(*) < 5
  from public.inquiries
  where ip_address = p_ip
    and created_at > now() - interval '1 hour';
$$;

-- Allow anon and authenticated roles to call this function
grant execute on function public.check_rate_limit(inet) to anon, authenticated;
