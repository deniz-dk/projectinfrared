-- Project Infrared: privacy policy follow-up (run once in Supabase → SQL Editor)
-- When someone deletes their account, also strip their email from any feedback
-- they sent, so the feedback that's kept can't be tied back to them.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  update public.feedback set email = null where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
