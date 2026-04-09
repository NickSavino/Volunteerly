-- Volunteerly Seed File
-- Run with: npm run db:reset -w server



--Purge existing data in supabase

DO $cleanup$
BEGIN
    EXECUTE 'TRUNCATE TABLE 
        public.chat_messages,
        public.chat_conversations,
        public.chat_conversation_participants,
        public.volunteer_reports,
        public.tickets,
        public.reviews,
        public.progress_updates,
        public.applications,
        public.skill_nodes,
        public.skill_trees,
        public.volunteer_skill_profiles,
        public.opportunities,
        public.volunteers,
        public.organizations,
        public.moderators,
        public.users,
        public."RegisteredCharity",
        public.flags,
        public.opportunity_skills,
        public.volunteer_work_experiences,
        public.volunteer_educations
        RESTART IDENTITY CASCADE';
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Cleanup skipped: %', SQLERRM;
END $cleanup$;

DELETE FROM auth.users WHERE email IN (
    'volunteer1@test.com',
    'volunteer2@test.com',
    'org1@test.com',
    'org2@test.com',
    'org3@test.com',
    'mod1@test.com'
);

DO $$
DECLARE
    vol1_id      UUID;
    vol2_id      UUID;
    org1_id      UUID;
    org2_id      UUID;
    org3_id      UUID;
    mod1_id      UUID;

    opp1_id      UUID := 'a0000000-0000-4000-8000-000000000201';
    opp2_id      UUID := 'a0000000-0000-4000-8000-000000000202';
    opp3_id      UUID := 'a0000000-0000-4000-8000-000000000203';
    opp4_id      UUID := 'a0000000-0000-4000-8000-000000000204';
    opp5_id      UUID := 'a0000000-0000-4000-8000-000000000205';
    opp6_id      UUID := 'a0000000-0000-4000-8000-000000000206';

    app1_id      UUID := 'a0000000-0000-4000-8000-000000000301';
    app2_id      UUID := 'a0000000-0000-4000-8000-000000000302';
    app3_id      UUID := 'a0000000-0000-4000-8000-000000000303';

    tree1_id     UUID := 'a0000000-0000-4000-8000-000000000401';
    node1_id     UUID := 'a0000000-0000-4000-8000-000000000501';
    node2_id     UUID := 'a0000000-0000-4000-8000-000000000502';

    conv1_id UUID := 'a0000000-0000-4000-8000-000000000601';

    ticket1_id   UUID := 'a0000000-0000-4000-8000-000000000701';
    ticket2_id   UUID := 'a0000000-0000-4000-8000-000000000702';
    ticket3_id   UUID := 'a0000000-0000-4000-8000-000000000703';
    ticket4_id   UUID := 'a0000000-0000-4000-8000-000000000704';
    ticket5_id   UUID := 'a0000000-0000-4000-8000-000000000705';
    ticket6_id   UUID := 'a0000000-0000-4000-8000-000000000706';

    ticket_conv1_id UUID := 'a0000000-0000-4000-8000-000000000801';
    ticket_conv2_id UUID := 'a0000000-0000-4000-8000-000000000802';
    ticket_conv3_id UUID := 'a0000000-0000-4000-8000-000000000803';
    ticket_conv4_id UUID := 'a0000000-0000-4000-8000-000000000804';

    review1_id   UUID := 'a0000000-0000-4000-8000-000000000901';
    review2_id   UUID := 'a0000000-0000-4000-8000-000000000902';
    flag1_id     UUID := 'a0000000-0000-4000-8000-000000001001';
    progress1_id UUID := 'a0000000-0000-4000-8000-000000001101';
    progress2_id UUID := 'a0000000-0000-4000-8000-000000001102';
    progress3_id UUID := 'a0000000-0000-4000-8000-000000001103';
    progress4_id UUID := 'a0000000-0000-4000-8000-000000001104';
    progress5_id UUID := 'a0000000-0000-4000-8000-000000001105';
    progress6_id UUID := 'a0000000-0000-4000-8000-000000001106';
    progress7_id UUID := 'a0000000-0000-4000-8000-000000001107';
    progress8_id UUID := 'a0000000-0000-4000-8000-000000001108';
    progress9_id UUID := 'a0000000-0000-4000-8000-000000001109';
    
    work_exp1_id  UUID := 'a0000000-0000-4000-8000-000000001002';
    work_exp2_id  UUID := 'a0000000-0000-4000-8000-000000001003';
    work_exp3_id  UUID := 'a0000000-0000-4000-8000-000000001004';

    education1_id UUID := 'a0000000-0000-4000-8000-000000001005';
    education2_id UUID := 'a0000000-0000-4000-8000-000000001006';
    education3_id UUID := 'a0000000-0000-4000-8000-000000001007';

    vol_skill1_id UUID := 'a0000000-0000-4000-8000-000000001008';
    vol_skill2_id UUID := 'a0000000-0000-4000-8000-000000001009';

    report1_id UUID := 'a0000000-0000-4000-8000-000000001201';
    report2_id UUID := 'a0000000-0000-4000-8000-000000001202';
    report3_id UUID := 'a0000000-0000-4000-8000-000000001203';
