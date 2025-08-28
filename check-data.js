import Database from "better-sqlite3";

const db = new Database('./data/supchaissac.db');

console.log('📊 VÉRIFICATION DES DONNÉES SQLite');
console.log('================================');

// Compter les utilisateurs
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`👥 Utilisateurs: ${userCount.count}`);

// Lister les utilisateurs
const users = db.prepare('SELECT id, username, name, role FROM users').all();
console.log('\n📋 Liste des utilisateurs:');
users.forEach(user => {
  console.log(`  ${user.id}. ${user.name} (${user.username}) - ${user.role}`);
});

// Compter les sessions
const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
console.log(`\n📚 Sessions: ${sessionCount.count}`);

// Lister les sessions
const sessions = db.prepare('SELECT id, teacher_id, date, time_slot, type, status FROM sessions').all();
console.log('\n📋 Liste des sessions:');
sessions.forEach(session => {
  console.log(`  ${session.id}. Teacher ${session.teacherId} - ${session.date} ${session.timeSlot} (${session.type}) - ${session.status}`);
});

db.close();
