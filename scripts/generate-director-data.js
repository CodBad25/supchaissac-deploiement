#!/usr/bin/env node

/**
 * 🎯 GÉNÉRATEUR DE DONNÉES POUR L'INTERFACE DIRECTION
 * Crée des données réalistes pour tester l'interface principal
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Données de simulation réalistes
const TEACHERS = [
  { id: 4, name: "Sophie Martin", subject: "Mathématiques", inPacte: true },
  { id: 5, name: "Pierre Dubois", subject: "Français", inPacte: false },
  { id: 6, name: "Marie Leroy", subject: "Histoire-Géo", inPacte: true },
  { id: 7, name: "Jean Moreau", subject: "Sciences", inPacte: false },
  { id: 8, name: "Claire Bernard", subject: "Anglais", inPacte: true },
  { id: 9, name: "Michel Petit", subject: "EPS", inPacte: false },
  { id: 10, name: "Anne Roux", subject: "Arts Plastiques", inPacte: true },
  { id: 11, name: "David Garcia", subject: "Technologie", inPacte: false },
  { id: 12, name: "Sylvie Blanc", subject: "Espagnol", inPacte: true },
  { id: 13, name: "Laurent Faure", subject: "Musique", inPacte: false }
];

const SESSION_TYPES = ["RCD", "DEVOIRS_FAITS", "HSE", "AUTRE"];
const STATUSES = ["PENDING_REVIEW", "PENDING_VALIDATION", "VALIDATED", "PAID", "REJECTED"];
const TIME_SLOTS = ["M1", "M2", "M3", "M4", "S1", "S2", "S3", "S4"];
const CLASSES = ["6A", "6B", "5A", "5B", "4A", "4B", "3A", "3B", "2A", "2B", "1A", "1B", "TA", "TB"];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
}

function generateSessions(count = 50) {
  const sessions = [];
  
  for (let i = 1; i <= count; i++) {
    const teacher = getRandomElement(TEACHERS);
    const type = getRandomElement(SESSION_TYPES);
    const status = getRandomElement(STATUSES);
    const date = getRandomDate();
    const timeSlot = getRandomElement(TIME_SLOTS);
    const className = getRandomElement(CLASSES);
    
    // Calcul réaliste des montants
    const duration = Math.random() > 0.7 ? 2 : 1; // 70% = 1h, 30% = 2h
    const hourlyRate = type === "RCD" ? 45.50 : 
                     type === "DEVOIRS_FAITS" ? 35.20 : 
                     type === "HSE" ? 42.80 : 38.90;
    const totalAmount = duration * hourlyRate;
    
    sessions.push({
      id: i,
      type,
      status,
      date,
      timeSlot,
      teacherId: teacher.id,
      teacherName: teacher.name,
      className,
      description: getSessionDescription(type, teacher.subject, className),
      duration,
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      subject: teacher.subject,
      gradeLevel: className.substring(0, 1),
      createdAt: new Date(date).toISOString(),
      updatedAt: Math.random() > 0.5 ? new Date().toISOString() : null,
      reviewedBy: status !== "PENDING_REVIEW" ? 3 : null, // Secretary ID
      reviewedAt: status !== "PENDING_REVIEW" ? new Date().toISOString() : null,
      validatedBy: ["VALIDATED", "PAID"].includes(status) ? 2 : null, // Principal ID
      validatedAt: ["VALIDATED", "PAID"].includes(status) ? new Date().toISOString() : null,
      rejectionReason: status === "REJECTED" ? getRandomRejectionReason() : null,
      paymentReference: status === "PAID" ? `PAY-${date.replace(/-/g, '')}-${i.toString().padStart(3, '0')}` : null
    });
  }
  
  return sessions;
}

function getSessionDescription(type, subject, className) {
  const descriptions = {
    RCD: [
      `Remplacement ${subject} en ${className}`,
      `Cours de ${subject} - Absence collègue`,
      `Suppléance ${subject} classe ${className}`
    ],
    DEVOIRS_FAITS: [
      `Aide aux devoirs ${subject}`,
      `Accompagnement personnalisé ${className}`,
      `Soutien scolaire ${subject}`
    ],
    HSE: [
      `Heures supplémentaires ${subject}`,
      `Cours supplémentaire ${className}`,
      `Rattrapage ${subject}`
    ],
    AUTRE: [
      `Surveillance d'examen`,
      `Réunion pédagogique`,
      `Formation continue`
    ]
  };
  
  return getRandomElement(descriptions[type]);
}

function getRandomRejectionReason() {
  const reasons = [
    "Justificatifs manquants",
    "Horaires non conformes",
    "Autorisation préalable requise",
    "Doublon détecté",
    "Informations incomplètes"
  ];
  return getRandomElement(reasons);
}

function generateStatistics(sessions) {
  const stats = {
    totalSessions: sessions.length,
    totalAmount: sessions.reduce((sum, s) => sum + s.totalAmount, 0),
    byStatus: {},
    byType: {},
    byMonth: {},
    teacherStats: {},
    averageAmount: 0,
    pendingValidation: 0,
    validatedThisMonth: 0
  };
  
  // Statistiques par statut
  STATUSES.forEach(status => {
    stats.byStatus[status] = sessions.filter(s => s.status === status).length;
  });
  
  // Statistiques par type
  SESSION_TYPES.forEach(type => {
    const typeSessions = sessions.filter(s => s.type === type);
    stats.byType[type] = {
      count: typeSessions.length,
      amount: typeSessions.reduce((sum, s) => sum + s.totalAmount, 0)
    };
  });
  
  // Statistiques par enseignant
  TEACHERS.forEach(teacher => {
    const teacherSessions = sessions.filter(s => s.teacherId === teacher.id);
    stats.teacherStats[teacher.id] = {
      name: teacher.name,
      subject: teacher.subject,
      inPacte: teacher.inPacte,
      totalSessions: teacherSessions.length,
      totalAmount: teacherSessions.reduce((sum, s) => sum + s.totalAmount, 0),
      lastSessionDate: teacherSessions.length > 0 ? 
        Math.max(...teacherSessions.map(s => new Date(s.date).getTime())) : null
    };
  });
  
  stats.averageAmount = stats.totalAmount / stats.totalSessions;
  stats.pendingValidation = stats.byStatus.PENDING_VALIDATION || 0;
  
  // Sessions validées ce mois
  const thisMonth = new Date().getMonth();
  stats.validatedThisMonth = sessions.filter(s => 
    s.status === "VALIDATED" && new Date(s.date).getMonth() === thisMonth
  ).length;
  
  return stats;
}

function main() {
  console.log('🎯 Génération des données pour l\'interface direction...\n');
  
  // Générer les sessions
  const sessions = generateSessions(75); // 75 sessions pour un bon volume
  const statistics = generateStatistics(sessions);
  
  // Créer le fichier de données
  const data = {
    sessions,
    statistics,
    teachers: TEACHERS,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalSessions: sessions.length,
      totalTeachers: TEACHERS.length,
      dateRange: {
        from: Math.min(...sessions.map(s => new Date(s.date).getTime())),
        to: Math.max(...sessions.map(s => new Date(s.date).getTime()))
      }
    }
  };
  
  // Sauvegarder
  const outputPath = path.join(__dirname, '..', 'data', 'director-simulation.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log('✅ Données générées avec succès !');
  console.log(`📁 Fichier: ${outputPath}`);
  console.log(`📊 ${sessions.length} sessions créées`);
  console.log(`👥 ${TEACHERS.length} enseignants`);
  console.log(`💰 Montant total: ${statistics.totalAmount.toFixed(2)}€`);
  console.log(`📈 Moyenne par session: ${statistics.averageAmount.toFixed(2)}€`);
  
  console.log('\n🎨 Répartition par statut:');
  Object.entries(statistics.byStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count} sessions`);
  });
  
  console.log('\n💡 Utilisez ces données pour tester l\'interface direction');
}

// Exécuter si appelé directement
main();
