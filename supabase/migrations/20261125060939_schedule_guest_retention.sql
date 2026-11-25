create extension if not exists pg_cron;
select cron.schedule('englishquest-guest-retention','17 * * * *',$job$
  select public.purge_temporary_class_data();
  delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='englishquest-guest-retention')
    and end_time<now()-interval '10 days';
$job$);
