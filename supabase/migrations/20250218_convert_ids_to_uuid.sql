begin;

-- Drop existing foreign keys to allow type updates
alter table if exists public.events drop constraint if exists events_organizer_id_fkey;
alter table if exists public.event_registrations drop constraint if exists event_registrations_event_id_fkey;
alter table if exists public.event_registrations drop constraint if exists event_registrations_user_id_fkey;
alter table if exists public.courses drop constraint if exists courses_instructor_id_fkey;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_course_id_fkey;
alter table if exists public.course_enrollments drop constraint if exists course_enrollments_user_id_fkey;
alter table if exists public.projects drop constraint if exists projects_creator_id_fkey;
alter table if exists public.donations drop constraint if exists donations_project_id_fkey;
alter table if exists public.donations drop constraint if exists donations_user_id_fkey;
alter table if exists public.artist_profiles drop constraint if exists artist_profiles_user_id_fkey;
alter table if exists public.messages drop constraint if exists messages_sender_id_fkey;
alter table if exists public.messages drop constraint if exists messages_recipient_id_fkey;
alter table if exists public.bookings drop constraint if exists bookings_accommodation_id_fkey;
alter table if exists public.bookings drop constraint if exists bookings_user_id_fkey;

-- Convert primary/foreign key columns to native UUID
alter table if exists public.users
  alter column id type uuid using id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.events
  alter column id type uuid using id::uuid,
  alter column organizer_id type uuid using organizer_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.event_registrations
  alter column id type uuid using id::uuid,
  alter column event_id type uuid using event_id::uuid,
  alter column user_id type uuid using user_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.courses
  alter column id type uuid using id::uuid,
  alter column instructor_id type uuid using instructor_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.course_enrollments
  alter column id type uuid using id::uuid,
  alter column course_id type uuid using course_id::uuid,
  alter column user_id type uuid using user_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.projects
  alter column id type uuid using id::uuid,
  alter column creator_id type uuid using creator_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.donations
  alter column id type uuid using id::uuid,
  alter column project_id type uuid using project_id::uuid,
  alter column user_id type uuid using user_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.artist_profiles
  alter column id type uuid using id::uuid,
  alter column user_id type uuid using user_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.messages
  alter column id type uuid using id::uuid,
  alter column sender_id type uuid using sender_id::uuid,
  alter column recipient_id type uuid using recipient_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.accommodations
  alter column id type uuid using id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.bookings
  alter column id type uuid using id::uuid,
  alter column accommodation_id type uuid using accommodation_id::uuid,
  alter column user_id type uuid using user_id::uuid,
  alter column id set default gen_random_uuid();

alter table if exists public.resources
  alter column id type uuid using id::uuid,
  alter column id set default gen_random_uuid();

-- Re-create foreign keys with updated types
alter table if exists public.events
  add constraint events_organizer_id_fkey foreign key (organizer_id) references public.users(id);

alter table if exists public.event_registrations
  add constraint event_registrations_event_id_fkey foreign key (event_id) references public.events(id),
  add constraint event_registrations_user_id_fkey foreign key (user_id) references public.users(id);

alter table if exists public.courses
  add constraint courses_instructor_id_fkey foreign key (instructor_id) references public.users(id);

alter table if exists public.course_enrollments
  add constraint course_enrollments_course_id_fkey foreign key (course_id) references public.courses(id),
  add constraint course_enrollments_user_id_fkey foreign key (user_id) references public.users(id);

alter table if exists public.projects
  add constraint projects_creator_id_fkey foreign key (creator_id) references public.users(id);

alter table if exists public.donations
  add constraint donations_project_id_fkey foreign key (project_id) references public.projects(id),
  add constraint donations_user_id_fkey foreign key (user_id) references public.users(id);

alter table if exists public.artist_profiles
  add constraint artist_profiles_user_id_fkey foreign key (user_id) references public.users(id);

alter table if exists public.messages
  add constraint messages_sender_id_fkey foreign key (sender_id) references public.users(id),
  add constraint messages_recipient_id_fkey foreign key (recipient_id) references public.users(id);

alter table if exists public.bookings
  add constraint bookings_accommodation_id_fkey foreign key (accommodation_id) references public.accommodations(id),
  add constraint bookings_user_id_fkey foreign key (user_id) references public.users(id);

commit;
