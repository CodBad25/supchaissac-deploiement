# 📋 GUIDE POUR LE CHEF D'ÉTABLISSEMENT

## 🎯 MISSION : Préparer le fichier CSV pour SupChaissac

### **ÉTAPE 1 : EXPORT PRONOTE** 📤
1. Ouvrir PRONOTE
2. Aller dans **"Gestion des personnels"** → **"Enseignants"**
3. Cliquer sur **"Exporter"** → **"Format CSV"**
4. **Cocher TOUTES les colonnes** disponibles
5. Sauvegarder le fichier (ex: `enseignants-pronote-2025.csv`)

### **ÉTAPE 2 : NETTOYAGE EXCEL** 🧹
1. Ouvrir le fichier CSV dans **Excel** ou **LibreOffice Calc**
2. **SUPPRIMER** toutes les colonnes SAUF celles-ci :

#### **✅ COLONNES À CONSERVER :**
| **NOM COLONNE** | **OBLIGATOIRE** | **DESCRIPTION** |
|-----------------|-----------------|-----------------|
| `LOGIN` | ✅ **OUI** | Identifiant Pronote |
| `NOM` | ✅ **OUI** | Nom de famille |
| `PRENOM` | ✅ **OUI** | Prénom |
| `CIVILITE` | ⚪ Non | M./Mme |
| `EMAIL` | ⚪ Non | Adresse email |
| `DISCIPLINE` | ⚪ Non | Matière principale |
| `CLASSES` | ⚪ Non | Classes attribuées |

> **💡 NOTE IMPORTANTE :** La colonne STATUT_PACTE n'est PAS nécessaire ! Les statuts PACTE seront définis après l'import via l'interface SupChaissac (plus sûr et plus pratique).

#### **❌ COLONNES À SUPPRIMER :**
- `DATE_NAISS` (Date de naissance)
- `LIEU_NAISS` (Lieu de naissance)  
- `FAMILLE` (Information famille)
- `CODE_MATIERE` (Code matière)
- `PREC_MATIERE` (Précision matière)
- `PREF` (Préférences)
- **Toutes les autres colonnes**

### **ÉTAPE 3 : VÉRIFICATION** ✅
Le fichier final doit ressembler à ceci :

```
LOGIN,CIVILITE,NOM,PRENOM,EMAIL,DISCIPLINE,CLASSES
claire.bernard,Mme,BERNARD,Claire,claire.bernard@college-chaissac.fr,MATHEMATIQUES,4B 3A 5C
pierre.moreau,M.,MOREAU,Pierre,pierre.moreau@college-chaissac.fr,FRANCAIS,6A 5B 4C
```

### **ÉTAPE 4 : SAUVEGARDE** 💾
1. **Sauvegarder** le fichier au format CSV
2. **Nom suggéré** : `enseignants-supchaissac-2025.csv`
3. **Transmettre** le fichier à l'administrateur SupChaissac

## 🎯 RÉSULTAT ATTENDU

### **APRÈS IMPORT PRONOTE :**
- ✅ **Tous les enseignants** créés automatiquement
- ✅ **Identifiants** : LOGIN de Pronote
- ✅ **Mots de passe** : `SupChaissac2025!` (à changer)
- ✅ **Statuts PACTE** : TOUS en "HORS PACTE" par défaut
- ✅ **Matières** : Informations conservées
- ✅ **Classes** : Informations conservées

### **APRÈS IMPORT - GESTION DES PACTE :**
1. **Interface Secrétaire** → Onglet "PACTE"
2. **Voir tous les enseignants** avec statut "Hors PACTE"
3. **Cliquer "Changer"** pour chaque enseignant en PACTE
4. **Indiquer le motif** : "Contrat PACTE 2025-2026"
5. **Confirmer** → Statut mis à jour avec traçabilité

### **AVANTAGES DE CETTE MÉTHODE :**
- 🛡️ **Plus sûr** : Pas de risque d'erreur Excel
- 📋 **Traçable** : Chaque changement avec motif et date
- 🔄 **Flexible** : Modification en cours d'année facile
- 👥 **Collaboratif** : Secrétaire gère, admin supervise

## ⏱️ TEMPS ESTIMÉ
- **Export Pronote** : 5 minutes
- **Nettoyage Excel** : 8 minutes (plus simple sans PACTE)
- **Import SupChaissac** : 2 minutes
- **Définition PACTE** : 5 minutes (via interface)

**TOTAL : 20 minutes pour importer tout l'établissement !** 🚀

## 🔄 WORKFLOW COMPLET

### **PHASE 1 : IMPORT DES ENSEIGNANTS** (Chef d'établissement)
1. Export Pronote → Nettoyage Excel → Import SupChaissac
2. **Résultat** : Tous les enseignants créés en "HORS PACTE"

### **PHASE 2 : DÉFINITION DES PACTE** (Secrétaire)
1. Interface Secrétaire → Onglet "PACTE"
2. Pour chaque enseignant en PACTE : Cliquer "Changer" → Motif → Confirmer
3. **Résultat** : Statuts PACTE corrects avec traçabilité complète

## 📞 CONTACT
En cas de difficulté, contacter l'administrateur SupChaissac avec :
- Le fichier CSV original
- Le message d'erreur exact
- Le nombre d'enseignants attendu