BEGIN

--Auth Users
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'volunteer1@test.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'volunteer2@test.com', crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'org1@test.com',       crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'org2@test.com',       crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'org3@test.com',       crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', ''),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'mod1@test.com',       crypt('password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), 'authenticated', 'authenticated', '', '', '', '');

--Grab the IDs
SELECT id INTO vol1_id FROM auth.users WHERE email = 'volunteer1@test.com';
SELECT id INTO vol2_id FROM auth.users WHERE email = 'volunteer2@test.com';
SELECT id INTO org1_id FROM auth.users WHERE email = 'org1@test.com';
SELECT id INTO org2_id FROM auth.users WHERE email = 'org2@test.com';
SELECT id INTO org3_id FROM auth.users WHERE email = 'org3@test.com';
SELECT id INTO mod1_id FROM auth.users WHERE email = 'mod1@test.com';

--Update public users roles
UPDATE public.users SET role = 'VOLUNTEER',    status = 'VERIFIED' WHERE id = vol1_id::text;
UPDATE public.users SET role = 'VOLUNTEER',    status = 'VERIFIED' WHERE id = vol2_id::text;
UPDATE public.users SET role = 'ORGANIZATION', status = 'VERIFIED' WHERE id = org1_id::text;
UPDATE public.users SET role = 'ORGANIZATION', status = 'VERIFIED' WHERE id = org2_id::text;
UPDATE public.users SET role = 'ORGANIZATION', status = 'VERIFIED' WHERE id = org3_id::text;
UPDATE public.users SET role = 'MODERATOR',    status = 'VERIFIED' WHERE id = mod1_id::text;

--Insert Moderator
INSERT INTO public.moderators (id, first_name, last_name)
VALUES (mod1_id::text, 'Admin', 'Moderator');

--Insert Organizations
INSERT INTO public.organizations (id, org_name, status, charity_num, doc_id, contact_name, contact_email, contact_num, hq_adr, mission_statement, cause_category, website, impact_highlights)
VALUES
    (org1_id::text, 'Red Cross International', 'VERIFIED', 123456788, 'organization-documents/org_' || org1_id::text || '.pdf',  'Jane Smith', 'jane@redcross.org',        '403-555-0101', '2609 15 St NE, Calgary, AB, Canada, T2E 8Y2',   'Providing humanitarian aid worldwide.',     'Humanitarian', 'https://redcross.org',   '[{"countries served": 42}, {"people helped": 12400}]'),
    (org2_id::text, 'World United',  'VERIFIED', 654321432, 'organization-documents/org_' || org2_id::text || '.pdf', 'Bob Green',  'bob@worldunited.org',       '403-555-0202', '5510 26 Ave NE, Calgary, AB, Canada, T1Y 6S1',  'Uniting the World one step at a time.',           'Humanitarian',  'https://worldunited.org', '[{"countries operated in": 12}, {"students helped": 3800}]'),
    (org3_id::text, 'The Mustard Seed',  'VERIFIED', 789012513,  'organization-documents/org_' || org3_id::text || '.pdf',   'Alice Dev',  'alice@theseed.org', '403-555-0303', '102 11 Ave SE, Calgary, AB, Canada, T2G 0X8', 'Ending Homelessness.', 'Poverty',    'https://tms.org',         '[{"meals served": 5200}, {"families housed": 300}]');

--Insert Volunteers 
INSERT INTO public.volunteers (id, first_name, last_name, location, bio, hourly_value, organizations_assisted, availability)
VALUES
    (vol1_id::text, 'Estelle', 'Bright', 'Calgary, AB', 'Passionate volunteer with a love for data.', 25, 2, '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]'),
    (vol2_id::text, 'Joshua',  'Bright', 'Calgary, AB', 'Software developer who loves giving back.',  30, 1, '["Monday", "Saturday", "Sunday"]');

--Insert Volunteer Skill Profiles
INSERT INTO public.volunteer_skill_profiles (vol_id, technical, non_technical, created_at)
VALUES
    (vol1_id::text, '["Python", "SQL", "Java", "JavaScript", "API Integration", "Data Pipelines", "REST API", "Salesforce", "React.js", "Data Quality Assurance"]', '["Collaboration", "Communication", "Adaptability", "Leadership", "Problem-Solving", "Time Management", "Data-Driven Decision Making", "Teamwork", "Strategic Thinking"]', '2026-04-08'),
    (vol2_id::text, '["Python", "SQL", "Excel VBA", "Java", "JavaScript", "HTML", "CSS", "Power BI", "Bloomberg", "FactSet"]', '["Financial Management", "Leadership", "Collaboration", "Communication", "Data Analysis", "Problem Solving", "Time Management", "Strategic Thinking", "Team Management", "Adaptability"]', '2026-04-07');


--Insert Opps
INSERT INTO public.opportunities (id, org_id, vol_id, status, name, category, description, candidate_desc, work_type, commitment_level, hours, length, posted_date, deadline_date, availability)
VALUES
    (opp1_id::text, org1_id::text, vol1_id::text, 'FILLED', 'Website Development',      'Web Dev',      'Create a website for our charity',          'Must have relevant seng experience.',     'IN_PERSON', 'PART_TIME', 30, '3 months', '2026-01-15', '2026-04-15', '["Monday", "Tuesday", "Wednesday"]'),
    (opp2_id::text, org2_id::text, vol1_id::text, 'FILLED', 'Dashboard Creation',       'Data Analytics','Create a dashboard for our stakeholders.',  'Analytics experience required.',          'IN_PERSON', 'FLEXIBLE',  32, 'Ongoing',  '2026-02-10', NULL,         '["Friday", "Saturday", "Sunday"]'),
    (opp3_id::text, org3_id::text, vol2_id::text, 'OPEN',   'Future Trend Analysis',    'Data Science', 'Predict our Q3 donation amounts.',           'Programming experience required.',        'HYBRID',    'PART_TIME', 0, '6 months', '2026-03-01', '2026-09-01', '["Monday", "Wednesday", "Friday"]'),
    (opp4_id::text, org1_id::text, NULL, 'OPEN',   'Tax Analyst',    'Accounting', 'Help streamline our tax flow',           'Accounting and/or finance experience required',        'HYBRID',    'PART_TIME', 0, 'Ongoing', '2026-04-10', '2026-09-01', '["Thursday", "Friday"]'),
    (opp5_id::text, org2_id::text, NULL, 'OPEN',   'Project Manager',    'Management', 'We need someone who has PM experience to help guide our new volunteers',           'Leadership and project management',        'IN_PERSON',    'FLEXIBLE', 0, '12 months', '2026-05-01', '2026-10-01', '["Monday"]'),
    (opp6_id::text, org3_id::text, NULL, 'OPEN',   'IT Developer',    'IT', 'We need an IT expert to help setup our infrastructure.',           'IT Experience (TCP/UDP)',        'IN_PERSON',    'PART_TIME', 0, '1 month', '2026-05-22', '2026-11-01', '["Wednesday", "Thursday"]');

--Insert Vol Work Experiences
INSERT INTO public.volunteer_work_experiences (id, vol_id, job_title, company, responsibilities, created_at, start_date, end_date)
VALUES
    (work_exp1_id::text, vol1_id::text, 'Data & AI Consultant', 'EY', 'Leverages AI to help drive decisions',   '2026-04-05',  '2025-03-05', '2026-02-10'),
    (work_exp2_id::text, vol2_id::text, 'Investment Banker', 'RBC', 'Create Excel dashboards',   '2026-04-05',  '2026-03-05', '2026-06-01'),
    (work_exp3_id::text, vol2_id::text, 'Data Science Associate', 'CTC', 'Develop machine learning models to forcast sales',   '2026-04-05',  '2026-05-04', NULL);

--Inset vol Educations
INSERT INTO public.volunteer_educations (id, vol_id, institution, degree, graduation_year, created_at)
VALUES
    (education1_id::text, vol1_id::text, 'University of Manitoba', 'Software Engineering', '2025',   '2026-04-05'),
    (education2_id::text, vol2_id::text, 'University of Saskatchewan', 'Finance', '2020',   '2026-04-05'),
    (education3_id::text, vol2_id::text, 'University of Guelph', 'Music Theory', '2026',   '2026-04-05');

--Applications
INSERT INTO public.applications (id, opp_id, vol_id, match_pct, message, date_applied)
VALUES
    (app1_id::text, opp3_id::text, vol1_id::text, 85, 'I have 5 years data science experience at google.', '2026-03-05'),
    (app2_id::text, opp1_id::text, vol2_id::text, 70, 'I have a degree in software engineering.',             '2026-01-20'),
    (app3_id::text, opp2_id::text, vol1_id::text, 90, 'I have extensive experience in data analytics.',       '2026-02-01');


--Progress Updates
INSERT INTO public.progress_updates (id, opportunity_id, sender_id, sender_role, title, description, hours_contributed, created_at)
VALUES
    (progress4_id::text, opp1_id::text, vol1_id::text, 'VOLUNTEER', 'Week 1 Update', 'Finished all the frontend pages', 3, '2026-01-04'),
    (progress3_id::text, opp1_id::text, vol1_id::text, 'VOLUNTEER', 'Week 1 Update', 'Finished all backend server functionality', 7, '2026-01-03'),
    (progress2_id::text, opp1_id::text, vol1_id::text, 'VOLUNTEER', 'Week 1 Update', 'Setup the backend server architecture', 2, '2026-01-02'),
    (progress1_id::text, opp1_id::text, vol1_id::text, 'VOLUNTEER', 'Week 1 Update', 'Completed figma designs', 8, '2026-01-02'),
    (progress5_id::text, opp1_id::text, vol1_id::text, 'VOLUNTEER', 'Week 2 Update', 'Created Unit tests and verified the completness of the project!', 10, '2026-01-05'),
    
    (progress6_id::text, opp2_id::text, vol2_id::text, 'VOLUNTEER', 'Week 1 Update', 'Implemented half of the requested charts', 8, '2026-02-10'),
    (progress7_id::text, opp2_id::text, vol2_id::text, 'VOLUNTEER', 'Week 1 Update', 'Finished the flow from the db to tableau', 10, '2026-02-09'),
    (progress8_id::text, opp2_id::text, vol2_id::text, 'VOLUNTEER', 'Week 1 Update', 'Created the base dashboard in tableau', 10, '2026-02-05'),
    (progress9_id::text, opp2_id::text, vol2_id::text, 'VOLUNTEER', 'Week 1 Update', 'Created a data cleaning pipeline', 4, '2026-02-02');


--Reviews
INSERT INTO public.reviews (id, issuer_id, reviewee_id, opportunity_id, rating)
VALUES
    (review1_id::text, org1_id::text, vol1_id::text, opp1_id::text, 4),
    (review2_id::text, vol1_id::text, org1_id::text, opp1_id::text, 3);

UPDATE public.volunteers SET average_rating = 4 WHERE id = vol1_id::text;

--Skill Trees and Nodes
INSERT INTO public.skill_trees (id, vol_id, type_of_tree, total_xp_needed, current_xp, num_of_nodes_completed)
VALUES
    (tree1_id::text, vol1_id::text, 'TECHNICAL', 1000, 250, 1);

INSERT INTO public.skill_nodes (id, skill_tree_id, skill_name, xp_required)
VALUES
    (node1_id::text, tree1_id::text, 'First Aid',   200),
    (node2_id::text, tree1_id::text, 'Programming', 300);

-- Direct Chat
INSERT INTO public.chat_conversations (
    id,
    kind,
    created_at,
    updated_at,
    last_message_at
)
VALUES
    (conv1_id::text, 'DIRECT', now(), now(), now());

INSERT INTO public.chat_conversation_participants (
    id,
    conversation_id,
    user_id,
    joined_at
)
VALUES
    (gen_random_uuid()::text, conv1_id::text, vol1_id::text, now()),
    (gen_random_uuid()::text, conv1_id::text, org1_id::text, now());

INSERT INTO public.chat_messages (
    id,
    conversation_id,
    sender_id,
    sender_display_name_snapshot,
    sender_role_snapshot,
    content,
    sent_at
)
VALUES
    (
        gen_random_uuid()::text,
        conv1_id::text,
        vol1_id::text,
        'Estelle Bright',
        'VOLUNTEER',
        'Hi, I am interested in the opportunity!',
        '2026-03-25 13:05:00'
    ),
    (
        gen_random_uuid()::text,
        conv1_id::text,
        org1_id::text,
        'Red Cross International',
        'ORGANIZATION',
        'Great! We would love to have you.',
        '2026-03-25 13:10:00'
    );
--Tickets
INSERT INTO public.tickets (
    id,
    issuer_id,
    target_id,
    category,
    title,
    description,
    urgency_rating,
    status,
    created_at
)
VALUES
    (
        ticket1_id::text,
        vol1_id::text,
        NULL,
        'BUG',
        'Cannot upload profile photo',
        'The upload button does nothing on Firefox.',
        'MODERATE',
        'OPEN',
        '2026-03-26 09:15:00'
    ),
    (
        ticket2_id::text,
        vol2_id::text,
        mod1_id::text,
        'ABUSE',
        'Organization sent inappropriate messages',
        'I received messages that were unprofessional and made me uncomfortable.',
        'SERIOUS',
        'OPEN',
        '2026-03-27 14:30:00'
    ),
    (
        ticket3_id::text,
        org1_id::text,
        NULL,
        'OTHER',
        'Need help updating private organization details',
        'We need our primary contact information updated and cannot edit it from the profile page.',
        'MINOR',
        'OPEN',
        '2026-03-28 11:00:00'
    ),
    (
        ticket4_id::text,
        org2_id::text,
        NULL,
        'BILLING',
        'Question about premium analytics charges',
        'We were expecting the monthly report to be included. Please clarify the current billing status.',
        'MODERATE',
        'CLOSED',
        '2026-03-20 10:45:00'
    ),
    (
        ticket5_id::text,
        vol1_id::text,
        NULL,
        'BUG',
        'Dashboard stats are not updating',
        'My completed opportunity hours have not changed since last week even after refreshing.',
        'MINOR',
        'CLOSED',
        '2026-03-18 16:20:00'
    ),
    (
        ticket6_id::text,
        org3_id::text,
        NULL,
        'OTHER',
        'Volunteer application page is confusing',
        'The applicant review flow is unclear and our staff is not sure how to proceed after opening an application.',
        'MINOR',
        'OPEN',
        '2026-03-29 08:10:00'
    );

-- Ticket Conversations
INSERT INTO public.chat_conversations (
    id,
    kind,
    ticket_id,
    created_at,
    updated_at,
    last_message_at
)
VALUES
    (ticket_conv1_id::text, 'TICKET', ticket1_id::text, '2026-03-26 09:15:00', '2026-03-26 10:05:00', '2026-03-26 10:05:00'),
    (ticket_conv2_id::text, 'TICKET', ticket2_id::text, '2026-03-27 14:30:00', '2026-03-27 15:00:00', '2026-03-27 15:00:00'),
    (ticket_conv3_id::text, 'TICKET', ticket3_id::text, '2026-03-28 11:00:00', '2026-03-28 11:20:00', '2026-03-28 11:20:00'),
    (ticket_conv4_id::text, 'TICKET', ticket4_id::text, '2026-03-20 10:45:00', '2026-03-21 09:15:00', '2026-03-21 09:15:00');

INSERT INTO public.chat_conversation_participants (
    id,
    conversation_id,
    user_id,
    joined_at,
    last_read_at
)
VALUES
    (gen_random_uuid()::text, ticket_conv1_id::text, vol1_id::text, '2026-03-26 09:15:00', '2026-03-26 10:10:00'),
    (gen_random_uuid()::text, ticket_conv1_id::text, mod1_id::text, '2026-03-26 09:15:00', '2026-03-26 10:10:00'),

    (gen_random_uuid()::text, ticket_conv2_id::text, vol2_id::text, '2026-03-27 14:30:00', '2026-03-27 15:05:00'),
    (gen_random_uuid()::text, ticket_conv2_id::text, mod1_id::text, '2026-03-27 14:30:00', '2026-03-27 15:05:00'),

    (gen_random_uuid()::text, ticket_conv3_id::text, org1_id::text, '2026-03-28 11:00:00', '2026-03-28 11:25:00'),
    (gen_random_uuid()::text, ticket_conv3_id::text, mod1_id::text, '2026-03-28 11:00:00', '2026-03-28 11:25:00'),

    (gen_random_uuid()::text, ticket_conv4_id::text, org2_id::text, '2026-03-20 10:45:00', '2026-03-21 09:20:00'),
    (gen_random_uuid()::text, ticket_conv4_id::text, mod1_id::text, '2026-03-20 10:45:00', '2026-03-21 09:20:00');

INSERT INTO public.chat_messages (
    id,
    conversation_id,
    sender_id,
    sender_display_name_snapshot,
    sender_role_snapshot,
    content,
    sent_at
)
VALUES
    (
        gen_random_uuid()::text,
        ticket_conv1_id::text,
        vol1_id::text,
        'Estelle Bright',
        'VOLUNTEER',
        'The upload button does nothing on Firefox.',
        '2026-03-26 09:16:00'
    ),
    (
        gen_random_uuid()::text,
        ticket_conv1_id::text,
        mod1_id::text,
        'Admin Moderator',
        'MODERATOR',
        'Thanks for reporting this. We are investigating the Firefox issue now.',
        '2026-03-26 10:05:00'
    ),

    (
        gen_random_uuid()::text,
        ticket_conv2_id::text,
        vol2_id::text,
        'Joshua Bright',
        'VOLUNTEER',
        'I received messages that made me uncomfortable.',
        '2026-03-27 14:32:00'
    ),
    (
        gen_random_uuid()::text,
        ticket_conv2_id::text,
        mod1_id::text,
        'Admin Moderator',
        'MODERATOR',
        'Understood. We have opened a review and will follow up shortly.',
        '2026-03-27 15:00:00'
    ),

    (
        gen_random_uuid()::text,
        ticket_conv3_id::text,
        org1_id::text,
        'Red Cross International',
        'ORGANIZATION',
        'We need our main contact information updated.',
        '2026-03-28 11:02:00'
    ),
    (
        gen_random_uuid()::text,
        ticket_conv3_id::text,
        mod1_id::text,
        'Admin Moderator',
        'MODERATOR',
        'Please send the new contact details here and we will update the record.',
        '2026-03-28 11:20:00'
    ),
    (
        gen_random_uuid()::text,
        ticket_conv4_id::text,
        org2_id::text,
        'World United',
        'ORGANIZATION',
        'Can you clarify the premium analytics charge on our invoice?',
        '2026-03-20 10:47:00'
    ),
    (
        gen_random_uuid()::text,
        ticket_conv4_id::text,
        mod1_id::text,
        'Admin Moderator',
        'MODERATOR',
        'We confirmed the charge and closed the ticket after follow-up.',
        '2026-03-21 09:15:00'
    );

-- Moderation Intake Flags
INSERT INTO public.flags (id, flag_issuer_id, flagged_user_id, reason, created_at)
VALUES
    (flag1_id::text, org1_id::text, vol2_id::text, 'Missed deadlines and stopped responding.', '2026-04-02 09:00:00'),
    (gen_random_uuid()::text, org2_id::text, vol1_id::text, 'Unprofessional communication during project handoff.', '2026-03-10 13:00:00'),
    (gen_random_uuid()::text, org1_id::text, vol2_id::text, 'Repeated no-show after prior warning.', '2026-04-05 11:30:00');

-- Volunteer Reports
INSERT INTO public.volunteer_reports (
    id,
    reason,
    details,
    severity,
    is_open,
    action_taken,
    moderator_note,
    suspension_until,
    resolved_at,
    reported_user_id,
    reporting_user_id,
    moderated_by_id,
    created_at,
    updated_at
)
VALUES
    (
        report1_id::text,
        'Missed deadlines and stopped responding.',
        'Volunteer stopped replying after committing to deliverables for a scheduled engagement.',
        'SERIOUS',
        true,
        NULL,
        '',
        NULL,
        NULL,
        vol2_id::text,
        org1_id::text,
        NULL,
        '2026-04-02 09:00:00',
        '2026-04-02 09:00:00'
    ),
    (
        report2_id::text,
        'Unprofessional communication during project handoff.',
        'Issue was reviewed and addressed after moderator follow-up.',
        'MODERATE',
        false,
        'WARNING',
        'Formal warning issued. Future issues will escalate.',
        NULL,
        '2026-03-11 15:30:00',
        vol1_id::text,
        org2_id::text,
        mod1_id::text,
        '2026-03-10 13:00:00',
        '2026-03-11 15:30:00'
    ),
    (
        report3_id::text,
        'Repeated no-show after prior warning.',
        'Second report filed after an earlier warning on a similar reliability issue.',
        'SERIOUS',
        false,
        'WARNING',
        'Second warning recorded before suspension threshold.',
        NULL,
        '2026-04-05 14:00:00',
        vol2_id::text,
        org1_id::text,
        mod1_id::text,
        '2026-04-05 11:30:00',
        '2026-04-05 14:00:00'
    );

UPDATE public.volunteers SET status = 'RESOLVED' WHERE id = vol1_id::text;
UPDATE public.volunteers SET status = 'FLAGGED' WHERE id = vol2_id::text;

UPDATE public.users SET status = 'VERIFIED' WHERE id = vol1_id::text;
UPDATE public.users SET status = 'FLAGGED' WHERE id = vol2_id::text;

--Registered Charity (Mock for actual CRA data)
INSERT INTO public."RegisteredCharity" (id, "registrationNumber", "organizationName")
VALUES
  (gen_random_uuid()::text, 234567891, 'Red Cross International'),
  (gen_random_uuid()::text, 123456789, 'World Impact'),
  (gen_random_uuid()::text, 345678912, 'Green Earth Initiative'),
  (gen_random_uuid()::text, 456789123, 'Helping Hands Foundation'),
  (gen_random_uuid()::text, 567891234, 'Future Minds Education'),
  (gen_random_uuid()::text, 678912345, 'Global Care Network'),
  (gen_random_uuid()::text, 789123456, 'Hope Shelter Society'),
  (gen_random_uuid()::text, 891234567, 'Food For All Alliance'),
  (gen_random_uuid()::text, 912345678, 'Bright Horizons Outreach'),
  (gen_random_uuid()::text, 135792468, 'Community Wellness Trust');


--Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('organization-documents', 'organization-documents', false),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

END $$;