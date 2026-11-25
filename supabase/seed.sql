-- ==============================================================================
-- Reference data seed. Run after schema.sql. Safe to re-run.
-- ==============================================================================

insert into public.departments (name, code, description) values
  ('Works & Services',        'WKS', 'Civil, plumbing and general building maintenance'),
  ('Electrical Services',     'ELC', 'Power, lighting and electrical installations'),
  ('ICT Services',            'ICT', 'Network, internet and computer facilities'),
  ('Estates & Environment',   'EST', 'Grounds, sanitation and pest control')
on conflict (name) do nothing;

insert into public.specializations (name, department_id) values
  ('Plumbing',          (select id from public.departments where code = 'WKS')),
  ('Carpentry',         (select id from public.departments where code = 'WKS')),
  ('Masonry & Painting',(select id from public.departments where code = 'WKS')),
  ('Electrical',        (select id from public.departments where code = 'ELC')),
  ('HVAC',              (select id from public.departments where code = 'ELC')),
  ('Networking',        (select id from public.departments where code = 'ICT')),
  ('Sanitation',        (select id from public.departments where code = 'EST'))
on conflict (name) do nothing;

insert into public.maintenance_categories (name, description, icon, department_id, specialization_id) values
  ('Plumbing',            'Leaks, blocked drains, taps, toilets, water supply', 'Droplets',
     (select id from public.departments where code = 'WKS'), (select id from public.specializations where name = 'Plumbing')),
  ('Electrical',          'Power outages, sockets, lighting, wiring',           'Zap',
     (select id from public.departments where code = 'ELC'), (select id from public.specializations where name = 'Electrical')),
  ('Furniture & Fittings','Beds, chairs, doors, windows, locks',                 'Armchair',
     (select id from public.departments where code = 'WKS'), (select id from public.specializations where name = 'Carpentry')),
  ('Air Conditioning',    'AC units, fans and ventilation',                     'Wind',
     (select id from public.departments where code = 'ELC'), (select id from public.specializations where name = 'HVAC')),
  ('Internet & Network',  'Wi-Fi, LAN ports and network access',                'Wifi',
     (select id from public.departments where code = 'ICT'), (select id from public.specializations where name = 'Networking')),
  ('Building Structure',  'Cracks, roof leaks, ceilings, painting',             'Building2',
     (select id from public.departments where code = 'WKS'), (select id from public.specializations where name = 'Masonry & Painting')),
  ('Sanitation & Pests',  'Waste, cleaning and pest control',                   'Trash2',
     (select id from public.departments where code = 'EST'), (select id from public.specializations where name = 'Sanitation'))
on conflict (name) do nothing;

insert into public.buildings (name, code, type, description) values
  ('Hostel Block A',        'HBA', 'HOSTEL',         'Male hostel'),
  ('Hostel Block B',        'HBB', 'HOSTEL',         'Female hostel'),
  ('Faculty of Science',    'FOS', 'ACADEMIC',       'Lecture halls and laboratories'),
  ('Main Library',          'LIB', 'ACADEMIC',       'Central library'),
  ('Senate Building',       'SEN', 'ADMINISTRATIVE', 'Administrative offices'),
  ('Sports Complex',        'SPC', 'SPORTS',         'Gym, courts and pitch')
on conflict (name) do nothing;

insert into public.locations (building_id, name, type, floor)
select b.id, l.name, l.type, l.floor
from (values
  ('HBA', 'Room 101', 'ROOM', 'Ground'), ('HBA', 'Room 102', 'ROOM', 'Ground'),
  ('HBA', 'Room 201', 'ROOM', 'First'),  ('HBA', 'Common Room', 'FACILITY', 'Ground'),
  ('HBA', 'Shared Bathroom - Ground', 'FACILITY', 'Ground'),
  ('HBB', 'Room 101', 'ROOM', 'Ground'), ('HBB', 'Room 202', 'ROOM', 'First'),
  ('HBB', 'Laundry Room', 'FACILITY', 'Ground'),
  ('FOS', 'Lecture Theatre 1', 'FACILITY', 'Ground'), ('FOS', 'Chemistry Lab', 'FACILITY', 'First'),
  ('LIB', 'Reading Hall', 'AREA', 'First'), ('LIB', 'E-Library', 'FACILITY', 'Ground'),
  ('SEN', 'Registry', 'FACILITY', 'Ground'),
  ('SPC', 'Gymnasium', 'FACILITY', 'Ground'), ('SPC', 'Changing Rooms', 'FACILITY', 'Ground')
) as l(code, name, type, floor)
join public.buildings b on b.code = l.code
on conflict (building_id, name) do nothing;

-- ------------------------------------------------------------------------------
-- BOOTSTRAP THE FIRST ADMINISTRATOR
-- 1. Register normally through the app (or Dashboard -> Authentication -> Add user).
-- 2. Run (replace the email):
--
--   update public.profiles set role = 'ADMIN' where email = 'admin@cosmopolitan.edu.ng';
--   insert into public.staff_profiles (user_id)
--     select id from public.profiles where email = 'admin@cosmopolitan.edu.ng' on conflict do nothing;
--
-- All further supervisors/technicians/admins can then be created from the
-- Administrator > Users page (requires the admin-users Edge Function).
-- ------------------------------------------------------------------------------
