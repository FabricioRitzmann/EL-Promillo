-- Ensure anonymized scan statistics view exists for frontend consumption.
-- No PII is exposed: only aggregated counters plus pass metadata.

create or replace view public.business_scan_stats_anonymized as
select
  e.business_user_id,
  e.pass_id,
  p.title as pass_title,
  p.business_name,
  p.business_category,
  count(*)::bigint as total_events,
  count(distinct i.customer_reference_hash)::bigint as unique_customers,
  coalesce(sum(case when e.event_type = 'stamp' then 1 else 0 end), 0)::bigint as stamp_events,
  coalesce(sum(case when e.event_type = 'points' then e.points_delta else 0 end), 0)::bigint as total_points_delta,
  max(e.occurred_at) as last_event_at
from public.pass_scan_events e
join public.wallet_pass_instances i on i.id = e.pass_instance_id
join public.wallet_passes p on p.id = e.pass_id
group by e.business_user_id, e.pass_id, p.title, p.business_name, p.business_category;

grant select on public.business_scan_stats_anonymized to authenticated;

-- Refresh PostgREST schema cache (Supabase API)
notify pgrst, 'reload schema';
