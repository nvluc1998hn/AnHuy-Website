alter table public.products
add column if not exists care_guide text,
add column if not exists return_policy text;

comment on column public.products.care_guide is 'Product care guide displayed in product detail accordion.';
comment on column public.products.return_policy is 'Product return policy displayed in product detail accordion.';
