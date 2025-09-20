create extension if not exists pgcrypto;

begin;

-- Drop existing foreign keys to allow type updates
alter table if exists public.events drop constraint if exists events_organizer_id_fkey;
alter table if exists public.events drop constraint if exists events_organizer_id_users_id_fk;
alter table if exists public.event_registrations drop constraint if exists event_registrations_event_id_fkey;
alter table if exists public.event_registrations drop constraint if exists event_registrations_event_id_events_id_fk;
alter table if exists public.event_registrations drop constraint if exists event_registrations_user_id_fkey;
alter table if exists public.event_registrations drop constraint if exists event_registrations_user_id_users_id_fk;
alter table if exists public.courses drop constraint if exists courses_instructor_id_fkey;
alter table if exists public.courses drop constraint if exists courses_instructor_id_users_id_fk;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_course_id_fkey;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_course_id_courses_id_fk;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_user_id_fkey;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_user_id_users_id_fk;
alter table if exists public.projects drop constraint if exists projects_creator_id_fkey;
alter table if exists public.projects drop constraint if exists projects_creator_id_users_id_fk;
alter table if exists public.donations drop constraint if exists donations_project_id_fkey;
alter table if exists public.donations drop constraint if exists donations_project_id_projects_id_fk;
alter table if exists public.donations drop constraint if exists donations_user_id_fkey;
alter table if exists public.donations drop constraint if exists donations_user_id_users_id_fk;
alter table if exists public.artist_profiles drop constraint if exists artist_profiles_user_id_fkey;
alter table if exists public.artist_profiles drop constraint if exists artist_profiles_user_id_users_id_fk;
alter table if exists public.messages drop constraint if exists messages_sender_id_fkey;
alter table if exists public.messages drop constraint if exists messages_sender_id_users_id_fk;
alter table if exists public.messages drop constraint if exists messages_recipient_id_fkey;
alter table if exists public.messages drop constraint if exists messages_recipient_id_users_id_fk;
alter table if exists public.bookings drop constraint if exists bookings_accommodation_id_fkey;
alter table if exists public.bookings drop constraint if exists bookings_accommodation_id_accommodations_id_fk;
alter table if exists public.bookings drop constraint if exists bookings_user_id_fkey;
alter table if exists public.bookings drop constraint if exists bookings_user_id_users_id_fk;

create temporary table if not exists temp_invalid_users on commit drop as
select id as old_id, gen_random_uuid() as new_id
from public.users
where id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

update public.users u
set id = tmp.new_id::text
from temp_invalid_users tmp
where u.id = tmp.old_id;

update public.artist_profiles ap
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where ap.user_id = tmp.old_id;

update public.bookings b
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where b.user_id = tmp.old_id;

update public.course_enrollments ce
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where ce.user_id = tmp.old_id;

update public.courses c
set instructor_id = tmp.new_id::text
from temp_invalid_users tmp
where c.instructor_id = tmp.old_id;

update public.donations d
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where d.user_id = tmp.old_id;

update public.event_registrations er
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where er.user_id = tmp.old_id;

update public.events e
set organizer_id = tmp.new_id::text
from temp_invalid_users tmp
where e.organizer_id = tmp.old_id;

update public.messages m
set sender_id = tmp.new_id::text
from temp_invalid_users tmp
where m.sender_id = tmp.old_id;

update public.messages m
set recipient_id = tmp.new_id::text
from temp_invalid_users tmp
where m.recipient_id = tmp.old_id;

update public.messages m
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where m.user_id = tmp.old_id;

update public.projects p
set creator_id = tmp.new_id::text
from temp_invalid_users tmp
where p.creator_id = tmp.old_id;

update public.ticket_claims tc
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where tc.user_id = tmp.old_id;

update public.user_memberships um
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where um.user_id = tmp.old_id;

update public.game_events ge
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where ge.user_id = tmp.old_id;

update public.game_inventory gi
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where gi.user_id = tmp.old_id;

