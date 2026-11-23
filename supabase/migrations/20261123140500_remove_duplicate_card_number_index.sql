-- Remove redundant duplicate card-number index; the original unique index already enforces uniqueness.
drop index if exists public.profiles_card_number_unique_idx;
