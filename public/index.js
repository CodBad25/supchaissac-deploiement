var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore, MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    MemoryStore = createMemoryStore(session);
    MemStorage = class {
      users;
      sessions;
      teacherSetups;
      systemSettings;
      userId;
      sessionId;
      setupId;
      settingId;
      sessionStore;
      // Using any to avoid type errors
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.sessions = /* @__PURE__ */ new Map();
        this.teacherSetups = /* @__PURE__ */ new Map();
        this.systemSettings = /* @__PURE__ */ new Map();
        this.userId = 1;
        this.sessionId = 1;
        this.setupId = 1;
        this.settingId = 1;
        this.sessionStore = new MemoryStore({
          checkPeriod: 864e5
          // prune expired entries every 24h
        });
        this.createUser({
          username: "teacher1@example.com",
          password: "password123",
          name: "Sophie MARTIN",
          role: "TEACHER",
          inPacte: false
        });
        this.createUser({
          username: "teacher2@example.com",
          password: "password123",
          name: "Marie PETIT",
          role: "TEACHER",
          inPacte: true
        });
        this.createUser({
          username: "teacher3@example.com",
          password: "password123",
          name: "Martin DUBOIS",
          role: "TEACHER",
          inPacte: false
        });
        this.createUser({
          username: "teacher4@example.com",
          password: "password123",
          name: "Philippe GARCIA",
          role: "TEACHER",
          inPacte: true
        });
        this.createUser({
          username: "secretary@example.com",
          password: "password123",
          name: "Laure MARTIN",
          role: "SECRETARY"
        });
        this.createUser({
          username: "principal@example.com",
          password: "password123",
          name: "Jean DUPONT",
          role: "PRINCIPAL"
        });
        this.createUser({
          username: "admin@example.com",
          password: "password123",
          name: "Admin",
          role: "PRINCIPAL"
          // Using principal role for admin as it has the highest privileges
        });
        const today = /* @__PURE__ */ new Date();
        const currentDate = today.toISOString().split("T")[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split("T")[0];
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split("T")[0];
        this.createSession({
          teacherId: 1,
          teacherName: "Sophie MARTIN",
          date: yesterdayStr,
          timeSlot: "M2",
          type: "RCD",
          status: "VALIDATED",
          className: "4A",
          replacedTeacherPrefix: "Mme",
          replacedTeacherLastName: "ROBERT",
          replacedTeacherFirstName: "Julie",
          comment: "Absence pour formation"
        });
        this.createSession({
          teacherId: 1,
          teacherName: "Sophie MARTIN",
          date: currentDate,
          timeSlot: "M3",
          type: "DEVOIRS_FAITS",
          status: "PENDING_VALIDATION",
          gradeLevel: "6e",
          studentCount: 14,
          comment: ""
        });
        this.createSession({
          teacherId: 1,
          teacherName: "Sophie MARTIN",
          date: tomorrowStr,
          timeSlot: "S2",
          type: "AUTRE",
          status: "PENDING_REVIEW",
          comment: "R\xE9union de pr\xE9paration conseil de classe"
        });
        this.createSession({
          teacherId: 2,
          teacherName: "Marie PETIT",
          date: yesterdayStr,
          timeSlot: "S3",
          type: "DEVOIRS_FAITS",
          status: "PAID",
          gradeLevel: "5e",
          studentCount: 10,
          comment: "",
          inPacte: true
        });
        this.createSession({
          teacherId: 2,
          teacherName: "Marie PETIT",
          date: currentDate,
          timeSlot: "M4",
          type: "RCD",
          status: "PENDING_VALIDATION",
          className: "3B",
          replacedTeacherPrefix: "M.",
          replacedTeacherLastName: "RICHARD",
          replacedTeacherFirstName: "Thomas",
          comment: "Absence maladie",
          inPacte: true
        });
        this.createSession({
          teacherId: 3,
          teacherName: "Martin DUBOIS",
          date: currentDate,
          timeSlot: "S1",
          type: "DEVOIRS_FAITS",
          status: "REJECTED",
          gradeLevel: "4e",
          studentCount: 8,
          comment: "Nombre d'\xE9l\xE8ves insuffisant pour validation"
        });
        this.createSession({
          teacherId: 3,
          teacherName: "Martin DUBOIS",
          date: tomorrowStr,
          timeSlot: "M1",
          type: "RCD",
          status: "PENDING_REVIEW",
          className: "6C",
          replacedTeacherPrefix: "Mme",
          replacedTeacherLastName: "BERNARD",
          replacedTeacherFirstName: "Sylvie",
          comment: ""
        });
        this.createSession({
          teacherId: 3,
          teacherName: "Martin DUBOIS",
          date: dayAfterTomorrowStr,
          timeSlot: "S4",
          type: "AUTRE",
          status: "PENDING_VALIDATION",
          comment: "Sortie p\xE9dagogique encadr\xE9e"
        });
        this.createSession({
          teacherId: 4,
          teacherName: "Philippe GARCIA",
          date: yesterdayStr,
          timeSlot: "M1",
          type: "RCD",
          status: "PAID",
          className: "5A",
          replacedTeacherPrefix: "M.",
          replacedTeacherLastName: "MOREAU",
          replacedTeacherFirstName: "Paul",
          comment: "",
          inPacte: true
        });
        this.createSession({
          teacherId: 4,
          teacherName: "Philippe GARCIA",
          date: currentDate,
          timeSlot: "S3",
          type: "DEVOIRS_FAITS",
          status: "VALIDATED",
          gradeLevel: "3e",
          studentCount: 15,
          comment: "",
          inPacte: true
        });
        this.createSession({
          teacherId: 4,
          teacherName: "Philippe GARCIA",
          date: dayAfterTomorrowStr,
          timeSlot: "M2",
          type: "AUTRE",
          status: "PENDING_REVIEW",
          comment: "Atelier pr\xE9paration orientation",
          inPacte: true
        });
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username.toLowerCase() === username.toLowerCase()
        );
      }
      async createUser(userData) {
        const id = this.userId++;
        const initials = userData.name.split(" ").map((part) => part.charAt(0)).join("").toUpperCase();
        const user = {
          ...userData,
          id,
          initials,
          signature: null
        };
        this.users.set(id, user);
        return user;
      }
      async updateUser(id, data) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = { ...user, ...data };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      async getSessions() {
        return Array.from(this.sessions.values());
      }
      async getSessionsByTeacher(teacherId) {
        return Array.from(this.sessions.values()).filter(
          (session5) => session5.teacherId === teacherId
        );
      }
      async getSessionById(id) {
        return this.sessions.get(id);
      }
      async createSession(sessionData) {
        const id = this.sessionId++;
        const session5 = {
          ...sessionData,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: null,
          updatedBy: null
        };
        this.sessions.set(id, session5);
        return session5;
      }
      async updateSession(id, data) {
        const session5 = this.sessions.get(id);
        if (!session5) return void 0;
        const updatedSession = {
          ...session5,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.sessions.set(id, updatedSession);
        return updatedSession;
      }
      async deleteSession(id) {
        return this.sessions.delete(id);
      }
      async getTeacherSetup(teacherId) {
        return Array.from(this.teacherSetups.values()).find(
          (setup) => setup.teacherId === teacherId
        );
      }
      async createTeacherSetup(setupData) {
        const id = this.setupId++;
        const setup = {
          ...setupData,
          id,
          signature: null,
          inPacte: false
        };
        this.teacherSetups.set(id, setup);
        return setup;
      }
      async updateTeacherSetup(teacherId, data) {
        const setup = Array.from(this.teacherSetups.values()).find(
          (s) => s.teacherId === teacherId
        );
        if (!setup) return void 0;
        const updatedSetup = { ...setup, ...data };
        this.teacherSetups.set(setup.id, updatedSetup);
        return updatedSetup;
      }
      async getSystemSettings() {
        return Array.from(this.systemSettings.values());
      }
      async getSystemSettingByKey(key) {
        return Array.from(this.systemSettings.values()).find(
          (setting) => setting.key === key
        );
      }
      async createSystemSetting(settingData) {
        const id = this.settingId++;
        const setting = {
          ...settingData,
          id,
          updatedAt: /* @__PURE__ */ new Date(),
          description: settingData.description || null,
          updatedBy: settingData.updatedBy || null
        };
        this.systemSettings.set(id, setting);
        return setting;
      }
      async updateSystemSetting(key, value, updatedBy) {
        const setting = Array.from(this.systemSettings.values()).find(
          (s) => s.key === key
        );
        if (!setting) return void 0;
        const updatedSetting = {
          ...setting,
          value,
          updatedBy,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.systemSettings.set(setting.id, updatedSetting);
        return updatedSetting;
      }
    };
    storage = new MemStorage();
    storage.createSystemSetting({
      key: "SESSION_EDIT_WINDOW",
      value: "60",
      description: "D\xE9lai de modification des sessions en minutes apr\xE8s cr\xE9ation",
      updatedBy: "system"
    });
  }
});

// shared/schema-sqlite.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, sessions, teacherSetups, systemSettings, insertUserSchema, insertSessionSchema, insertTeacherSetupSchema, insertSystemSettingSchema, UserRole, TimeSlot, SessionType, SessionStatus;
var init_schema_sqlite = __esm({
  "shared/schema-sqlite.ts"() {
    "use strict";
    users = sqliteTable("users", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      role: text("role", { enum: ["TEACHER", "SECRETARY", "PRINCIPAL", "ADMIN"] }).notNull().default("TEACHER"),
      initials: text("initials"),
      signature: text("signature"),
      inPacte: integer("in_pacte", { mode: "boolean" }).default(false)
    });
    sessions = sqliteTable("sessions", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      date: text("date").notNull(),
      // Date in YYYY-MM-DD format
      timeSlot: text("time_slot", {
        enum: ["M1", "M2", "M3", "M4", "S1", "S2", "S3", "S4"]
      }).notNull(),
      type: text("type", { enum: ["RCD", "DEVOIRS_FAITS", "HSE", "AUTRE"] }).notNull(),
      teacherId: integer("teacher_id").notNull(),
      teacherName: text("teacher_name").notNull(),
      inPacte: integer("in_pacte", { mode: "boolean" }).default(false),
      status: text("status", {
        enum: ["PENDING_REVIEW", "PENDING_VALIDATION", "VALIDATED", "REJECTED", "PAID"]
      }).notNull().default("PENDING_REVIEW"),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updated_at", { mode: "timestamp" }),
      updatedBy: text("updated_by"),
      // Session details
      classes: text("classes"),
      // JSON string of selected classes
      subject: text("subject"),
      description: text("description"),
      // Validation workflow
      reviewedBy: text("reviewed_by"),
      reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
      reviewComments: text("review_comments"),
      validatedBy: text("validated_by"),
      validatedAt: integer("validated_at", { mode: "timestamp" }),
      validationComments: text("validation_comments"),
      rejectedBy: text("rejected_by"),
      rejectedAt: integer("rejected_at", { mode: "timestamp" }),
      rejectionReason: text("rejection_reason"),
      paidBy: text("paid_by"),
      paidAt: integer("paid_at", { mode: "timestamp" }),
      paymentReference: text("payment_reference")
    });
    teacherSetups = sqliteTable("teacher_setups", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      teacherId: integer("teacher_id").notNull().unique(),
      preferredSubjects: text("preferred_subjects"),
      // JSON array
      availableTimeSlots: text("available_time_slots"),
      // JSON array
      maxHoursPerWeek: integer("max_hours_per_week").default(10),
      notifications: integer("notifications", { mode: "boolean" }).default(true),
      createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: integer("updated_at", { mode: "timestamp" })
    });
    systemSettings = sqliteTable("system_settings", {
      id: integer("id").primaryKey({ autoIncrement: true }),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      description: text("description"),
      updatedBy: text("updated_by").notNull(),
      updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertUserSchema = createInsertSchema(users);
    insertSessionSchema = createInsertSchema(sessions);
    insertTeacherSetupSchema = createInsertSchema(teacherSetups);
    insertSystemSettingSchema = createInsertSchema(systemSettings);
    UserRole = z.enum(["TEACHER", "SECRETARY", "PRINCIPAL", "ADMIN"]);
    TimeSlot = z.enum(["M1", "M2", "M3", "M4", "S1", "S2", "S3", "S4"]);
    SessionType = z.enum(["RCD", "DEVOIRS_FAITS", "HSE", "AUTRE"]);
    SessionStatus = z.enum(["PENDING_REVIEW", "PENDING_VALIDATION", "VALIDATED", "REJECTED", "PAID"]);
  }
});

