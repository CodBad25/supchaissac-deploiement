-- 🗄️ Script d'initialisation PostgreSQL pour SupChaissac
-- Compatible avec Neon, Supabase, et PostgreSQL classique

-- 🎭 Création des types énumérés
CREATE TYPE role AS ENUM ('TEACHER', 'SECRETARY', 'PRINCIPAL', 'ADMIN');
CREATE TYPE session_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED');
CREATE TYPE session_type AS ENUM ('REPLACEMENT', 'EXTRA_HOURS', 'MEETING', 'TRAINING', 'OTHER');

-- 👥 Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role role NOT NULL DEFAULT 'TEACHER',
    initials TEXT NOT NULL,
    signature TEXT, -- Base64 de la signature
    in_pacte BOOLEAN NOT NULL DEFAULT FALSE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 📅 Table des sessions d'heures supplémentaires
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES users(id) NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    time_slot TEXT NOT NULL, -- Ex: "08:00-09:00"
    type session_type NOT NULL DEFAULT 'REPLACEMENT',
    description TEXT,
    status session_status NOT NULL DEFAULT 'DRAFT',
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    validated_by INTEGER REFERENCES users(id),
    validated_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ⚙️ Table de configuration des enseignants
CREATE TABLE IF NOT EXISTS teacher_setups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL UNIQUE,
    in_pacte BOOLEAN NOT NULL DEFAULT FALSE,
    signature TEXT, -- Base64 de la signature
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 🔧 Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 📊 Table des sessions Express (pour l'authentification)
CREATE TABLE IF NOT EXISTS session (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL, -- JSON stringifié
    expire TIMESTAMP NOT NULL
);

-- 📇 Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_teacher_setups_user_id ON teacher_setups(user_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

-- 🔄 Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 🎯 Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_setups_updated_at BEFORE UPDATE ON teacher_setups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 Insertion des paramètres système par défaut
INSERT INTO system_settings (key, value, description) VALUES
    ('app_version', '1.0.0', 'Version de l''application SupChaissac'),
    ('school_name', 'Collège Chaissac', 'Nom de l''établissement'),
    ('academic_year', '2024-2025', 'Année scolaire en cours'),
    ('max_hours_per_week', '35', 'Nombre maximum d''heures par semaine'),
    ('rgpd_retention_years', '5', 'Durée de rétention des données (années)')
ON CONFLICT (key) DO NOTHING;

-- 🎉 Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Base de données PostgreSQL SupChaissac initialisée avec succès !';
    RAISE NOTICE '📊 Tables créées : users, sessions, teacher_setups, system_settings, session';
    RAISE NOTICE '🔧 Index et triggers configurés';
    RAISE NOTICE '⚙️ Paramètres système par défaut insérés';
END $$;
