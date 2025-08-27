import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';
import fs from 'fs';
import path from 'path';

async function createTestAttachments() {
  console.log('📎 Création de pièces jointes de test...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer les sessions existantes
    const sessions = await storage.getSessions();
    console.log(`📊 ${sessions.length} sessions trouvées`);
    
    if (sessions.length === 0) {
      console.log('❌ Aucune session trouvée');
      return;
    }
    
    // Créer le dossier uploads/attachments s'il n'existe pas
    const uploadsDir = 'uploads/attachments';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Créer des fichiers de test
    const testFiles = [
      {
        name: 'justificatif_remplacement.pdf',
        content: 'Contenu PDF simulé - Justificatif de remplacement',
        mimeType: 'application/pdf'
      },
      {
        name: 'planning_devoirs_faits.xlsx',
        content: 'Contenu Excel simulé - Planning des devoirs faits',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      {
        name: 'rapport_activite.docx',
        content: 'Contenu Word simulé - Rapport d\'activité',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    ];
    
    let attachmentId = 1;
    
    // Ajouter des pièces jointes à quelques sessions
    for (let i = 0; i < Math.min(3, sessions.length); i++) {
      const session = sessions[i];
      const numAttachments = Math.floor(Math.random() * 2) + 1; // 1-2 pièces jointes par session
      
      console.log(`\n📎 Ajout de ${numAttachments} pièce(s) jointe(s) à la session ${session.id} (${session.teacherName})`);
      
      for (let j = 0; j < numAttachments; j++) {
        const testFile = testFiles[j % testFiles.length];
        const fileName = `attachment_${attachmentId}_${Date.now()}.${testFile.name.split('.').pop()}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Créer le fichier physique
        fs.writeFileSync(filePath, testFile.content);
        
        // Créer l'enregistrement en base
        const attachment = await storage.createAttachment({
          sessionId: session.id,
          fileName: fileName,
          originalName: testFile.name,
          mimeType: testFile.mimeType,
          fileSize: testFile.content.length,
          filePath: filePath,
          uploadedBy: session.teacherId,
          isVerified: Math.random() > 0.5, // 50% de chance d'être vérifié
          verifiedBy: Math.random() > 0.5 ? 3 : null, // Vérifié par la secrétaire (ID 3)
          verifiedAt: Math.random() > 0.5 ? new Date() : null,
          isArchived: false
        });
        
        console.log(`   ✅ ${testFile.name} → ${fileName} (${testFile.content.length} bytes)`);
        attachmentId++;
      }
    }
    
    // Afficher le résumé
    console.log('\n📊 Résumé des pièces jointes créées:');
    for (const session of sessions.slice(0, 3)) {
      const attachments = await storage.getAttachmentsBySession(session.id);
      if (attachments.length > 0) {
        console.log(`   Session ${session.id} (${session.teacherName}): ${attachments.length} pièce(s) jointe(s)`);
        attachments.forEach(att => {
          console.log(`     - ${att.originalName} (${att.isVerified ? 'Vérifié' : 'À vérifier'})`);
        });
      }
    }
    
    console.log('\n✅ Pièces jointes de test créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestAttachments();
