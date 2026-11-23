-- Store the manually entered district for KYC residence details.
alter table public.kyc_applications
  add column if not exists district text;
