// 🗄️ Schéma PostgreSQL pour SupChaissac
// Compatible avec Drizzle ORM et Neon

import { pgTable, serial, text, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 🎭 Énumérations PostgreSQL
export const roleEnum = pgEnum('role', ['TEACHER', 'SECRETARY', 'PRINCIPAL', 'ADMIN']);
export const genderEnum = pgEnum('gender', ['M', 'F', 'OTHER']);
export const sessionStatusEnum = pgEnum('session_status', ['DRAFT', 'PENDING_REVIEW', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED']);
export const sessionTypeEnum = pgEnum('session_type', ['REPLACEMENT', 'EXTRA_HOURS', 'MEETING', 'TRAINING', 'OTHER']);

// 👥 Table des utilisateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('TEACHER'),
  gender: genderEnum('gender').default('OTHER'), // Genre pour les couleurs des cartes
  initials: text('initials').notNull(),
  signature: text('signature'), // Base64 de la signature
  inPacte: boolean('in_pacte').notNull().default(false),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 📅 Table des sessions d'heures supplémentaires
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  teacherId: serial('teacher_id').references(() => users.id).notNull(),
  teacherName: text('teacher_name').notNull(),
  date: text('date').notNull(), // Format YYYY-MM-DD
  timeSlot: text('time_slot').notNull(), // Ex: "08:00-09:00"
  type: sessionTypeEnum('type').notNull().default('REPLACEMENT'),
  originalType: sessionTypeEnum('original_type').notNull(), // Type initial (ne change jamais)
  inPacte: boolean('in_pacte').default(false),
  description: text('description'),
  status: sessionStatusEnum('status').notNull().default('DRAFT'),
  replacedTeacherPrefix: text('replaced_teacher_prefix'),
  replacedTeacherLastName: text('replaced_teacher_last_name'),
  replacedTeacherFirstName: text('replaced_teacher_first_name'),
  replacedTeacherName: text('replaced_teacher_name'),
  className: text('class_name'),
  subject: text('subject'),
  comment: text('comment'),
  studentCount: serial('student_count'),
  gradeLevel: text('grade_level'),
  reviewedBy: serial('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  validatedBy: serial('validated_by').references(() => users.id),
  validatedAt: timestamp('validated_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at'),
  updatedBy: text('updated_by'),
});

// ⚙️ Table de configuration des enseignants
export const teacherSetups = pgTable('teacher_setups', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id).notNull().unique(),
  inPacte: boolean('in_pacte').notNull().default(false),
  signature: text('signature'), // Base64 de la signature
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 🔧 Table des paramètres système
export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 📎 Table des documents joints aux sessions
export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id, { onDelete: 'cascade' }).notNull(),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  filePath: text('file_path').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id).notNull(),
  isVerified: boolean('is_verified').default(false),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  isArchived: boolean('is_archived').default(false),
  archivedBy: integer('archived_by').references(() => users.id),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 📋 Table de l'historique des statuts PACTE
export const pacteHistory = pgTable('pacte_history', {
  id: serial('id').primaryKey(),
  teacherId: integer('teacher_id').references(() => users.id).notNull(),
  teacherName: text('teacher_name').notNull(),
  previousStatus: boolean('previous_status').notNull(),
  newStatus: boolean('new_status').notNull(),
  reason: text('reason'), // Raison du changement
  schoolYear: text('school_year').notNull(), // Ex: "2024-2025"
  changedBy: integer('changed_by').references(() => users.id).notNull(),
  changedByName: text('changed_by_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 📊 Table des sessions Express (pour l'authentification)
export const expressSessions = pgTable('session', {
  sid: text('sid').primaryKey(),
  sess: text('sess').notNull(), // JSON stringifié
  expire: timestamp('expire').notNull(),
});

// 🔍 Schémas Zod pour validation
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  initials: z.string().min(1, "Les initiales sont requises").max(5, "Maximum 5 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const selectUserSchema = createSelectSchema(users);

// Schéma d'insertion de session (originalType sera ajouté côté serveur)
export const insertSessionSchema = createInsertSchema(sessions, {
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format d'horaire invalide (HH:MM-HH:MM)"),
  description: z.string().optional(),
}).omit({
  id: true,
  originalType: true, // Sera ajouté automatiquement côté serveur
  createdAt: true,
  updatedAt: true,
  updatedBy: true,
});

export const selectSessionSchema = createSelectSchema(sessions);

export const insertTeacherSetupSchema = createInsertSchema(teacherSetups);
export const selectTeacherSetupSchema = createSelectSchema(teacherSetups);

export const insertSystemSettingSchema = createInsertSchema(systemSettings, {
  key: z.string().min(1, "La clé est requise"),
  value: z.string().min(1, "La valeur est requise"),
});

export const selectSystemSettingSchema = createSelectSchema(systemSettings);

// 📎 Schémas pour les documents joints
export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
  isVerified: true,
  verifiedBy: true,
  verifiedAt: true,
  isArchived: true,
  archivedBy: true,
  archivedAt: true,
});

export const updateAttachmentSchema = createInsertSchema(attachments).partial().omit({
  id: true,
  sessionId: true,
  uploadedBy: true,
  createdAt: true,
});

export const selectAttachmentSchema = createSelectSchema(attachments);

// 📝 Types TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type TeacherSetup = typeof teacherSetups.$inferSelect;
export type InsertTeacherSetup = typeof teacherSetups.$inferInsert;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = typeof attachments.$inferInsert;

// 🎯 Schémas de validation pour l'API
export const loginSchema = z.object({
  username: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const createSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format d'horaire invalide"),
  type: z.enum(['REPLACEMENT', 'EXTRA_HOURS', 'MEETING', 'TRAINING', 'OTHER']),
  description: z.string().optional(),
});

export const updateSessionStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

// 🔐 Schémas RGPD
export const rgpdRequestSchema = z.object({
  type: z.enum(['ACCESS', 'RECTIFICATION', 'ERASURE', 'PORTABILITY']),
  reason: z.string().optional(),
});

export const updateUserDataSchema = z.object({
  name: z.string().min(2).optional(),
  initials: z.string().min(1).max(5).optional(),
});

// 📊 Types TypeScript dérivés
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
export type PacteHistory = typeof pacteHistory.$inferSelect;
export type NewPacteHistory = typeof pacteHistory.$inferInsert;
export type TeacherSetup = typeof teacherSetups.$inferSelect;
export type NewTeacherSetup = typeof teacherSetups.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

// 📊 Export des tables pour Drizzle
export const pgTables = {
  users,
  sessions,
  teacherSetups,
  systemSettings,
  attachments,
  pacteHistory,
  expressSessions,
};
