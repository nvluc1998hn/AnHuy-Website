create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin', 'editor')) default 'editor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references categories(id) on delete set null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric default 0,
  collection text,
  material text,
  size text,
  care_guide text,
  return_policy text,
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists product_categories (
  product_id uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (product_id, category_id)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  storage_provider text default 'cloudflare_r2',
  storage_bucket text default 'anhuy-assets',
  storage_key text not null,
  public_url text,
  alt text,
  is_primary boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists featured_sections (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists featured_section_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references featured_sections(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  label text,
  subtitle text,
  image_storage_provider text default 'cloudflare_r2',
  image_storage_bucket text default 'anhuy-assets',
  image_storage_key text,
  hover_image_storage_provider text default 'cloudflare_r2',
  hover_image_storage_bucket text default 'anhuy-assets',
  hover_image_storage_key text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  description text,
  desktop_storage_provider text default 'cloudflare_r2',
  desktop_storage_bucket text default 'anhuy-assets',
  desktop_storage_key text,
  mobile_storage_provider text default 'cloudflare_r2',
  mobile_storage_bucket text default 'anhuy-assets',
  mobile_storage_key text,
  cta_label text,
  cta_href text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  eyebrow text,
  title text not null,
  hero_storage_provider text default 'cloudflare_r2',
  hero_storage_bucket text default 'anhuy-assets',
  hero_storage_key text,
  hero_video_storage_provider text default 'cloudflare_r2',
  hero_video_storage_bucket text default 'anhuy-assets',
  hero_video_storage_key text,
  intro jsonb default '[]'::jsonb,
  quote text,
  quote_storage_provider text default 'cloudflare_r2',
  quote_storage_bucket text default 'anhuy-assets',
  quote_storage_key text,
  quote_video_storage_provider text default 'cloudflare_r2',
  quote_video_storage_bucket text default 'anhuy-assets',
  quote_video_storage_key text,
  status text check (status in ('draft', 'published')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists page_steps (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references content_pages(id) on delete cascade,
  title text not null,
  body text,
  icon text,
  image_storage_provider text default 'cloudflare_r2',
  image_storage_bucket text default 'anhuy-assets',
  image_storage_key text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists navigation_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  image_storage_provider text default 'cloudflare_r2',
  image_storage_bucket text default 'anhuy-assets',
  image_storage_key text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists navigation_items (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references navigation_groups(id) on delete cascade,
  label text not null,
  item_type text check (item_type in ('link', 'category', 'page')) default 'link',
  href text,
  category_id uuid references categories(id) on delete set null,
  page_id uuid references content_pages(id) on delete set null,
  image_storage_provider text default 'cloudflare_r2',
  image_storage_bucket text default 'anhuy-assets',
  image_storage_key text,
  is_heading boolean default false,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table navigation_items add column if not exists image_storage_provider text default 'cloudflare_r2';
alter table navigation_items add column if not exists image_storage_bucket text default 'anhuy-assets';
alter table navigation_items add column if not exists image_storage_key text;

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_storage_provider text default 'cloudflare_r2',
  image_storage_bucket text default 'anhuy-assets',
  image_storage_key text not null,
  alt text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  status text check (status in ('active', 'ordered', 'abandoned')) default 'active',
  currency text default 'VND',
  subtotal numeric default 0,
  discount_total numeric default 0,
  shipping_total numeric default 0,
  grand_total numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric not null default 0,
  line_total numeric not null default 0,
  product_name text,
  product_image_storage_provider text default 'cloudflare_r2',
  product_image_storage_bucket text default 'anhuy-assets',
  product_image_storage_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (cart_id, product_id)
);

create table if not exists cart_coupons (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  code text not null,
  discount_amount numeric default 0,
  created_at timestamptz default now()
);

create index if not exists idx_categories_parent_id on categories(parent_id);
create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_is_featured on products(is_featured);
create index if not exists idx_product_categories_category_id on product_categories(category_id);
create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_featured_section_items_section_id on featured_section_items(section_id);
create index if not exists idx_featured_section_items_product_id on featured_section_items(product_id);
create index if not exists idx_page_steps_page_id on page_steps(page_id);
create index if not exists idx_navigation_items_group_id on navigation_items(group_id);
create index if not exists idx_navigation_items_category_id on navigation_items(category_id);
create index if not exists idx_navigation_items_page_id on navigation_items(page_id);
create index if not exists idx_partners_is_active on partners(is_active);
create index if not exists idx_carts_user_id on carts(user_id);
create index if not exists idx_carts_session_id on carts(session_id);
create index if not exists idx_carts_status on carts(status);
create index if not exists idx_cart_items_cart_id on cart_items(cart_id);

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
for each row execute function set_updated_at();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at before update on categories
for each row execute function set_updated_at();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
for each row execute function set_updated_at();

drop trigger if exists trg_product_images_updated_at on product_images;
create trigger trg_product_images_updated_at before update on product_images
for each row execute function set_updated_at();

drop trigger if exists trg_featured_sections_updated_at on featured_sections;
create trigger trg_featured_sections_updated_at before update on featured_sections
for each row execute function set_updated_at();

drop trigger if exists trg_featured_section_items_updated_at on featured_section_items;
create trigger trg_featured_section_items_updated_at before update on featured_section_items
for each row execute function set_updated_at();

drop trigger if exists trg_hero_slides_updated_at on hero_slides;
create trigger trg_hero_slides_updated_at before update on hero_slides
for each row execute function set_updated_at();

drop trigger if exists trg_content_pages_updated_at on content_pages;
create trigger trg_content_pages_updated_at before update on content_pages
for each row execute function set_updated_at();

drop trigger if exists trg_page_steps_updated_at on page_steps;
create trigger trg_page_steps_updated_at before update on page_steps
for each row execute function set_updated_at();

drop trigger if exists trg_navigation_groups_updated_at on navigation_groups;
create trigger trg_navigation_groups_updated_at before update on navigation_groups
for each row execute function set_updated_at();

drop trigger if exists trg_navigation_items_updated_at on navigation_items;
create trigger trg_navigation_items_updated_at before update on navigation_items
for each row execute function set_updated_at();

drop trigger if exists trg_partners_updated_at on partners;
create trigger trg_partners_updated_at before update on partners
for each row execute function set_updated_at();

drop trigger if exists trg_carts_updated_at on carts;
create trigger trg_carts_updated_at before update on carts
for each row execute function set_updated_at();

drop trigger if exists trg_cart_items_updated_at on cart_items;
create trigger trg_cart_items_updated_at before update on cart_items
for each row execute function set_updated_at();

alter table categories enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table product_images enable row level security;
alter table navigation_groups enable row level security;
alter table navigation_items enable row level security;
alter table hero_slides enable row level security;
alter table featured_sections enable row level security;
alter table featured_section_items enable row level security;
alter table content_pages enable row level security;
alter table page_steps enable row level security;
alter table partners enable row level security;

drop policy if exists "Public can read active categories" on categories;
create policy "Public can read active categories"
on categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read published products" on products;
create policy "Public can read published products"
on products for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read product category links" on product_categories;
create policy "Public can read product category links"
on product_categories for select
to anon, authenticated
using (
  exists (
    select 1
    from products p
    where p.id = product_categories.product_id
      and p.status = 'published'
  )
);

drop policy if exists "Public can read published product images" on product_images;
create policy "Public can read published product images"
on product_images for select
to anon, authenticated
using (
  exists (
    select 1
    from products p
    where p.id = product_images.product_id
      and p.status = 'published'
  )
);

drop policy if exists "Public can read active navigation groups" on navigation_groups;
create policy "Public can read active navigation groups"
on navigation_groups for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active navigation items" on navigation_items;
create policy "Public can read active navigation items"
on navigation_items for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active hero slides" on hero_slides;
create policy "Public can read active hero slides"
on hero_slides for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active featured sections" on featured_sections;
create policy "Public can read active featured sections"
on featured_sections for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active featured section items" on featured_section_items;
create policy "Public can read active featured section items"
on featured_section_items for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read published content pages" on content_pages;
create policy "Public can read published content pages"
on content_pages for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read active page steps" on page_steps;
create policy "Public can read active page steps"
on page_steps for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active partners" on partners;
create policy "Public can read active partners"
on partners for select
to anon, authenticated
using (is_active = true);
