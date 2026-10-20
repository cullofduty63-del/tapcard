-- LumoCard secure game engine. Run in Supabase SQL Editor after loyalty-games-schema.sql.
-- Prize outcomes and stock changes happen in PostgreSQL, not in browser JavaScript.
create extension if not exists pgcrypto;

insert into public.prize_games (name, slug, description, is_active)
values
 ('تاس شانس','dice','تاس بنداز و نتیجه را ببین',false),
 ('تخم‌مرغ شانسی','egg','یک تخم‌مرغ انتخاب کن',false),
 ('گردونه شانس','wheel','گردونه جایزه',false),
 ('جعبه جایزه','box','یکی از جعبه‌ها را باز کن',false),
 ('کارت خراشیدنی','scratch','کارت جایزه',false),
 ('پاکت شانس','envelope','یک پاکت انتخاب کن',false),
 ('بادکنک جایزه','balloon','یک بادکنک انتخاب کن',false),
 ('صندوق رمزدار','safe','صندوق جایزه',false),
 ('شیر یا خط','coin','سکه بنداز',false),
 ('هدف شانسی','target','یک هدف انتخاب کن',false),
 ('ماشین جایزه','slot','ماشین نمادها',false)
on conflict (slug) do nothing;

create or replace function public.play_lumocard_game(p_game_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_game public.prize_games%rowtype;
  v_prize public.prizes%rowtype;
  v_roll numeric;
  v_running numeric := 0;
  v_total numeric := 0;
  v_play_id uuid;
  v_selected boolean := false;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED' using errcode = '28000';
  end if;

  select * into v_game
  from public.prize_games
  where slug = p_game_slug and is_active = true;

  if not found then
    raise exception 'GAME_NOT_CONFIGURED' using errcode = 'P0001';
  end if;

  -- Ignore inactive prizes and exhausted inventory. Each probability is a percentage.
  select coalesce(sum(probability), 0) into v_total
  from public.prizes
  where game_id = v_game.id
    and is_active = true
    and (stock is null or stock > 0);

  if v_total > 100 then
    raise exception 'INVALID_PRIZE_PROBABILITIES' using errcode = 'P0001';
  end if;

  v_roll := random() * 100;
  for v_prize in
    select * from public.prizes
    where game_id = v_game.id
      and is_active = true
      and probability > 0
      and (stock is null or stock > 0)
    order by created_at, id
  loop
    v_running := v_running + v_prize.probability;
    if v_roll < v_running then
      v_selected := true;
      -- Atomic inventory decrement prevents two requests taking the last item.
      update public.prizes
      set stock = stock - 1
      where id = v_prize.id and stock is not null and stock > 0;
      if v_prize.stock is not null and not found then
        v_prize.id := null;
      end if;
      exit;
    end if;
  end loop;

  if not v_selected then
    v_prize.id := null;
  end if;

  insert into public.game_plays(user_id, game_id, prize_id, status)
  values (v_user, v_game.id, v_prize.id,
          case when v_prize.id is null then 'lost' else 'won' end)
  returning id into v_play_id;

  if v_prize.id is null then
    return jsonb_build_object('play_id', v_play_id, 'status', 'lost', 'message', 'این بار جایزه‌ای برنده نشدی.');
  end if;
  return jsonb_build_object('play_id', v_play_id, 'status', 'won', 'prize_name', v_prize.name, 'message', 'تبریک!');
end;
$$;

revoke all on function public.play_lumocard_game(text) from public, anon;
grant execute on function public.play_lumocard_game(text) to authenticated;

-- No direct client writes to reward-critical tables. Keep reads governed by the SELECT policies
-- created in the previous migration. Server-side code may use a carefully protected service role.
revoke insert, update, delete on public.game_plays from anon, authenticated;
revoke insert, update, delete on public.prizes from anon, authenticated;
revoke insert, update, delete on public.prize_games from anon, authenticated;
revoke insert, update, delete on public.loyalty_accounts from anon, authenticated;
revoke insert, update, delete on public.loyalty_transactions from anon, authenticated;
revoke insert, update, delete on public.store_orders from anon, authenticated;
revoke insert, update, delete on public.store_order_items from anon, authenticated;
