insert into public.profiles (
  id,
  slug,
  name,
  role,
  company,
  headline,
  bio,
  avatar_url,
  presentation_url,
  whatsapp_number,
  whatsapp_message,
  email,
  linkedin_url,
  services,
  is_active
)
values (
  '58c365e5-5c33-49e3-b5f8-c718aa616559',
  'tiago',
  'Tiago Lima',
  'CEO',
  'AERA',
  'Strategy, creative, technology and AI. From first thought to first version running.',
  'Na AERA, conecto estratégia, criatividade e tecnologia para transformar ideias em marcas, produtos e sistemas prontos para ganhar movimento.',
  '/brand/aera-symbol.png',
  'https://aera.company/#work',
  '+55 21 99683-6857',
  'Olá, Tiago. Conheci seu trabalho pelo One Tap e gostaria de conversar.',
  'sales@aera.company',
  'https://www.linkedin.com/in/tiago-lima-b2a56a1a0/',
  '[
    {"title": "Estratégia", "detail": "Clareza para marcas, produtos e novas ideias."},
    {"title": "Branding", "detail": "Sistemas visuais que constroem presença."},
    {"title": "Marketing & Engineering Designer", "detail": "Criatividade, tecnologia e execução conectadas."}
  ]'::jsonb,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  role = excluded.role,
  company = excluded.company,
  headline = excluded.headline,
  bio = excluded.bio,
  avatar_url = excluded.avatar_url,
  presentation_url = excluded.presentation_url,
  whatsapp_number = excluded.whatsapp_number,
  whatsapp_message = excluded.whatsapp_message,
  email = excluded.email,
  linkedin_url = excluded.linkedin_url,
  services = excluded.services,
  is_active = excluded.is_active,
  updated_at = now();

insert into public.cards (
  id,
  profile_id,
  card_code,
  label,
  campaign,
  location,
  is_active
)
values (
  '9d528711-b99c-46d1-8217-64d15df0a6dc',
  '58c365e5-5c33-49e3-b5f8-c718aa616559',
  'aera-tiago-001',
  'Cartão pessoal Tiago',
  'Networking geral',
  'Rio de Janeiro',
  true
)
on conflict (card_code) do update set
  profile_id = excluded.profile_id,
  label = excluded.label,
  campaign = excluded.campaign,
  location = excluded.location,
  is_active = excluded.is_active;
