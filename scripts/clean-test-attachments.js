import 'dotenv/config';
import { getStorage, initializeStorage } from '../server/storage-instance.ts';
import fs from 'fs';

async function cleanTestAttachments() {
  console.log('🧹 Suppression des fichiers de test...');
  
  try {
    await initializeStorage();
    const storage = getStorage();
    
    // Récupérer toutes les sessions
    const sessions = await storage.getSessions();
    let deletedCount = 0;
    
    for (const session of sessions) {
      const attachments = await storage.getAttachmentsBySession(session.id);
      
      for (const attachment of attachments) {
        const isTestFile = attachment.fileName.startsWith('attachment_') || 
                          attachment.originalName.includes('justificatif_remplacement') ||
                          attachment.originalName.includes('planning_devoirs_faits') ||
                          attachment.originalName.includes('rapport_activite');
        
        if (isTestFile) {
          console.log(`🗑️ Suppression: ${attachment.originalName} (${attachment.fileName})`);
          
          // Supprimer le fichier physique
          if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
            console.log(`   📁 Fichier physique supprimé`);
          }
          
          // Supprimer l'enregistrement en base
          await storage.deleteAttachment(attachment.id);
          console.log(`   🗄️ Enregistrement base supprimé`);
          
          deletedCount++;
        }
      }
    }
    
    console.log(`\n✅ ${deletedCount} fichiers de test supprimés`);
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    let remainingAttachments = 0;
    
    for (const session of sessions) {
      const attachments = await storage.getAttachmentsBySession(session.id);
      if (attachments.length > 0) {
        console.log(`📋 Session ${session.id} (${session.teacherName}): ${attachments.length} pièce(s) jointe(s)`);
        attachments.forEach(att => {
          console.log(`   ✅ ${att.originalName}`);
        });
        remainingAttachments += attachments.length;
      }
    }
    
    if (remainingAttachments === 0) {
      console.log('✅ Aucune pièce jointe restante - Base propre');
    } else {
      console.log(`📊 ${remainingAttachments} pièce(s) jointe(s) réelle(s) conservée(s)`);
    }
    
    // Nettoyer le dossier uploads
    const uploadsDir = 'uploads/attachments';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      console.log(`\n📁 Fichiers restants dans ${uploadsDir}: ${files.length}`);
      files.forEach(file => {
        console.log(`   📄 ${file}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

cleanTestAttachments();
