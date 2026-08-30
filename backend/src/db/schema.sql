create table if not exists jobs (
  job_id text primary key,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed')),
  request text not null,
  generated_prompt text not null default '',
  image_url text,
  error text,
  created_at text not null,
  updated_at text not null
);

create index if not exists jobs_created_at_idx on jobs (created_at desc);
