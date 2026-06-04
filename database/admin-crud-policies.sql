begin;

-- Admin/editor role is stored in public.profiles.
-- This function is security definer so policies can safely check profiles even when RLS is enabled.
create or replace function public.is_admin_or_editor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
  );
$$;

grant execute on function public.is_admin_or_editor() to authenticated;
grant usage on schema public to anon, authenticated;

do $$
declare
  all_tables text[] := array[
    'profiles',
    'categories',
    'products',
    'product_categories',
    'product_images',
    'featured_sections',
    'featured_section_items',
    'hero_slides',
    'content_pages',
    'page_steps',
    'navigation_groups',
    'navigation_items',
    'partners',
    'carts',
    'cart_items',
    'cart_coupons'
  ];
  public_read_tables text[] := array[
    'categories',
    'products',
    'product_categories',
    'product_images',
    'featured_sections',
    'featured_section_items',
    'hero_slides',
    'content_pages',
    'page_steps',
    'navigation_groups',
    'navigation_items',
    'partners'
  ];
  table_name text;
begin
  foreach table_name in array all_tables loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);

    execute format('drop policy if exists "Public can read %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Admins can read %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Admins can insert %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Admins can update %s" on public.%I', table_name, table_name);
    execute format('drop policy if exists "Admins can delete %s" on public.%I', table_name, table_name);

    if table_name = any(public_read_tables) then
      execute format('grant select on public.%I to anon', table_name);

      execute format(
        'create policy "Public can read %s" on public.%I for select to anon, authenticated using (true)',
        table_name,
        table_name
      );
    end if;

    execute format(
      'create policy "Admins can read %s" on public.%I for select to authenticated using (public.is_admin_or_editor())',
      table_name,
      table_name
    );

    execute format(
      'create policy "Admins can insert %s" on public.%I for insert to authenticated with check (public.is_admin_or_editor())',
      table_name,
      table_name
    );

    execute format(
      'create policy "Admins can update %s" on public.%I for update to authenticated using (public.is_admin_or_editor()) with check (public.is_admin_or_editor())',
      table_name,
      table_name
    );

    execute format(
      'create policy "Admins can delete %s" on public.%I for delete to authenticated using (public.is_admin_or_editor())',
      table_name,
      table_name
    );
  end loop;
end $$;

-- Keep this insert/update helper for the admin account you use to log in.
-- Replace the email, run once, then log out and log in again on the admin page.
-- insert into public.profiles (id, full_name, role)
-- select id, email, 'admin'
-- from auth.users
-- where email = 'EMAIL_DANG_LOGIN_CUA_BAN'
-- on conflict (id)
-- do update set role = 'admin';

commit;
