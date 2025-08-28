-- 🎭 UTILISATEURS DEMO POUR TESTS (à ajouter à Neon)
-- Générés le 2025-08-28T00:42:27.769Z
-- Mot de passe pour tous: password123

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'teacher1@example.com',
  'password123',
  'Sophie MARTIN',
  'TEACHER',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'teacher2@example.com',
  'password123',
  'Marie PETIT',
  'TEACHER',
  true
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'teacher3@example.com',
  'password123',
  'Martin DUBOIS',
  'TEACHER',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'teacher4@example.com',
  'password123',
  'Philippe GARCIA',
  'TEACHER',
  true
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'secretary@example.com',
  'password123',
  'Laure MARTIN',
  'SECRETARY',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'principal@example.com',
  'password123',
  'Jean DUPONT',
  'PRINCIPAL',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'admin@example.com',
  'password123',
  'Admin',
  'ADMIN',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

INSERT INTO users (username, password, name, role, in_pacte) VALUES (
  'admin.dev@supchaissac.local',
  '$2b$12$51yRwEwX4gtjTEoElpA6b.tBoFAhqUo1SWHQmKP0PPz1iaYpby9OG',
  'Admin Développement',
  'ADMIN',
  false
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  in_pacte = EXCLUDED.in_pacte;