// server/sqlite-storage.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import session2 from "express-session";
import createMemoryStore2 from "memorystore";
var MemoryStore2, SqliteStorage;
var init_sqlite_storage = __esm({
  "server/sqlite-storage.ts"() {
    "use strict";
    init_schema_sqlite();
    MemoryStore2 = createMemoryStore2(session2);
    SqliteStorage = class {
      db;
      sqlite;
      sessionStore;
      constructor(dbPath = "./data/supchaissac.db") {
        this.sqlite = new Database(dbPath);
        this.sqlite.pragma("journal_mode = WAL");
        this.db = drizzle(this.sqlite);
        this.sessionStore = new MemoryStore2({
          checkPeriod: 864e5
          // prune expired entries every 24h
        });
        this.initializeSchema();
      }
      initializeSchema() {
        this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'TEACHER' CHECK (role IN ('TEACHER', 'SECRETARY', 'PRINCIPAL', 'ADMIN')),
        initials TEXT,
        signature TEXT,
        in_pacte INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time_slot TEXT NOT NULL CHECK (time_slot IN ('M1', 'M2', 'M3', 'M4', 'S1', 'S2', 'S3', 'S4')),
        type TEXT NOT NULL CHECK (type IN ('RCD', 'DEVOIRS_FAITS', 'HSE', 'AUTRE')),
        teacher_id INTEGER NOT NULL,
        teacher_name TEXT NOT NULL,
        in_pacte INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'PENDING_VALIDATION', 'VALIDATED', 'REJECTED', 'PAID')),
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        updated_by TEXT,
        classes TEXT,
        subject TEXT,
        description TEXT,
        reviewed_by TEXT,
        reviewed_at INTEGER,
        review_comments TEXT,
        validated_by TEXT,
        validated_at INTEGER,
        validation_comments TEXT,
        rejected_by TEXT,
        rejected_at INTEGER,
        rejection_reason TEXT,
        paid_by TEXT,
        paid_at INTEGER,
        payment_reference TEXT
      );

      CREATE TABLE IF NOT EXISTS teacher_setups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL UNIQUE,
        preferred_subjects TEXT,
        available_time_slots TEXT,
        max_hours_per_week INTEGER DEFAULT 10,
        notifications INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        updated_by TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);
      }
      // User methods
      async getUser(id) {
        try {
          const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting user:", error);
          return void 0;
        }
      }
      async getUserByUsername(username) {
        try {
          const result = await this.db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting user by username:", error);
          return void 0;
        }
      }
      async createUser(userData) {
        try {
          const initials = userData.name.split(" ").map((part) => part.charAt(0)).join("").toUpperCase();
          const userToInsert = {
            ...userData,
            username: userData.username.toLowerCase(),
            initials
          };
          const result = await this.db.insert(users).values(userToInsert).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        }
      }
      async updateUser(id, data) {
        try {
          const result = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating user:", error);
          return void 0;
        }
      }
      async getUserById(id) {
        return this.getUser(id);
      }
      async getUsers() {
        try {
          const result = await this.db.select().from(users);
          return result;
        } catch (error) {
          console.error("Error getting users:", error);
          return [];
        }
      }
      async deleteUser(id) {
        try {
          await this.db.delete(teacherSetups).where(eq(teacherSetups.userId, id));
          const result = await this.db.delete(users).where(eq(users.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting user:", error);
          return false;
        }
      }
      // Session methods
      async getSessions() {
        try {
          return await this.db.select().from(sessions);
        } catch (error) {
          console.error("Error getting sessions:", error);
          return [];
        }
      }
      async getSessionsByTeacher(teacherId) {
        try {
          return await this.db.select().from(sessions).where(eq(sessions.teacherId, teacherId));
        } catch (error) {
          console.error("Error getting sessions by teacher:", error);
          return [];
        }
      }
      async getSessionById(id) {
        try {
          const result = await this.db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting session by id:", error);
          return void 0;
        }
      }
      async createSession(sessionData) {
        try {
          const result = await this.db.insert(sessions).values(sessionData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating session:", error);
          throw error;
        }
      }
      async updateSession(id, data) {
        try {
          const updateData = {
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          };
          const result = await this.db.update(sessions).set(updateData).where(eq(sessions.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating session:", error);
          return void 0;
        }
      }
      async deleteSession(id) {
        try {
          const result = await this.db.delete(sessions).where(eq(sessions.id, id));
          return result.changes > 0;
        } catch (error) {
          console.error("Error deleting session:", error);
          return false;
        }
      }
      // Teacher setup methods
      async getTeacherSetup(teacherId) {
        try {
          const result = await this.db.select().from(teacherSetups).where(eq(teacherSetups.teacherId, teacherId)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting teacher setup:", error);
          return void 0;
        }
      }
      async createTeacherSetup(setupData) {
        try {
          const result = await this.db.insert(teacherSetups).values(setupData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating teacher setup:", error);
          throw error;
        }
      }
      async updateTeacherSetup(teacherId, data) {
        try {
          const result = await this.db.update(teacherSetups).set(data).where(eq(teacherSetups.teacherId, teacherId)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating teacher setup:", error);
          return void 0;
        }
      }
      // System settings methods
      async getSystemSettings() {
        try {
          return await this.db.select().from(systemSettings);
        } catch (error) {
          console.error("Error getting system settings:", error);
          return [];
        }
      }
      async getSystemSettingByKey(key) {
        try {
          const result = await this.db.select().from(systemSettings).where(eq(systemSettings.key, key)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting system setting by key:", error);
          return void 0;
        }
      }
      async createSystemSetting(settingData) {
        try {
          const result = await this.db.insert(systemSettings).values(settingData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating system setting:", error);
          throw error;
        }
      }
      async updateSystemSetting(key, value, updatedBy) {
        try {
          const updateData = {
            value,
            updatedBy,
            updatedAt: /* @__PURE__ */ new Date()
          };
          const result = await this.db.update(systemSettings).set(updateData).where(eq(systemSettings.key, key)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating system setting:", error);
          return void 0;
        }
      }
      // Utility method to close the connection
      async close() {
        this.sqlite.close();
      }
      // Method to initialize with test data (similar to MemStorage)
      async initializeTestData() {
        try {
          const existingUsers = await this.db.select().from(users).limit(1);
          if (existingUsers.length > 0) {
            console.log("Test data already exists, skipping initialization");
            return;
          }
          console.log("Initializing test data...");
          const testUsers = [
            {
              username: "teacher1@example.com",
              password: "password123",
              name: "Sophie MARTIN",
              role: "TEACHER",
              inPacte: false
            },
            {
              username: "teacher2@example.com",
              password: "password123",
              name: "Marie PETIT",
              role: "TEACHER",
              inPacte: true
            },
            {
              username: "teacher3@example.com",
              password: "password123",
              name: "Martin DUBOIS",
              role: "TEACHER",
              inPacte: false
            },
            {
              username: "teacher4@example.com",
              password: "password123",
              name: "Philippe GARCIA",
              role: "TEACHER",
              inPacte: true
            },
            {
              username: "secretary@example.com",
              password: "password123",
              name: "Laure MARTIN",
              role: "SECRETARY"
            },
            {
              username: "principal@example.com",
              password: "password123",
              name: "Jean DUPONT",
              role: "PRINCIPAL"
            },
            {
              username: "admin@example.com",
              password: "password123",
              name: "Admin",
              role: "ADMIN"
            }
          ];
          for (const userData of testUsers) {
            await this.createUser(userData);
          }
          console.log("Test data initialized successfully");
        } catch (error) {
          console.error("Error initializing test data:", error);
          throw error;
        }
      }
    };
  }
});

// shared/schema-pg.ts
import { pgTable, serial, text as text2, timestamp, boolean, integer as integer2, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2, createSelectSchema } from "drizzle-zod";
import { z as z2 } from "zod";
var roleEnum, genderEnum, sessionStatusEnum, sessionTypeEnum, users2, sessions2, teacherSetups2, systemSettings2, attachments, pacteHistory, expressSessions, insertUserSchema2, selectUserSchema, insertSessionSchema2, selectSessionSchema, insertTeacherSetupSchema2, selectTeacherSetupSchema, insertSystemSettingSchema2, selectSystemSettingSchema, insertAttachmentSchema, updateAttachmentSchema, selectAttachmentSchema, loginSchema, createSessionSchema, updateSessionStatusSchema, rgpdRequestSchema, updateUserDataSchema;
var init_schema_pg = __esm({
  "shared/schema-pg.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["TEACHER", "SECRETARY", "PRINCIPAL", "ADMIN"]);
    genderEnum = pgEnum("gender", ["M", "F", "OTHER"]);
    sessionStatusEnum = pgEnum("session_status", ["DRAFT", "PENDING_REVIEW", "PENDING_VALIDATION", "VALIDATED", "REJECTED"]);
    sessionTypeEnum = pgEnum("session_type", ["REPLACEMENT", "EXTRA_HOURS", "MEETING", "TRAINING", "OTHER"]);
    users2 = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text2("username").notNull().unique(),
      name: text2("name").notNull(),
      role: roleEnum("role").notNull().default("TEACHER"),
      gender: genderEnum("gender").default("OTHER"),
      // Genre pour les couleurs des cartes
      initials: text2("initials").notNull(),
      signature: text2("signature"),
      // Base64 de la signature
      inPacte: boolean("in_pacte").notNull().default(false),
      password: text2("password").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    sessions2 = pgTable("sessions", {
      id: serial("id").primaryKey(),
      teacherId: serial("teacher_id").references(() => users2.id).notNull(),
      teacherName: text2("teacher_name").notNull(),
      date: text2("date").notNull(),
      // Format YYYY-MM-DD
      timeSlot: text2("time_slot").notNull(),
      // Ex: "08:00-09:00"
      type: sessionTypeEnum("type").notNull().default("REPLACEMENT"),
      originalType: sessionTypeEnum("original_type").notNull(),
      // Type initial (ne change jamais)
      inPacte: boolean("in_pacte").default(false),
      description: text2("description"),
      status: sessionStatusEnum("status").notNull().default("DRAFT"),
      replacedTeacherPrefix: text2("replaced_teacher_prefix"),
      replacedTeacherLastName: text2("replaced_teacher_last_name"),
      replacedTeacherFirstName: text2("replaced_teacher_first_name"),
      replacedTeacherName: text2("replaced_teacher_name"),
      className: text2("class_name"),
      subject: text2("subject"),
      comment: text2("comment"),
      studentCount: serial("student_count"),
      gradeLevel: text2("grade_level"),
      reviewedBy: serial("reviewed_by").references(() => users2.id),
      reviewedAt: timestamp("reviewed_at"),
      validatedBy: serial("validated_by").references(() => users2.id),
      validatedAt: timestamp("validated_at"),
      rejectionReason: text2("rejection_reason"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at"),
      updatedBy: text2("updated_by")
    });
    teacherSetups2 = pgTable("teacher_setups", {
      id: serial("id").primaryKey(),
      teacherId: integer2("teacher_id").references(() => users2.id).notNull().unique(),
      inPacte: boolean("in_pacte").notNull().default(false),
      signature: text2("signature"),
      // Base64 de la signature
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    systemSettings2 = pgTable("system_settings", {
      id: serial("id").primaryKey(),
      key: text2("key").notNull().unique(),
      value: text2("value").notNull(),
      description: text2("description"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    attachments = pgTable("attachments", {
      id: serial("id").primaryKey(),
      sessionId: integer2("session_id").references(() => sessions2.id, { onDelete: "cascade" }).notNull(),
      fileName: text2("file_name").notNull(),
      originalName: text2("original_name").notNull(),
      mimeType: text2("mime_type").notNull(),
      fileSize: integer2("file_size").notNull(),
      filePath: text2("file_path").notNull(),
      uploadedBy: integer2("uploaded_by").references(() => users2.id).notNull(),
      isVerified: boolean("is_verified").default(false),
      verifiedBy: integer2("verified_by").references(() => users2.id),
      verifiedAt: timestamp("verified_at"),
      isArchived: boolean("is_archived").default(false),
      archivedBy: integer2("archived_by").references(() => users2.id),
      archivedAt: timestamp("archived_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    pacteHistory = pgTable("pacte_history", {
      id: serial("id").primaryKey(),
      teacherId: integer2("teacher_id").references(() => users2.id).notNull(),
      teacherName: text2("teacher_name").notNull(),
      previousStatus: boolean("previous_status").notNull(),
      newStatus: boolean("new_status").notNull(),
      reason: text2("reason"),
      // Raison du changement
      schoolYear: text2("school_year").notNull(),
      // Ex: "2024-2025"
      changedBy: integer2("changed_by").references(() => users2.id).notNull(),
      changedByName: text2("changed_by_name").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    expressSessions = pgTable("session", {
      sid: text2("sid").primaryKey(),
      sess: text2("sess").notNull(),
      // JSON stringifié
      expire: timestamp("expire").notNull()
    });
    insertUserSchema2 = createInsertSchema2(users2, {
      username: z2.string().email("Email invalide"),
      name: z2.string().min(2, "Le nom doit contenir au moins 2 caract\xE8res"),
      initials: z2.string().min(1, "Les initiales sont requises").max(5, "Maximum 5 caract\xE8res"),
      password: z2.string().min(8, "Le mot de passe doit contenir au moins 8 caract\xE8res")
    });
    selectUserSchema = createSelectSchema(users2);
    insertSessionSchema2 = createInsertSchema2(sessions2, {
      date: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
      timeSlot: z2.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format d'horaire invalide (HH:MM-HH:MM)"),
      description: z2.string().optional()
    }).omit({
      id: true,
      originalType: true,
      // Sera ajouté automatiquement côté serveur
      createdAt: true,
      updatedAt: true,
      updatedBy: true
    });
    selectSessionSchema = createSelectSchema(sessions2);
    insertTeacherSetupSchema2 = createInsertSchema2(teacherSetups2);
    selectTeacherSetupSchema = createSelectSchema(teacherSetups2);
    insertSystemSettingSchema2 = createInsertSchema2(systemSettings2, {
      key: z2.string().min(1, "La cl\xE9 est requise"),
      value: z2.string().min(1, "La valeur est requise")
    });
    selectSystemSettingSchema = createSelectSchema(systemSettings2);
    insertAttachmentSchema = createInsertSchema2(attachments).omit({
      id: true,
      createdAt: true,
      isVerified: true,
      verifiedBy: true,
      verifiedAt: true,
      isArchived: true,
      archivedBy: true,
      archivedAt: true
    });
    updateAttachmentSchema = createInsertSchema2(attachments).partial().omit({
      id: true,
      sessionId: true,
      uploadedBy: true,
      createdAt: true
    });
    selectAttachmentSchema = createSelectSchema(attachments);
    loginSchema = z2.object({
      username: z2.string().email("Email invalide"),
      password: z2.string().min(1, "Mot de passe requis")
    });
    createSessionSchema = z2.object({
      date: z2.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
      timeSlot: z2.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, "Format d'horaire invalide"),
      type: z2.enum(["REPLACEMENT", "EXTRA_HOURS", "MEETING", "TRAINING", "OTHER"]),
      description: z2.string().optional()
    });
    updateSessionStatusSchema = z2.object({
      status: z2.enum(["DRAFT", "PENDING_REVIEW", "PENDING_VALIDATION", "VALIDATED", "REJECTED"]),
      rejectionReason: z2.string().optional()
    });
    rgpdRequestSchema = z2.object({
      type: z2.enum(["ACCESS", "RECTIFICATION", "ERASURE", "PORTABILITY"]),
      reason: z2.string().optional()
    });
    updateUserDataSchema = z2.object({
      name: z2.string().min(2).optional(),
      initials: z2.string().min(1).max(5).optional()
    });
  }
});

// server/pg-storage.ts
import { drizzle as drizzle2 } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq as eq2 } from "drizzle-orm";
import session3 from "express-session";
var PgStorage;
var init_pg_storage = __esm({
  "server/pg-storage.ts"() {
    "use strict";
    init_schema_pg();
    PgStorage = class {
      db;
      sql;
      sessionStore;
      constructor(databaseUrl) {
        this.sql = postgres(databaseUrl);
        this.db = drizzle2(this.sql);
        this.sessionStore = new session3.MemoryStore();
      }
      // 🔄 Initialisation des tables
      async initialize() {
        try {
          console.log("\u{1F527} V\xE9rification des tables PostgreSQL...");
          await this.sql`SELECT 1`;
          console.log("\u2705 PostgreSQL initialis\xE9 avec succ\xE8s");
        } catch (error) {
          console.error("\u274C Erreur initialisation PostgreSQL:", error);
          throw error;
        }
      }
      // User methods
      async getUser(id) {
        try {
          const result = await this.db.select().from(users2).where(eq2(users2.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting user:", error);
          return void 0;
        }
      }
      async getUserByUsername(username) {
        try {
          const result = await this.db.select().from(users2).where(eq2(users2.username, username.toLowerCase())).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting user by username:", error);
          return void 0;
        }
      }
      async createUser(userData) {
        try {
          const initials = userData.name.split(" ").map((part) => part.charAt(0)).join("").toUpperCase();
          const userToInsert = {
            ...userData,
            username: userData.username.toLowerCase(),
            initials
          };
          const result = await this.db.insert(users2).values(userToInsert).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        }
      }
      async updateUser(id, data) {
        try {
          const result = await this.db.update(users2).set(data).where(eq2(users2.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating user:", error);
          return void 0;
        }
      }
      async getUserById(id) {
        return this.getUser(id);
      }
      async getUsers() {
        try {
          const result = await this.db.select().from(users2);
          return result;
        } catch (error) {
          console.error("Error getting users:", error);
          return [];
        }
      }
      async deleteUser(id) {
        try {
          await this.db.delete(teacherSetups2).where(eq2(teacherSetups2.userId, id));
          const result = await this.db.delete(users2).where(eq2(users2.id, id));
          return true;
        } catch (error) {
          console.error("Error deleting user:", error);
          return false;
        }
      }
      // Session methods
      async getSessions() {
        try {
          return await this.db.select().from(sessions2);
        } catch (error) {
          console.error("Error getting sessions:", error);
          return [];
        }
      }
      async getSessionsByTeacher(teacherId) {
        try {
          return await this.db.select().from(sessions2).where(eq2(sessions2.teacherId, teacherId));
        } catch (error) {
          console.error("Error getting sessions by teacher:", error);
          return [];
        }
      }
      async getSessionById(id) {
        try {
          const result = await this.db.select().from(sessions2).where(eq2(sessions2.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting session by id:", error);
          return void 0;
        }
      }
      async createSession(sessionData) {
        try {
          const result = await this.db.insert(sessions2).values(sessionData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating session:", error);
          throw error;
        }
      }
      async updateSession(id, data) {
        try {
          const updateData = {
            ...data,
            updatedAt: /* @__PURE__ */ new Date()
          };
          const result = await this.db.update(sessions2).set(updateData).where(eq2(sessions2.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating session:", error);
          return void 0;
        }
      }
      async deleteSession(id) {
        try {
          const result = await this.db.delete(sessions2).where(eq2(sessions2.id, id));
          return result.rowCount > 0;
        } catch (error) {
          console.error("Error deleting session:", error);
          return false;
        }
      }
      // Teacher setup methods
      async getTeacherSetup(teacherId) {
        try {
          const result = await this.db.select().from(teacherSetups2).where(eq2(teacherSetups2.teacherId, teacherId)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting teacher setup:", error);
          return void 0;
        }
      }
      async createTeacherSetup(setupData) {
        try {
          const result = await this.db.insert(teacherSetups2).values(setupData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating teacher setup:", error);
          throw error;
        }
      }
      async updateTeacherSetup(teacherId, data) {
        try {
          const result = await this.db.update(teacherSetups2).set(data).where(eq2(teacherSetups2.teacherId, teacherId)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating teacher setup:", error);
          return void 0;
        }
      }
      // System settings methods
      async getSystemSettings() {
        try {
          return await this.db.select().from(systemSettings2);
        } catch (error) {
          console.error("Error getting system settings:", error);
          return [];
        }
      }
      async getSystemSettingByKey(key) {
        try {
          const result = await this.db.select().from(systemSettings2).where(eq2(systemSettings2.key, key)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting system setting by key:", error);
          return void 0;
        }
      }
      async createSystemSetting(settingData) {
        try {
          const result = await this.db.insert(systemSettings2).values(settingData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating system setting:", error);
          throw error;
        }
      }
      async updateSystemSetting(key, value, updatedBy) {
        try {
          const updateData = {
            value,
            updatedBy,
            updatedAt: /* @__PURE__ */ new Date()
          };
          const result = await this.db.update(systemSettings2).set(updateData).where(eq2(systemSettings2.key, key)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating system setting:", error);
          return void 0;
        }
      }
      // Utility method to close the connection
      async close() {
        await this.sql.end();
      }
      // Method to initialize with test data (similar to MemStorage)
      async initializeTestData() {
        try {
          const existingUsers = await this.db.select().from(users2).limit(1);
          if (existingUsers.length > 0) {
            console.log("Test data already exists, skipping initialization");
            return;
          }
          console.log("Initializing test data...");
          const testUsers = [
            {
              username: "teacher1@example.com",
              password: "password123",
              name: "Sophie MARTIN",
              role: "TEACHER",
              inPacte: false
            },
            {
              username: "teacher2@example.com",
              password: "password123",
              name: "Marie PETIT",
              role: "TEACHER",
              inPacte: true
            },
            {
              username: "teacher3@example.com",
              password: "password123",
              name: "Martin DUBOIS",
              role: "TEACHER",
              inPacte: false
            },
            {
              username: "teacher4@example.com",
              password: "password123",
              name: "Philippe GARCIA",
              role: "TEACHER",
              inPacte: true
            },
            {
              username: "secretary@example.com",
              password: "password123",
              name: "Laure MARTIN",
              role: "SECRETARY"
            },
            {
              username: "principal@example.com",
              password: "password123",
              name: "Jean DUPONT",
              role: "PRINCIPAL"
            },
            {
              username: "admin@example.com",
              password: "password123",
              name: "Admin",
              role: "ADMIN"
            }
          ];
          for (const userData of testUsers) {
            await this.createUser(userData);
          }
          console.log("Test data initialized successfully");
        } catch (error) {
          console.error("Error initializing test data:", error);
          throw error;
        }
      }
      // 📎 MÉTHODES POUR LES DOCUMENTS JOINTS
      async getAttachmentsBySession(sessionId) {
        try {
          const result = await this.db.select().from(attachments).where(eq2(attachments.sessionId, sessionId));
          return result;
        } catch (error) {
          console.error("Error getting attachments by session:", error);
          return [];
        }
      }
      async getAttachmentById(id) {
        try {
          const result = await this.db.select().from(attachments).where(eq2(attachments.id, id)).limit(1);
          return result[0];
        } catch (error) {
          console.error("Error getting attachment by id:", error);
          return void 0;
        }
      }
      async createAttachment(attachmentData) {
        try {
          const result = await this.db.insert(attachments).values(attachmentData).returning();
          return result[0];
        } catch (error) {
          console.error("Error creating attachment:", error);
          throw error;
        }
      }
      async updateAttachment(id, data) {
        try {
          const result = await this.db.update(attachments).set(data).where(eq2(attachments.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error updating attachment:", error);
          return void 0;
        }
      }
      async deleteAttachment(id) {
        try {
          const result = await this.db.delete(attachments).where(eq2(attachments.id, id)).returning();
          return result.length > 0;
        } catch (error) {
          console.error("Error deleting attachment:", error);
          return false;
        }
      }
      async verifyAttachment(id, verifiedBy) {
        try {
          const result = await this.db.update(attachments).set({
            isVerified: true,
            verifiedBy,
            verifiedAt: /* @__PURE__ */ new Date()
          }).where(eq2(attachments.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error verifying attachment:", error);
          return void 0;
        }
      }
      async archiveAttachment(id, archivedBy) {
        try {
          const result = await this.db.update(attachments).set({
            isArchived: true,
            archivedBy,
            archivedAt: /* @__PURE__ */ new Date()
          }).where(eq2(attachments.id, id)).returning();
          return result[0];
        } catch (error) {
          console.error("Error archiving attachment:", error);
          return void 0;
        }
      }
    };
  }
});

// server/storage-factory.ts
import dotenv from "dotenv";
async function createStorage() {
  const databaseUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || "development";
  console.log("\u{1F527} Configuration du syst\xE8me de stockage...");
  console.log(`\u{1F4CA} Environnement: ${nodeEnv}`);
  if (databaseUrl && databaseUrl.startsWith("postgresql://")) {
    console.log("\u{1F418} Tentative de connexion PostgreSQL...");
    try {
      const pgStorage = new PgStorage(databaseUrl);
      await pgStorage.initialize();
      console.log("\u2705 PostgreSQL connect\xE9 avec succ\xE8s");
      return pgStorage;
    } catch (error) {
      console.log("\u274C Erreur PostgreSQL:", error.message);
      console.log("\u{1F504} Basculement vers SQLite...");
    }
  }
  if (databaseUrl && (databaseUrl.startsWith("file://") || databaseUrl.startsWith("sqlite://"))) {
    console.log("\u{1F5C3}\uFE0F Utilisation de SQLite...");
    const dbPath = databaseUrl.replace(/^(file|sqlite):\/\//, "");
    const sqliteStorage = new SqliteStorage(dbPath);
    await sqliteStorage.initializeTestData();
    console.log("\u2705 SQLite initialis\xE9 avec succ\xE8s");
    return sqliteStorage;
  }
  if (nodeEnv === "development") {
    console.log("\u{1F5C3}\uFE0F Utilisation de SQLite pour le d\xE9veloppement...");
    const sqliteStorage = new SqliteStorage("./data/supchaissac.db");
    await sqliteStorage.initializeTestData();
    console.log("\u2705 SQLite initialis\xE9 avec succ\xE8s");
    return sqliteStorage;
  }
  console.log("\u26A0\uFE0F Utilisation de MemStorage (donn\xE9es en m\xE9moire)");
  console.log("\u{1F4A1} Configurez DATABASE_URL pour utiliser une vraie base de donn\xE9es");
  return new MemStorage();
}
var init_storage_factory = __esm({
  "server/storage-factory.ts"() {
    "use strict";
    init_storage();
    init_sqlite_storage();
    init_pg_storage();
    dotenv.config();
  }
});

// server/storage-instance.ts
async function initializeStorage() {
  if (!storageInstance) {
    storageInstance = await createStorage();
    try {
      const existingSetting = await storageInstance.getSystemSettingByKey("SESSION_EDIT_WINDOW");
      if (!existingSetting) {
        await storageInstance.createSystemSetting({
          key: "SESSION_EDIT_WINDOW",
          value: "60",
          description: "D\xE9lai de modification des sessions en minutes apr\xE8s cr\xE9ation",
          updatedBy: "system"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des param\xE8tres syst\xE8me:", error);
    }
  }
  return storageInstance;
}
function getStorage() {
  if (!storageInstance) {
    throw new Error("Storage not initialized. Call initializeStorage() first.");
  }
  return storageInstance;
}
var storageInstance;
var init_storage_instance = __esm({
  "server/storage-instance.ts"() {
    "use strict";
    init_storage_factory();
    storageInstance = null;
  }
});

// server/rgpd-compliance.ts
var rgpd_compliance_exports = {};
__export(rgpd_compliance_exports, {
  RGPDCompliance: () => RGPDCompliance,
  rgpdCompliance: () => rgpdCompliance
});
var RGPDCompliance, rgpdCompliance;
var init_rgpd_compliance = __esm({
  "server/rgpd-compliance.ts"() {
    "use strict";
    init_storage_instance();
    RGPDCompliance = class {
      // 📋 Article 15 RGPD - Droit d'accès
      async exportUserData(userId) {
        const storage2 = getStorage();
        try {
          const user = await storage2.getUser(userId);
          if (!user) {
            throw new Error("Utilisateur non trouv\xE9");
          }
          const sessions4 = await storage2.getSessionsByTeacher(userId);
          const teacherSetup = await storage2.getTeacherSetup(userId);
          const userData = {
            exportDate: (/* @__PURE__ */ new Date()).toISOString(),
            user: {
              id: user.id,
              username: user.username,
              name: user.name,
              role: user.role,
              initials: user.initials,
              inPacte: user.inPacte
              // Mot de passe exclu pour sécurité
            },
            sessions: sessions4.map((session5) => ({
              id: session5.id,
              date: session5.date,
              timeSlot: session5.timeSlot,
              type: session5.type,
              status: session5.status,
              createdAt: session5.createdAt,
              updatedAt: session5.updatedAt
            })),
            teacherSetup: teacherSetup ? {
              inPacte: teacherSetup.inPacte,
              signature: teacherSetup.signature ? "Signature pr\xE9sente" : "Aucune signature"
            } : null,
            legalBasis: "Int\xE9r\xEAt l\xE9gitime - Gestion administrative des heures suppl\xE9mentaires",
            retentionPeriod: "5 ans apr\xE8s fin de relation contractuelle",
            dataController: {
              name: process.env.SCHOOL_NAME || "\xC9tablissement scolaire",
              address: process.env.SCHOOL_ADDRESS || "Adresse non configur\xE9e",
              email: process.env.SCHOOL_EMAIL || "contact@etablissement.fr",
              dpo: {
                name: process.env.DPO_NAME || "DPO non d\xE9sign\xE9",
                email: process.env.DPO_EMAIL || "dpo@etablissement.fr"
              }
            }
          };
          console.log(`\u{1F4CA} Export RGPD effectu\xE9 pour l'utilisateur ${user.username} (ID: ${userId})`);
          return userData;
        } catch (error) {
          console.error("\u274C Erreur export RGPD:", error);
          throw error;
        }
      }
      // 🗑️ Article 17 RGPD - Droit à l'effacement
      async deleteUserData(userId, reason) {
        const storage2 = getStorage();
        try {
          const user = await storage2.getUser(userId);
          if (!user) {
            throw new Error("Utilisateur non trouv\xE9");
          }
          const canDelete = await this.canDeleteUserData(userId);
          if (!canDelete.allowed) {
            throw new Error(`Effacement impossible: ${canDelete.reason}`);
          }
          const sessions4 = await storage2.getSessionsByTeacher(userId);
          for (const session5 of sessions4) {
            await storage2.deleteSession(session5.id);
          }
          const teacherSetup = await storage2.getTeacherSetup(userId);
          if (teacherSetup) {
            await storage2.deleteTeacherSetup(userId);
          }
          await storage2.deleteUser(userId);
          console.log(`\u{1F5D1}\uFE0F Suppression RGPD effectu\xE9e pour l'utilisateur ${user.username} (ID: ${userId}). Raison: ${reason}`);
          return true;
        } catch (error) {
          console.error("\u274C Erreur suppression RGPD:", error);
          throw error;
        }
      }
      // 🔍 Vérifier si les données peuvent être supprimées
      async canDeleteUserData(userId) {
        const storage2 = getStorage();
        try {
          const sessions4 = await storage2.getSessionsByTeacher(userId);
          const pendingSessions = sessions4.filter(
            (s) => s.status === "PENDING_REVIEW" || s.status === "PENDING_VALIDATION" || s.status === "VALIDATED"
          );
          if (pendingSessions.length > 0) {
            return {
              allowed: false,
              reason: `${pendingSessions.length} session(s) en cours de traitement. Finaliser d'abord le processus.`
            };
          }
          const retentionYears = parseInt(process.env.DATA_RETENTION_YEARS || "5");
          const oldestSession = sessions4.reduce((oldest, session5) => {
            const sessionDate = new Date(session5.createdAt);
            return sessionDate < oldest ? sessionDate : oldest;
          }, /* @__PURE__ */ new Date());
          const retentionEndDate = new Date(oldestSession);
          retentionEndDate.setFullYear(retentionEndDate.getFullYear() + retentionYears);
          if (/* @__PURE__ */ new Date() < retentionEndDate) {
            return {
              allowed: false,
              reason: `P\xE9riode de r\xE9tention l\xE9gale non \xE9coul\xE9e (jusqu'au ${retentionEndDate.toLocaleDateString("fr-FR")})`
            };
          }
          return { allowed: true };
        } catch (error) {
          return {
            allowed: false,
            reason: `Erreur lors de la v\xE9rification: ${error.message}`
          };
        }
      }
      // 📝 Article 16 RGPD - Droit de rectification
      async updateUserData(userId, updates) {
        const storage2 = getStorage();
        try {
          const user = await storage2.getUser(userId);
          if (!user) {
            throw new Error("Utilisateur non trouv\xE9");
          }
          const allowedFields = ["name", "username", "initials"];
          const filteredUpdates = Object.keys(updates).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
            obj[key] = updates[key];
            return obj;
          }, {});
          if (Object.keys(filteredUpdates).length === 0) {
            throw new Error("Aucun champ modifiable fourni");
          }
          await storage2.updateUser(userId, filteredUpdates);
          console.log(`\u270F\uFE0F Rectification RGPD effectu\xE9e pour l'utilisateur ${user.username} (ID: ${userId}). Champs: ${Object.keys(filteredUpdates).join(", ")}`);
          return true;
        } catch (error) {
          console.error("\u274C Erreur rectification RGPD:", error);
          throw error;
        }
      }
      // 📊 Générer un rapport de conformité
      async generateComplianceReport() {
        const storage2 = getStorage();
        try {
          const users4 = await storage2.getUsers();
          const allSessions = await storage2.getSessions();
          const report = {
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            dataController: {
              name: process.env.SCHOOL_NAME || "\xC9tablissement scolaire",
              dpo: process.env.DPO_NAME || "DPO non d\xE9sign\xE9"
            },
            statistics: {
              totalUsers: users4.length,
              totalSessions: allSessions.length,
              usersByRole: users4.reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
              }, {}),
              sessionsByStatus: allSessions.reduce((acc, session5) => {
                acc[session5.status] = (acc[session5.status] || 0) + 1;
                return acc;
              }, {})
            },
            dataRetention: {
              policy: `${process.env.DATA_RETENTION_YEARS || 5} ans`,
              oldestData: allSessions.length > 0 ? Math.min(...allSessions.map((s) => new Date(s.createdAt).getTime())) : null
            },
            securityMeasures: {
              passwordHashing: "bcrypt (12 rounds)",
              sessionSecurity: "Secure cookies, HTTPS only",
              accessControl: "Role-based permissions",
              auditLogging: "Enabled"
            }
          };
          return report;
        } catch (error) {
          console.error("\u274C Erreur g\xE9n\xE9ration rapport RGPD:", error);
          throw error;
        }
      }
    };
    rgpdCompliance = new RGPDCompliance();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage_instance();
import { createServer } from "http";

// server/auth.ts
init_storage_instance();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session4 from "express-session";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
var scryptAsync = promisify(scrypt);
var AUTH_MODE = process.env.AUTH_MODE || "HYBRID";
var DEV_EASY_LOGIN = process.env.DEV_EASY_LOGIN === "true";
var ADMIN_DEV_PASSWORD = process.env.ADMIN_DEV_PASSWORD || "DevAdmin2024!";
console.log(`\u{1F510} Mode d'authentification: ${AUTH_MODE}`);
console.log(`\u{1F9EA} Connexion facile d\xE9veloppement: ${DEV_EASY_LOGIN ? "ACTIV\xC9E" : "D\xC9SACTIV\xC9E"}`);
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}
async function comparePasswords(supplied, stored) {
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    return await bcrypt.compare(supplied, stored);
  }
}
function isAdminDevAccess(username, password) {
  const isDevMode = AUTH_MODE === "DEV" || AUTH_MODE === "HYBRID";
  const isAdminDevUser = username === "admin.dev@supchaissac.local";
  const isCorrectPassword = password === ADMIN_DEV_PASSWORD;
  if (isDevMode && isAdminDevUser && isCorrectPassword) {
    console.log("\u{1F513} Acc\xE8s admin de d\xE9veloppement accord\xE9");
    return true;
  }
  return false;
}
function setupAuth(app2) {
  const storage2 = getStorage();
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "teacher-hours-secret",
    resave: false,
    saveUninitialized: false,
    store: storage2.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      secure: false,
      // Dans un environnement de développement, nous ne voulons pas des cookies sécurisés
      sameSite: "lax"
      // Permet d'envoyer le cookie lors des navigations
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session4(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const storage3 = getStorage();
        if (isAdminDevAccess(username, password)) {
          let adminDevUser = await storage3.getUserByUsername("admin.dev@supchaissac.local");
          if (!adminDevUser) {
            console.log("\u{1F527} Cr\xE9ation de l'utilisateur admin de d\xE9veloppement...");
            try {
              adminDevUser = await storage3.createUser({
                username: "admin.dev@supchaissac.local",
                name: "Admin D\xE9veloppement",
                role: "ADMIN",
                initials: "AD",
                signature: null,
                inPacte: false,
                password: await hashPassword(ADMIN_DEV_PASSWORD)
              });
              console.log("\u2705 Utilisateur admin dev cr\xE9\xE9 avec ID:", adminDevUser.id);
            } catch (createError) {
              console.error("\u274C Erreur cr\xE9ation admin dev:", createError);
              return done(createError);
            }
          }
          console.log("\u2705 Connexion admin dev r\xE9ussie:", adminDevUser.name, "ID:", adminDevUser.id);
          return done(null, adminDevUser);
        }
        const startTime = Date.now();
        console.log(`\u{1F510} [AUTH] Tentative de connexion utilisateur: ${username}`);
        const user = await storage3.getUserByUsername(username);
        if (!user) {
          console.log(`\u274C [AUTH] Utilisateur non trouv\xE9: ${username} (${Date.now() - startTime}ms)`);
          return done(null, false);
        }
        console.log(`\u{1F464} [AUTH] Utilisateur trouv\xE9: ${user.name} (${user.role})`);
        let isPasswordValid = false;
        let authMethod = "";
        if (AUTH_MODE === "DEV") {
          isPasswordValid = password === "password123";
          authMethod = "DEV_MODE";
          console.log(`\u{1F9EA} [AUTH] Mode d\xE9veloppement activ\xE9`);
        } else if (AUTH_MODE === "PRODUCTION") {
          isPasswordValid = await comparePasswords(password, user.password);
          authMethod = "BCRYPT_SECURE";
          console.log(`\u{1F512} [AUTH] V\xE9rification s\xE9curis\xE9e bcrypt`);
        } else {
          if (DEV_EASY_LOGIN && password === "password123") {
            isPasswordValid = true;
            authMethod = "DEV_EASY";
            console.log(`\u{1F9EA} [AUTH] Connexion d\xE9veloppement facile pour: ${user.name}`);
          } else {
            isPasswordValid = await comparePasswords(password, user.password);
            authMethod = "BCRYPT_HYBRID";
            console.log(`\u{1F512} [AUTH] V\xE9rification bcrypt en mode hybride`);
          }
        }
        const duration = Date.now() - startTime;
        if (isPasswordValid) {
          console.log(`\u2705 [AUTH] Connexion r\xE9ussie: ${user.name} (${user.role}) via ${authMethod} (${duration}ms)`);
          return done(null, user);
        } else {
          console.log(`\u274C [AUTH] Mot de passe incorrect pour: ${username} via ${authMethod} (${duration}ms)`);
          return done(null, false);
        }
      } catch (err) {
        console.error("\u274C Erreur d'authentification:", err);
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    console.log("\u{1F504} S\xE9rialisation utilisateur:", user.id, user.username);
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const storage3 = getStorage();
      console.log("\u{1F504} D\xE9s\xE9rialisation utilisateur ID:", id);
      const user = await storage3.getUser(id);
      if (!user) {
        console.log("\u274C Utilisateur non trouv\xE9 pour ID:", id);
        return done(null, false);
      }
      console.log("\u2705 Utilisateur d\xE9s\xE9rialis\xE9:", user.username);
      done(null, user);
    } catch (err) {
      console.error("\u274C Erreur d\xE9s\xE9rialisation:", err);
      done(null, false);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const storage3 = getStorage();
      const existingUser = await storage3.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Ce nom d'utilisateur existe d\xE9j\xE0");
      }
      const user = await storage3.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("\u274C Erreur destruction session:", destroyErr);
        }
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });
  app2.post("/api/clear-session", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("\u274C Erreur nettoyage session:", err);
        return res.status(500).json({ message: err.message });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Session cleared successfully" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  app2.get("/api/rgpd/my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { rgpdCompliance: rgpdCompliance2 } = await Promise.resolve().then(() => (init_rgpd_compliance(), rgpd_compliance_exports));
      const userData = await rgpdCompliance2.exportUserData(req.user.id);
      res.json(userData);
    } catch (error) {
      console.error("\u274C Erreur export donn\xE9es RGPD:", error);
      res.status(500).json({ error: "Erreur lors de l'export des donn\xE9es" });
    }
  });
  app2.post("/api/rgpd/delete-my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Raison de suppression requise" });
      }
      const { rgpdCompliance: rgpdCompliance2 } = await Promise.resolve().then(() => (init_rgpd_compliance(), rgpd_compliance_exports));
      await rgpdCompliance2.deleteUserData(req.user.id, reason);
      req.logout((err) => {
        if (err) console.error("Erreur d\xE9connexion:", err);
        res.json({ message: "Donn\xE9es supprim\xE9es avec succ\xE8s" });
      });
    } catch (error) {
      console.error("\u274C Erreur suppression donn\xE9es RGPD:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/rgpd/update-my-data", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { rgpdCompliance: rgpdCompliance2 } = await Promise.resolve().then(() => (init_rgpd_compliance(), rgpd_compliance_exports));
      await rgpdCompliance2.updateUserData(req.user.id, req.body);
      res.json({ message: "Donn\xE9es mises \xE0 jour avec succ\xE8s" });
    } catch (error) {
      console.error("\u274C Erreur mise \xE0 jour donn\xE9es RGPD:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

// server/routes.ts
import { z as z3 } from "zod";

// shared/schema.ts
import { pgTable as pgTable2, text as text3, serial as serial2, integer as integer3, boolean as boolean2, timestamp as timestamp2, pgEnum as pgEnum2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema3 } from "drizzle-zod";
var userRoleEnum = pgEnum2("user_role", ["TEACHER", "SECRETARY", "PRINCIPAL", "ADMIN"]);
var users3 = pgTable2("users", {
  id: serial2("id").primaryKey(),
  username: text3("username").notNull().unique(),
  password: text3("password").notNull(),
  name: text3("name").notNull(),
  role: userRoleEnum("role").notNull().default("TEACHER"),
  initials: text3("initials"),
  signature: text3("signature"),
  inPacte: boolean2("in_pacte").default(false)
});
var timeSlotEnum = pgEnum2("time_slot", [
  "M1",
  "M2",
  "M3",
  "M4",
  // Morning slots
  "S1",
  "S2",
  "S3",
  "S4"
  // Afternoon slots
]);
var sessionTypeEnum2 = pgEnum2("session_type", ["RCD", "DEVOIRS_FAITS", "HSE", "AUTRE"]);
var sessionStatusEnum2 = pgEnum2("session_status", [
  "PENDING_REVIEW",
  // Just created by teacher
  "PENDING_DOCUMENTS",
  // Waiting for attachments from teacher
  "PENDING_VALIDATION",
  // Verified by secretary, waiting for principal
  "VALIDATED",
  // Validated by principal
  "REJECTED",
  // Rejected by secretary or principal
  "READY_FOR_PAYMENT",
  // Ready to be processed for payment
  "PAID"
  // Marked as paid by secretary
]);
var sessions3 = pgTable2("sessions", {
  id: serial2("id").primaryKey(),
  date: text3("date").notNull(),
  // Date in YYYY-MM-DD format
  timeSlot: timeSlotEnum("time_slot").notNull(),
  type: sessionTypeEnum2("type").notNull(),
  teacherId: integer3("teacher_id").notNull(),
  teacherName: text3("teacher_name").notNull(),
  inPacte: boolean2("in_pacte").default(false),
  status: sessionStatusEnum2("status").notNull().default("PENDING_REVIEW"),
  createdAt: timestamp2("created_at").notNull().defaultNow(),
  updatedAt: timestamp2("updated_at"),
  updatedBy: text3("updated_by"),
  // Fields specific to RCD
  replacedTeacherPrefix: text3("replaced_teacher_prefix"),
  // M. or Mme
  replacedTeacherLastName: text3("replaced_teacher_last_name"),
  replacedTeacherFirstName: text3("replaced_teacher_first_name"),
  replacedTeacherName: text3("replaced_teacher_name"),
  className: text3("class_name"),
  subject: text3("subject"),
  comment: text3("comment"),
  // Fields specific to Devoirs Faits
  studentCount: integer3("student_count"),
  gradeLevel: text3("grade_level"),
  // Fields specific to Autre
  description: text3("description")
});
var teacherSetups3 = pgTable2("teacher_setups", {
  id: serial2("id").primaryKey(),
  teacherId: integer3("teacher_id").notNull().unique(),
  inPacte: boolean2("in_pacte").default(false),
  signature: text3("signature")
});
var systemSettings3 = pgTable2("system_settings", {
  id: serial2("id").primaryKey(),
  key: text3("key").notNull().unique(),
  value: text3("value").notNull(),
  description: text3("description"),
  updatedAt: timestamp2("updated_at").defaultNow(),
  updatedBy: text3("updated_by")
});
var insertUserSchema3 = createInsertSchema3(users3).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  inPacte: true
});
var insertSessionSchema3 = createInsertSchema3(sessions3).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: true
});
var insertTeacherSetupSchema3 = createInsertSchema3(teacherSetups3).omit({
  id: true
});
var insertSystemSettingSchema3 = createInsertSchema3(systemSettings3).omit({
  id: true,
  updatedAt: true
});

// server/routes.ts
import multer from "multer";
import bcrypt2 from "bcrypt";
import Papa from "papaparse";
import iconv from "iconv-lite";
import fs from "fs";
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}
async function registerRoutes(app2) {
  await initializeStorage();
  const storage2 = getStorage();
  setupAuth(app2);
  app2.get("/api/sessions", isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log(`\u{1F4CA} [API] GET /api/sessions - User: ${req.user.name} (${userRole})`);
    try {
      let sessions4;
      if (userRole === "TEACHER") {
        console.log(`\u{1F393} [API] R\xE9cup\xE9ration des sessions pour l'enseignant ID: ${userId}`);
        sessions4 = await storage2.getSessionsByTeacher(userId);
      } else {
        console.log(`\u{1F465} [API] R\xE9cup\xE9ration de toutes les sessions (r\xF4le: ${userRole})`);
        sessions4 = await storage2.getSessions();
      }
      const duration = Date.now() - startTime;
      console.log(`\u2705 [API] Sessions r\xE9cup\xE9r\xE9es: ${sessions4.length} sessions (${duration}ms)`);
      res.json(sessions4);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`\u{1F6A8} [API] Erreur r\xE9cup\xE9ration sessions pour ${req.user.name} (${duration}ms):`, error);
      res.status(500).json({
        error: "Failed to fetch sessions",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/sessions/teacher/:teacherId", isAuthenticated, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      if (req.user.role === "TEACHER" && req.user.id !== teacherId) {
        return res.status(403).json({ error: "Un enseignant ne peut consulter que ses propres sessions" });
      }
      const sessions4 = await storage2.getSessionsByTeacher(teacherId);
      res.json(sessions4);
    } catch (error) {
      res.status(500).json({ error: "Impossible de r\xE9cup\xE9rer les sessions de cet enseignant" });
    }
  });
  app2.get("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const session5 = await storage2.getSessionById(parseInt(req.params.id));
      if (!session5) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (req.user.role === "TEACHER" && session5.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(session5);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });
  app2.get("/api/sessions/:id/edit-status", isAuthenticated, async (req, res) => {
    try {
      const session5 = await storage2.getSessionById(parseInt(req.params.id));
      if (!session5) {
        return res.status(404).json({ error: "Session non trouv\xE9e" });
      }
      if (req.user.role === "TEACHER" && session5.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      }
      if (req.user.role !== "TEACHER" || session5.status !== "PENDING_REVIEW") {
        return res.json({
          isEditable: req.user.role !== "TEACHER" || session5.status === "PENDING_REVIEW",
          editWindow: null,
          elapsed: null,
          remaining: null
        });
      }
      const editWindowSetting = await storage2.getSystemSettingByKey("SESSION_EDIT_WINDOW");
      const editWindowMinutes = editWindowSetting ? parseInt(editWindowSetting.value) : 60;
      const creationTime = new Date(session5.createdAt).getTime();
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      const diffMinutes = Math.floor((currentTime - creationTime) / (1e3 * 60));
      const remainingMinutes = Math.max(0, editWindowMinutes - diffMinutes);
      return res.json({
        isEditable: diffMinutes <= editWindowMinutes,
        editWindow: editWindowMinutes,
        elapsed: diffMinutes,
        remaining: remainingMinutes
      });
    } catch (error) {
      res.status(500).json({ error: "Impossible de v\xE9rifier le statut d'\xE9dition" });
    }
  });
  app2.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      console.log("\u{1F4DD} Donn\xE9es re\xE7ues:", req.body);
      const validatedData = insertSessionSchema3.parse(req.body);
      console.log("\u2705 Donn\xE9es valid\xE9es:", validatedData);
      if (req.user.role === "TEACHER" && validatedData.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Cannot create sessions for other teachers" });
      }
      const teacher = await storage2.getUserById(validatedData.teacherId);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const sessionDataWithOriginalType = {
        ...validatedData,
        teacherName: teacher.name,
        // Utiliser le vrai nom au lieu de l'email
        originalType: validatedData.type,
        status: "PENDING_REVIEW"
        // Statut par défaut
      };
      console.log("\u{1F527} Donn\xE9es finales pour insertion:", sessionDataWithOriginalType);
      const session5 = await storage2.createSession(sessionDataWithOriginalType);
      res.status(201).json(session5);
    } catch (error) {
      console.error("Error creating session:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app2.patch("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session5 = await storage2.getSessionById(sessionId);
      if (!session5) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (req.user.role === "TEACHER") {
        if (session5.teacherId !== req.user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        if (session5.status !== "PENDING_REVIEW" && session5.status !== "PENDING_DOCUMENTS") {
          return res.status(403).json({ error: "Cannot update sessions that are already in review" });
        }
      } else if (req.user.role === "SECRETARY") {
        if (req.body.status && req.body.status !== session5.status) {
          const allowedTransitions = {
            "PENDING_REVIEW": ["PENDING_VALIDATION", "PENDING_DOCUMENTS", "REJECTED"],
            "PENDING_DOCUMENTS": ["PENDING_VALIDATION", "REJECTED"],
            "VALIDATED": ["PAID"]
            // Si fonctionnalité paiement activée
          };
          const currentStatus = session5.status;
          const newStatus = req.body.status;
          if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
            return res.status(403).json({
              error: `Transition non autoris\xE9e: ${currentStatus} \u2192 ${newStatus}`
            });
          }
        }
      } else if (req.user.role === "PRINCIPAL") {
        if (req.body.status && req.body.status !== session5.status) {
          const allowedTransitions = {
            "PENDING_REVIEW": ["PENDING_VALIDATION", "PENDING_DOCUMENTS", "VALIDATED", "REJECTED"],
            "PENDING_DOCUMENTS": ["PENDING_VALIDATION", "VALIDATED", "REJECTED"],
            "PENDING_VALIDATION": ["VALIDATED", "REJECTED"]
          };
          const currentStatus = session5.status;
          const newStatus = req.body.status;
          if (!allowedTransitions[currentStatus] || !allowedTransitions[currentStatus].includes(newStatus)) {
            return res.status(403).json({
              error: `Transition non autoris\xE9e: ${currentStatus} \u2192 ${newStatus}`
            });
          }
        }
      } else if (req.user.role === "ADMIN") {
        if (req.body.status && req.body.status !== session5.status) {
          return res.status(403).json({
            error: "Les administrateurs ne peuvent pas changer le statut des s\xE9ances. Cette fonctionnalit\xE9 est r\xE9serv\xE9e \xE0 la direction et au secr\xE9tariat."
          });
        }
        const editWindowSetting = await storage2.getSystemSettingByKey("SESSION_EDIT_WINDOW");
        if (editWindowSetting) {
          const editWindowMinutes = parseInt(editWindowSetting.value);
          const creationTime = new Date(session5.createdAt).getTime();
          const currentTime = (/* @__PURE__ */ new Date()).getTime();
          const diffMinutes = Math.floor((currentTime - creationTime) / (1e3 * 60));
          if (diffMinutes > editWindowMinutes) {
            return res.status(403).json({
              error: "Le d\xE9lai de modification a expir\xE9",
              details: {
                editWindow: editWindowMinutes,
                elapsed: diffMinutes,
                remaining: 0
              }
            });
          }
        }
      }
      if (req.body.status && req.body.status !== session5.status) {
        await createStatusNotification(session5, req.body.status, req.body.comment);
      }
      const updatedSession = await storage2.updateSession(sessionId, {
        ...req.body,
        updatedBy: req.user.name
      });
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });
  app2.delete("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session5 = await storage2.getSessionById(sessionId);
      if (!session5) {
        return res.status(404).json({ error: "Session not found" });
      }
      if (req.user.role === "TEACHER") {
        if (session5.teacherId !== req.user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        if (session5.status !== "PENDING_REVIEW") {
          return res.status(403).json({ error: "Cannot delete sessions that are already in review" });
        }
      } else if (req.user.role === "ADMIN") {
        if (session5.status === "VALIDATED") {
          return res.status(403).json({
            error: "Les administrateurs ne peuvent pas supprimer des s\xE9ances d\xE9j\xE0 valid\xE9es. Cette op\xE9ration est r\xE9serv\xE9e \xE0 la direction."
          });
        }
        const editWindowSetting = await storage2.getSystemSettingByKey("SESSION_EDIT_WINDOW");
        if (editWindowSetting) {
          const editWindowMinutes = parseInt(editWindowSetting.value);
          const creationTime = new Date(session5.createdAt).getTime();
          const currentTime = (/* @__PURE__ */ new Date()).getTime();
          const diffMinutes = Math.floor((currentTime - creationTime) / (1e3 * 60));
          if (diffMinutes > editWindowMinutes) {
            return res.status(403).json({
              error: "Le d\xE9lai de modification a expir\xE9",
              details: {
                editWindow: editWindowMinutes,
                elapsed: diffMinutes,
                remaining: 0
              }
            });
          }
        }
      }
      await storage2.deleteSession(sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete session" });
    }
  });
  app2.get("/api/teacher-setup", isAuthenticated, async (req, res) => {
    try {
      const teacherId = req.user.id;
      let setup = await storage2.getTeacherSetup(teacherId);
      if (!setup) {
        setup = await storage2.createTeacherSetup({
          teacherId,
          inPacte: false
        });
      }
      res.json(setup);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teacher setup" });
    }
  });
  app2.patch("/api/teacher-setup", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "TEACHER") {
        return res.status(403).json({ error: "Only teachers can update their setup" });
      }
      const teacherId = req.user.id;
      let setup = await storage2.getTeacherSetup(teacherId);
      if (!setup) {
        setup = await storage2.createTeacherSetup({
          teacherId,
          ...req.body
        });
      } else {
        setup = await storage2.updateTeacherSetup(teacherId, req.body);
      }
      res.json(setup);
    } catch (error) {
      res.status(500).json({ error: "Failed to update teacher setup" });
    }
  });
  app2.patch("/api/user/signature", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { signature } = req.body;
      if (!signature) {
        return res.status(400).json({ error: "Signature is required" });
      }
      const user = await storage2.updateUser(userId, { signature });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update signature" });
    }
  });
  const uploadCSV = multer({
    dest: "tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
    // 5MB max
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
      } else {
        cb(new Error("Seuls les fichiers CSV sont accept\xE9s"));
      }
    }
  });
  const uploadAttachment = multer({
    dest: "uploads/attachments/",
    limits: { fileSize: 10 * 1024 * 1024 },
    // 10MB max
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "image/jpeg",
        "image/png",
        "image/gif"
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Type de fichier non autoris\xE9. Formats accept\xE9s: PDF, Excel, CSV, Images"));
      }
    }
  });
  function isAdmin(req, res, next) {
    if (req.isAuthenticated() && (req.user.role === "ADMIN" || req.user.username === "admin@example.com")) {
      return next();
    }
    res.status(403).json({ error: "Acc\xE8s r\xE9serv\xE9 aux administrateurs" });
  }
  app2.get("/api/system-settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage2.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Impossible de r\xE9cup\xE9rer les param\xE8tres syst\xE8me" });
    }
  });
  app2.get("/api/system-settings/:key", isAuthenticated, async (req, res) => {
    try {
      const setting = await storage2.getSystemSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Param\xE8tre non trouv\xE9" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Impossible de r\xE9cup\xE9rer le param\xE8tre" });
    }
  });
  app2.patch("/api/system-settings/:key", isAdmin, async (req, res) => {
    try {
      const { value } = req.body;
      if (!value) {
        return res.status(400).json({ error: "La valeur du param\xE8tre est requise" });
      }
      const setting = await storage2.getSystemSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Param\xE8tre non trouv\xE9" });
      }
      const updatedSetting = await storage2.updateSystemSetting(
        req.params.key,
        value,
        req.user.name
      );
      res.json(updatedSetting);
    } catch (error) {
      res.status(500).json({ error: "Impossible de mettre \xE0 jour le param\xE8tre" });
    }
  });
  app2.post("/api/admin/import-users", isAdmin, uploadCSV.single("csvFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier CSV fourni" });
      }
      console.log("\u{1F527} Lecture du fichier Pronote avec structure connue...");
      let fileBuffer = fs.readFileSync(req.file.path);
      let csvContent = iconv.decode(fileBuffer, "utf8");
      console.log("\u{1F4CA} Fichier brut, taille:", csvContent.length, "caract\xE8res");
      if (csvContent.includes("+ADs-")) {
        console.log("\u{1F50D} Format Pronote encod\xE9 d\xE9tect\xE9 - D\xE9codage avec structure r\xE9elle...");
        let decoded = csvContent.replace(/\+ADs-/g, ";").replace(/\+AEA-/g, "@").replace(/\+AC0-/g, "-").replace(/\+ACY-/g, "&").replace(/\+ACI-/g, '"').replace(/\+ACA-/g, " ").replace(/\+/g, "");
        console.log("\u{1F50D} Apr\xE8s d\xE9codage:", decoded.substring(0, 200));
        console.log("\u{1F50D} Analyse intelligente du fichier Pronote...");
        const singleLine = decoded.replace(/\n/g, "").replace(/\r/g, "");
        const allFields = singleLine.split(";");
        console.log(`\u{1F4CA} Total champs: ${allFields.length}`);
        console.log(`\u{1F50D} Premiers champs:`, allFields.slice(0, 15));
        let headerIndex = -1;
        for (let i = 0; i < Math.min(50, allFields.length); i++) {
          const field = allFields[i].trim().toUpperCase();
          if (field === "LOGIN" || field === "NOM" || field === "PRENOM") {
            headerIndex = i;
            break;
          }
        }
        console.log(`\u{1F3AF} En-t\xEAtes d\xE9tect\xE9s \xE0 l'index: ${headerIndex}`);
        if (headerIndex === -1) headerIndex = 0;
        const teachers = [];
        const startIndex = headerIndex === 0 ? 0 : headerIndex;
        for (let i = startIndex; i < allFields.length - 12; i += 13) {
          const login = allFields[i] || "";
          const civilite = allFields[i + 1] || "";
          const nom = allFields[i + 2] || "";
          const prenom = allFields[i + 3] || "";
          const dateNaiss = allFields[i + 4] || "";
          const lieuNaiss = allFields[i + 5] || "";
          const famille = allFields[i + 6] || "";
          const discipline = allFields[i + 7] || "";
          const email = allFields[i + 8] || "";
          const cleanLogin = login.trim();
          const cleanNom = nom.trim();
          const cleanPrenom = prenom.trim();
          const cleanEmail = email.trim();
          const cleanDiscipline = discipline.trim();
          const isValidName = (name) => {
            return name && name.length > 1 && name.length < 50 && !name.includes("@") && !name.match(/^\d/) && !name.match(/^[A-Z]{1,4}$/) && !name.includes("L1") && name !== "NOM" && name !== "PRENOM" && name !== "LOGIN";
          };
          const isValidEmail = (email2) => {
            return email2.includes("@") && email2.includes(".");
          };
          if (isValidName(cleanNom) && isValidName(cleanPrenom)) {
            let finalLogin = cleanLogin;
            if (!finalLogin || finalLogin.length < 2) {
              finalLogin = (cleanPrenom.charAt(0) + cleanNom.replace(/\s+/g, "")).toLowerCase();
            }
            let finalEmail = cleanEmail;
            if (!isValidEmail(finalEmail)) {
              finalEmail = `${finalLogin}@ac-nantes.fr`;
            }
            teachers.push({
              LOGIN: finalLogin,
              NOM: cleanNom.toUpperCase(),
              PRENOM: cleanPrenom,
              EMAIL: finalEmail,
              DISCIPLINE: cleanDiscipline
            });
            console.log(`   \u2705 ${teachers.length}. ${cleanPrenom} ${cleanNom} (${finalLogin})`);
          }
        }
        const headers2 = ["LOGIN", "NOM", "PRENOM", "EMAIL", "DISCIPLINE"];
        const csvLines = [headers2.join(",")];
        for (const teacher of teachers) {
          const line = headers2.map((h) => `"${teacher[h] || ""}"`).join(",");
          csvLines.push(line);
        }
        csvContent = csvLines.join("\n");
        console.log(`\u2705 ${teachers.length} enseignants extraits avec la structure Pronote r\xE9elle`);
        teachers.slice(0, 3).forEach((teacher, i) => {
          console.log(`   ${i + 1}. ${teacher.PRENOM} ${teacher.NOM} (${teacher.LOGIN}) - ${teacher.EMAIL}`);
        });
      }
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        transformHeader: (header) => header.trim().toUpperCase()
      });
      const users4 = parseResult.data;
      const headers = parseResult.meta.fields || [];
      console.log("\u2705 Parsing final r\xE9ussi!");
      console.log("\u{1F50D} En-t\xEAtes finaux:", headers);
      console.log("\u{1F50D} Utilisateurs \xE0 importer:", users4.length);
      if (users4.length > 0) {
        console.log("\u{1F50D} Premier utilisateur pars\xE9:", users4[0]);
      }
      let imported = 0;
      let skipped = 0;
      let errors = 0;
      const details = [];
      const columnMapping = {
        login: "LOGIN",
        // Colonne 0
        nom: "NOM",
        // Colonne 2
        prenom: "PRENOM",
        // Colonne 3
        email: "EMAIL",
        // Colonne 8
        discipline: "DISCIPLINE"
        // Colonne 7
      };
      console.log("\u{1F3AF} Mapping Pronote exact:", columnMapping);
      details.push(`\u{1F4CA} ANALYSE DU FICHIER CSV:`);
      details.push(`   S\xE9parateur: ${parseResult.meta.delimiter}`);
      details.push(`   Colonnes trouv\xE9es (${headers.length}): ${headers.join(", ")}`);
      details.push(`   Lignes de donn\xE9es: ${users4.length}`);
      details.push(`   Mapping d\xE9tect\xE9:`);
      details.push(`     LOGIN \u2192 ${columnMapping.login || "NON TROUV\xC9"}`);
      details.push(`     NOM \u2192 ${columnMapping.nom || "NON TROUV\xC9"}`);
      details.push(`     PRENOM \u2192 ${columnMapping.prenom || "NON TROUV\xC9"}`);
      details.push(`     EMAIL \u2192 ${columnMapping.email || "NON TROUV\xC9"}`);
      details.push(``);
      for (const userData of users4) {
        try {
          const login = columnMapping.login ? userData[columnMapping.login] : "";
          const nom = columnMapping.nom ? userData[columnMapping.nom] : "";
          const prenom = columnMapping.prenom ? userData[columnMapping.prenom] : "";
          const email = columnMapping.email ? userData[columnMapping.email] : "";
          const discipline = columnMapping.discipline ? userData[columnMapping.discipline] : "";
          const classes = columnMapping.classes ? userData[columnMapping.classes] : "";
          const cleanLogin = (login || "").trim();
          const cleanNom = (nom || "").trim().toUpperCase();
          const cleanPrenom = (prenom || "").trim();
          const cleanEmail = (email || "").trim();
          console.log(`\u{1F50D} Extraction: LOGIN="${cleanLogin}", NOM="${cleanNom}", PRENOM="${cleanPrenom}"`);
          if (!cleanNom || !cleanPrenom) {
            details.push(`\u26A0\uFE0F Ligne ignor\xE9e - Nom ou pr\xE9nom manquant (LOGIN: ${cleanLogin})`);
            skipped++;
            continue;
          }
          const username = cleanLogin || cleanEmail || `${cleanPrenom.toLowerCase().replace(/[^a-z]/g, "")}.${cleanNom.toLowerCase().replace(/[^a-z]/g, "")}@college-chaissac.fr`;
          const existing = await storage2.getUserByUsername(username);
          if (existing) {
            details.push(`\u26A0\uFE0F ${cleanPrenom} ${cleanNom} (${username}) existe d\xE9j\xE0`);
            skipped++;
            continue;
          }
          const name = `${cleanPrenom} ${cleanNom}`;
          const initials = `${cleanPrenom.charAt(0).toUpperCase()}${cleanNom.charAt(0).toUpperCase()}`;
          const hashedPassword = await bcrypt2.hash("SupChaissac2025!", 12);
          const inPacte = false;
          const user = await storage2.createUser({
            username,
            name,
            role: "TEACHER",
            initials,
            inPacte,
            password: hashedPassword
          });
          try {
            await storage2.createTeacherSetup({
              teacherId: user.id,
              inPacte,
              signature: null
            });
          } catch (setupError) {
            console.log("\u26A0\uFE0F Impossible de cr\xE9er teacher_setup pour", user.name, ":", setupError.message);
          }
          details.push(`\u2705 ${name} import\xE9`);
          imported++;
        } catch (error) {
          details.push(`\u274C Erreur: ${error.message}`);
          errors++;
        }
      }
      fs.unlinkSync(req.file.path);
      res.json({
        imported,
        skipped,
        errors,
        details
      });
    } catch (error) {
      res.status(500).json({ error: `Erreur d'import: ${error.message}` });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      console.log("\u{1F50D} API /api/admin/users appel\xE9e par:", req.user?.username);
      const users4 = await storage2.getUsers();
      console.log(`\u{1F4CA} ${users4.length} utilisateurs trouv\xE9s`);
      res.json(users4);
    } catch (error) {
      console.log("\u274C Erreur API /api/admin/users:", error);
      res.status(500).json({ error: "Impossible de r\xE9cup\xE9rer les utilisateurs" });
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedUser = await storage2.updateUser(userId, updateData);
      if (updateData.inPacte !== void 0) {
        try {
          const teacherSetup = await storage2.getTeacherSetup(userId);
          if (teacherSetup) {
            await storage2.updateTeacherSetup(userId, { inPacte: updateData.inPacte });
          } else {
            await storage2.createTeacherSetup({
              teacherId: userId,
              inPacte: updateData.inPacte,
              signature: null
            });
          }
        } catch (setupError) {
          console.log("\u26A0\uFE0F Erreur mise \xE0 jour teacher_setup:", setupError.message);
        }
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Impossible de mettre \xE0 jour l'utilisateur" });
    }
  });
  app2.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage2.getUserById(userId);
      if (user?.role === "ADMIN") {
        const allUsers = await storage2.getUsers();
        const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;
        if (adminCount <= 1) {
          return res.status(400).json({ error: "Impossible de supprimer le dernier administrateur" });
        }
      }
      await storage2.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Impossible de supprimer l'utilisateur" });
    }
  });
  app2.post("/api/sessions/:sessionId/attachments", isAuthenticated, uploadAttachment.single("file"), async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }
      const session5 = await storage2.getSessionById(sessionId);
      if (!session5) {
        return res.status(404).json({ error: "Session non trouv\xE9e" });
      }
      if (req.user.role === "TEACHER" && session5.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Vous ne pouvez joindre des documents qu'\xE0 vos propres sessions" });
      }
      const attachmentData = {
        sessionId,
        fileName: `${Date.now()}_${file.originalname}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        uploadedBy: req.user.id
      };
      const attachment = await storage2.createAttachment(attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ error: "Erreur lors de l'upload du document" });
    }
  });
  app2.get("/api/sessions/:sessionId/attachments", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const attachments2 = await storage2.getAttachmentsBySession(sessionId);
      res.json(attachments2);
    } catch (error) {
      console.error("Error getting attachments:", error);
      res.status(500).json({ error: "Erreur lors de la r\xE9cup\xE9ration des documents" });
    }
  });
  app2.get("/api/attachments/:id/download", isAuthenticated, async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage2.getAttachmentById(attachmentId);
      if (!attachment) {
        return res.status(404).json({ error: "Document non trouv\xE9" });
      }
      const session5 = await storage2.getSessionById(attachment.sessionId);
      if (!session5) {
        return res.status(404).json({ error: "Session associ\xE9e non trouv\xE9e" });
      }
      if (req.user.role === "TEACHER" && session5.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Acc\xE8s non autoris\xE9 \xE0 ce document" });
      }
      res.download(attachment.filePath, attachment.originalName);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ error: "Erreur lors du t\xE9l\xE9chargement" });
    }
  });
  app2.patch("/api/attachments/:id/verify", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role === "TEACHER") {
        return res.status(403).json({ error: "Seuls les secr\xE9taires et principaux peuvent v\xE9rifier les documents" });
      }
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage2.verifyAttachment(attachmentId, req.user.id);
      if (!attachment) {
        return res.status(404).json({ error: "Document non trouv\xE9" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Error verifying attachment:", error);
      res.status(500).json({ error: "Erreur lors de la v\xE9rification" });
    }
  });
  app2.patch("/api/attachments/:id/archive", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role === "TEACHER") {
        return res.status(403).json({ error: "Seuls les secr\xE9taires et principaux peuvent archiver les documents" });
      }
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage2.archiveAttachment(attachmentId, req.user.id);
      if (!attachment) {
        return res.status(404).json({ error: "Document non trouv\xE9" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Error archiving attachment:", error);
      res.status(500).json({ error: "Erreur lors de l'archivage" });
    }
  });
  app2.delete("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      const attachment = await storage2.getAttachmentById(attachmentId);
      if (!attachment) {
        return res.status(404).json({ error: "Document non trouv\xE9" });
      }
      const session5 = await storage2.getSessionById(attachment.sessionId);
      if (!session5) {
        return res.status(404).json({ error: "Session associ\xE9e non trouv\xE9e" });
      }
      if (req.user.role === "TEACHER" && session5.teacherId !== req.user.id) {
        return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres documents" });
      }
      const deleted = await storage2.deleteAttachment(attachmentId);
      if (deleted) {
        try {
          fs.unlinkSync(attachment.filePath);
        } catch (error) {
          console.warn("Could not delete physical file:", error);
        }
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Erreur lors de la suppression" });
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }
  });
  app2.get("/api/pacte/teachers", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["SECRETARY", "PRINCIPAL", "ADMIN"].includes(user.role)) {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      }
      console.log(`\u{1F50D} API /api/pacte/teachers appel\xE9e par: ${user.username}`);
      const teachers = await storage2.getUsers({ role: "TEACHER" });
      const teachersWithStats = await Promise.all(
        teachers.map(async (teacher) => {
          const sessions4 = await storage2.getSessions({ teacherId: teacher.id });
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const currentYearSessions = sessions4.filter(
            (s) => new Date(s.date).getFullYear() === currentYear
          );
          return {
            ...teacher,
            stats: {
              totalSessions: sessions4.length,
              currentYearSessions: currentYearSessions.length,
              rcdSessions: currentYearSessions.filter((s) => s.type === "RCD").length,
              devoirsFaitsSessions: currentYearSessions.filter((s) => s.type === "DEVOIRS_FAITS").length,
              hseSessions: currentYearSessions.filter((s) => s.type === "HSE").length,
              validatedSessions: currentYearSessions.filter((s) => s.status === "VALIDATED" || s.status === "PAID").length
            }
          };
        })
      );
      console.log(`\u{1F4CA} ${teachersWithStats.length} enseignants trouv\xE9s avec statistiques`);
      res.json(teachersWithStats);
    } catch (error) {
      console.error("\u274C Erreur lors de la r\xE9cup\xE9ration des enseignants:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  app2.patch("/api/pacte/teachers/:id/status", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!["SECRETARY", "PRINCIPAL", "ADMIN"].includes(user.role)) {
        return res.status(403).json({ error: "Acc\xE8s refus\xE9" });
      }
      const teacherId = parseInt(req.params.id);
      const { inPacte, reason, schoolYear } = req.body;
      console.log(`\u{1F504} Modification statut PACTE enseignant ${teacherId} par: ${user.username}`);
      const teacher = await storage2.getUser(teacherId);
      if (!teacher) {
        return res.status(404).json({ error: "Enseignant non trouv\xE9" });
      }
      if (teacher.role !== "TEACHER") {
        return res.status(400).json({ error: "Seuls les enseignants peuvent avoir un statut PACTE" });
      }
      const updatedTeacher = await storage2.updateUser(teacherId, {
        inPacte,
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log(`\u2705 Statut PACTE mis \xE0 jour pour: ${teacher.name}`);
      res.json({
        success: true,
        teacher: updatedTeacher,
        message: `Statut PACTE mis \xE0 jour pour ${teacher.name}`
      });
    } catch (error) {
      console.error("\u274C Erreur lors de la modification du statut PACTE:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  async function createStatusNotification(session5, newStatus, comment) {
    try {
      let title = "";
      let message = "";
      switch (newStatus) {
        case "PENDING_DOCUMENTS":
          title = "Pi\xE8ces jointes requises";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) n\xE9cessite des pi\xE8ces jointes suppl\xE9mentaires.`;
          if (comment) {
            message += `

Message de la secr\xE9taire : ${comment}`;
          }
          break;
        case "REJECTED":
          title = "D\xE9claration rejet\xE9e";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) a \xE9t\xE9 rejet\xE9e.`;
          if (comment) {
            message += `