update public.game_leaderboard gl
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where gl.user_id = tmp.old_id;

update public.game_profiles gp
set user_id = tmp.new_id::text
from temp_invalid_users tmp
where gp.user_id = tmp.old_id;

-- Convert primary/foreign key columns to native UUID
alter table if exists public.users
  alter column id type uuid using nullif(id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.events
  alter column id type uuid using nullif(id, '')::uuid,
  alter column organizer_id type uuid using nullif(organizer_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.event_registrations
  alter column id type uuid using nullif(id, '')::uuid,
  alter column event_id type uuid using nullif(event_id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.courses
  alter column id type uuid using nullif(id, '')::uuid,
  alter column instructor_id type uuid using nullif(instructor_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.course_enrollments
  alter column id type uuid using nullif(id, '')::uuid,
  alter column course_id type uuid using nullif(course_id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.projects
  alter column id type uuid using nullif(id, '')::uuid,
  alter column creator_id type uuid using nullif(creator_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.donations
  alter column id type uuid using nullif(id, '')::uuid,
  alter column project_id type uuid using nullif(project_id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.artist_profiles
  alter column id type uuid using nullif(id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.messages
  alter column id type uuid using nullif(id, '')::uuid,
  alter column sender_id type uuid using nullif(sender_id, '')::uuid,
  alter column recipient_id type uuid using nullif(recipient_id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.accommodations
  alter column id type uuid using nullif(id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.bookings
  alter column id type uuid using nullif(id, '')::uuid,
  alter column accommodation_id type uuid using nullif(accommodation_id, '')::uuid,
  alter column user_id type uuid using nullif(user_id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.resources
  alter column id type uuid using nullif(id, '')::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.ticket_claims
  alter column user_id type uuid using nullif(user_id, '')::uuid;

alter table if exists public.user_memberships
  alter column user_id type uuid using nullif(user_id, '')::uuid;

alter table if exists public.game_events
  alter column user_id type uuid using nullif(user_id, '')::uuid;

alter table if exists public.game_inventory
  alter column user_id type uuid using nullif(user_id, '')::uuid;

alter table if exists public.game_leaderboard
  alter column user_id type uuid using nullif(user_id, '')::uuid;

alter table if exists public.game_profiles
  alter column user_id type uuid using nullif(user_id, '')::uuid;

-- Re-create foreign keys with updated types
alter table if exists public.events
  add constraint events_organizer_id_users_id_fk foreign key (organizer_id) references public.users(id);

alter table if exists public.event_registrations
  add constraint event_registrations_event_id_events_id_fk foreign key (event_id) references public.events(id),
  add constraint event_registrations_user_id_users_id_fk foreign key (user_id) references public.users(id);

alter table if exists public.courses
  add constraint courses_instructor_id_users_id_fk foreign key (instructor_id) references public.users(id);

alter table if exists public.course_enrollments
  add constraint course_enrollments_course_id_courses_id_fk foreign key (course_id) references public.courses(id),
  add constraint course_enrollments_user_id_users_id_fk foreign key (user_id) references public.users(id);

alter table if exists public.projects
  add constraint projects_creator_id_users_id_fk foreign key (creator_id) references public.users(id);

alter table if exists public.donations
  add constraint donations_project_id_projects_id_fk foreign key (project_id) references public.projects(id),
  add constraint donations_user_id_users_id_fk foreign key (user_id) references public.users(id);

alter table if exists public.artist_profiles
  add constraint artist_profiles_user_id_users_id_fk foreign key (user_id) references public.users(id);

alter table if exists public.messages
  add constraint messages_sender_id_users_id_fk foreign key (sender_id) references public.users(id),
  add constraint messages_recipient_id_users_id_fk foreign key (recipient_id) references public.users(id);

alter table if exists public.bookings
  add constraint bookings_accommodation_id_accommodations_id_fk foreign key (accommodation_id) references public.accommodations(id),
  add constraint bookings_user_id_users_id_fk foreign key (user_id) references public.users(id);

commit;
