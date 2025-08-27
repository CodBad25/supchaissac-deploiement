import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';
import fs from 'fs';

async function checkRealAttachments() {
  console.log('🔍 Vérification des vraies pièces jointes...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer toutes les sessions
    const sessions = await storage.getSessions();
    console.log(`📊 ${sessions.length} sessions trouvées`);
    
    // Vérifier les pièces jointes pour chaque session
    let totalAttachments = 0;
    let realAttachments = 0;
    let testAttachments = 0;
    
    for (const session of sessions) {
      console.log(`\n📋 Session ${session.id}: ${session.teacherName} - ${session.type} - ${session.date}`);
      
      try {
        const attachments = await storage.getAttachmentsBySession(session.id);
        totalAttachments += attachments.length;
        
        if (attachments.length === 0) {
          console.log('   📎 Aucune pièce jointe');
        } else {
          console.log(`   📎 ${attachments.length} pièce(s) jointe(s):`);
          
          for (const attachment of attachments) {
            const isTestFile = attachment.fileName.startsWith('attachment_') || 
                              attachment.originalName.includes('justificatif_remplacement') ||
                              attachment.originalName.includes('planning_devoirs_faits') ||
                              attachment.originalName.includes('rapport_activite');
            
            if (isTestFile) {
              testAttachments++;
              console.log(`   ❌ FICHIER TEST: ${attachment.originalName} (${attachment.fileName})`);
            } else {
              realAttachments++;
              console.log(`   ✅ FICHIER RÉEL: ${attachment.originalName} (${attachment.fileName})`);
            }
            
            // Vérifier si le fichier existe physiquement
            const fileExists = fs.existsSync(attachment.filePath);
            console.log(`      📁 Fichier physique: ${fileExists ? 'Existe' : 'MANQUANT'}`);
            console.log(`      📊 Taille: ${attachment.fileSize} bytes`);
            console.log(`      📅 Uploadé: ${new Date(attachment.createdAt).toLocaleString('fr-FR')}`);
            console.log(`      👤 Par: User ID ${attachment.uploadedBy}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Erreur lors de la récupération: ${error.message}`);
      }
    }
    
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   Total pièces jointes: ${totalAttachments}`);
    console.log(`   Fichiers réels (uploadés par vous): ${realAttachments}`);
    console.log(`   Fichiers de test (créés par script): ${testAttachments}`);
    
    if (testAttachments > 0) {
      console.log('\n🧹 NETTOYAGE NÉCESSAIRE:');
      console.log('   Des fichiers de test ont été détectés.');
      console.log('   Voulez-vous les supprimer pour ne garder que vos vrais fichiers ?');
    }
    
    // Vérifier le dossier uploads
    const uploadsDir = 'uploads/attachments';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`\n📁 Fichiers dans ${uploadsDir}: ${files.length}`);
      files.forEach(file => {
        const isTestFile = file.startsWith('attachment_');
        console.log(`   ${isTestFile ? '❌ TEST' : '✅ RÉEL'}: ${file}`);
      });
    } else {
      console.log(`\n📁 Dossier ${uploadsDir} n'existe pas`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkRealAttachments();