Motif : ${comment}`;
          }
          break;
        case "PENDING_VALIDATION":
          title = "D\xE9claration transmise";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) a \xE9t\xE9 transmise au principal pour validation.`;
          break;
        case "VALIDATED":
          title = "D\xE9claration valid\xE9e";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) a \xE9t\xE9 valid\xE9e par le principal.`;
          break;
        case "READY_FOR_PAYMENT":
          title = "Pr\xEAt pour paiement";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) est pr\xEAte pour le paiement.`;
          break;
        case "PAID":
          title = "D\xE9claration pay\xE9e";
          message = `Votre d\xE9claration du ${new Date(session5.date).toLocaleDateString("fr-FR")} (${session5.type}) a \xE9t\xE9 mise en paiement.`;
          break;
      }
      if (title && message) {
        await storage2.db.execute(`
          INSERT INTO notifications (user_id, session_id, type, title, message)
          VALUES ($1, $2, $3, $4, $5)
        `, [session5.teacherId, session5.id, newStatus, title, message]);
        console.log(`\u{1F4EC} Notification cr\xE9\xE9e pour l'utilisateur ${session5.teacherId}: ${title}`);
      }
    } catch (error) {
      console.error("Erreur lors de la cr\xE9ation de la notification:", error);
    }
  }
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    configFile: false,
    root: path.resolve(__dirname, "..", "client"),
    build: {
      outDir: path.resolve(__dirname, "..", "dist", "public"),
      emptyOutDir: true
    },
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
