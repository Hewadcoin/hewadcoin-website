-- Replace legacy sequential-looking member card numbers with unique random eight-digit numbers.
-- The unique index and advisory-locked generator prevent collisions.
update public.profiles
set card_number = private.generate_unique_member_card_number()
where card_number is not null and btrim(card_number) <> '';
