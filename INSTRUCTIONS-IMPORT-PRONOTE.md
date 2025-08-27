# 📊 INSTRUCTIONS POUR L'IMPORT PRONOTE

## 🎯 OBJECTIF
Importer automatiquement tous les enseignants depuis PRONOTE vers SupChaissac avec leurs informations de contrat PACTE.

## 📋 ÉTAPES POUR LE CHEF D'ÉTABLISSEMENT

### 1. **EXPORT DEPUIS PRONOTE**
- Aller dans PRONOTE → Gestion des personnels → Enseignants
- Exporter au format CSV avec **TOUTES** les colonnes disponibles
- Sauvegarder le fichier (ex: `enseignants-pronote-2025.csv`)

### 2. **NETTOYAGE DU FICHIER CSV**
Ouvrir le fichier CSV dans Excel/LibreOffice et **CONSERVER UNIQUEMENT** ces colonnes :

| **COLONNE OBLIGATOIRE** | **DESCRIPTION** | **EXEMPLE** |
|-------------------------|-----------------|-------------|
| `LOGIN` | Identifiant de connexion Pronote | `claire.bernard` |
| `NOM` | Nom de famille | `BERNARD` |
| `PRENOM` | Prénom | `Claire` |

| **COLONNE OPTIONNELLE** | **DESCRIPTION** | **EXEMPLE** |
|-------------------------|-----------------|-------------|
| `CIVILITE` | M./Mme | `Mme` |
| `EMAIL` | Adresse email | `claire.bernard@college-chaissac.fr` |
| `DISCIPLINE` | Matière principale | `MATHEMATIQUES` |
| `CLASSES` | Classes attribuées | `4B 3A 5C` |

### 3. **SUPPRIMER LES COLONNES INUTILES**
**SUPPRIMER** toutes les autres colonnes comme :
- `DATE_NAISS`, `LIEU_NAISS`, `FAMILLE`
- `CODE_MATIERE`, `PREC_MATIERE`, `PREF`
- Toutes les colonnes non listées ci-dessus

### 4. **FORMAT FINAL ATTENDU**
Le fichier CSV final doit ressembler à ceci :

```csv
LOGIN,CIVILITE,NOM,PRENOM,EMAIL,DISCIPLINE,CLASSES
claire.bernard,Mme,BERNARD,Claire,claire.bernard@college-chaissac.fr,MATHEMATIQUES,4B 3A 5C
pierre.moreau,M.,MOREAU,Pierre,pierre.moreau@college-chaissac.fr,FRANCAIS,6A 5B 4C
anne.leroy,Mme,LEROY,Anne,anne.leroy@college-chaissac.fr,HISTOIRE-GEOGRAPHIE,3A 4A 5A
```

## ⚠️ POINTS IMPORTANTS

### **COLONNES OBLIGATOIRES :**
- `LOGIN` : Sera utilisé comme identifiant de connexion
- `NOM` : Nom de famille
- `PRENOM` : Prénom

### **GESTION AUTOMATIQUE :**
- **Email manquant** : Généré automatiquement (`prenom.nom@college-chaissac.fr`)
- **Statut PACTE** : TOUS définis sur "HORS PACTE" par défaut
- **Mot de passe** : `SupChaissac2025!` pour tous (à changer à la première connexion)
- **Initiales** : Générées automatiquement (Première lettre prénom + nom)

### **GESTION DES PACTE APRÈS IMPORT :**
1. **Se connecter en secrétaire** : `secretary@example.com` / `password123`
2. **Aller dans l'onglet "PACTE"**
3. **Pour chaque enseignant en PACTE** :
   - Cliquer sur "Changer"
   - Indiquer le motif : "Contrat PACTE 2025-2026"
   - Confirmer le changement
4. **Avantages** :
   - 🛡️ Traçabilité complète (qui, quand, pourquoi)
   - 🔄 Modification possible en cours d'année
   - 📊 Statistiques automatiques
   - 🚫 Pas de risque d'erreur Excel

### **DÉTECTION DOUBLONS :**
- Vérification automatique par LOGIN/EMAIL
- Les doublons sont ignorés avec rapport détaillé

## 🚀 UTILISATION DANS SUPCHAISSAC

1. **Se connecter en admin** : `admin@example.com` / `password123`
2. **Aller dans l'onglet "Import PRONOTE"**
3. **Sélectionner le fichier CSV nettoyé**
4. **Lancer l'import**
5. **Vérifier le rapport** : Importés, ignorés, erreurs

## 📞 SUPPORT
En cas de problème, fournir :
- Le fichier CSV original de Pronote
- Le fichier CSV nettoyé
- Le message d'erreur exact de SupChaissac

---
**📅 Document créé le :** 8 août 2025  
**🔄 Version :** 1.0  
**👨‍💻 Support technique :** SupChaissac Team
