# 🚀 Guide de Déploiement Rapide - SupChaissac

## 🎯 Déploiement en 3 Étapes

### **Étape 1 : Configuration de l'Environnement**
```bash
# Lancer le configurateur
setup-environment.bat

# Choisir votre environnement :
# [1] Développement Local (recommandé pour débuter)
# [2] Test/Staging
# [3] Production Cloud
# [4] Production Serveur
```

### **Étape 2 : Déploiement**
```bash
# Lancer le gestionnaire de déploiement
deploy-manager.bat

# Choisir "Déploiement Complet" pour la première fois
# Le script va automatiquement :
# - Vérifier le système
# - Installer les dépendances
# - Créer une sauvegarde
# - Démarrer l'application
```

### **Étape 3 : Vérification**
- 🌐 Ouvrir http://localhost:5000
- 🔐 Se connecter avec les identifiants par défaut
- ✅ Vérifier que tout fonctionne

---

## 📋 Scripts Disponibles

### **🎛️ deploy-manager.bat**
**Gestionnaire principal de déploiement**

| Option | Description | Utilisation |
|--------|-------------|-------------|
| Déploiement Complet | Installation complète + démarrage | **Première installation** |
| Déploiement Rapide | Démarrage rapide | **Développement quotidien** |
| Sauvegarde | Créer une sauvegarde | **Avant modifications** |
| Mode Test | Tests automatisés | **Validation** |
| Mode Production | Optimisations production | **Mise en ligne** |

### **⚙️ setup-environment.bat**
**Configuration des environnements**

| Environnement | Base de données | Port | Usage |
|---------------|-----------------|------|-------|
| Développement | SQLite | 5000 | **Développement local** |
| Test | SQLite | 5001 | **Tests automatisés** |
| Production Cloud | PostgreSQL | 5000 | **Vercel, Railway** |
| Production Serveur | PostgreSQL | 5000 | **Serveur dédié** |

### **📦 version-manager.bat**
**Gestion des versions**

| Action | Description | Quand l'utiliser |
|--------|-------------|------------------|
| Créer version | Snapshot de l'état actuel | **Avant modifications importantes** |
| Lister versions | Voir toutes les versions | **Suivi des versions** |
| Basculer version | Revenir à une version | **Rollback en cas de problème** |
| Exporter version | Créer une archive | **Partage ou sauvegarde** |

---

## 🔧 Configurations Recommandées

### **👨‍💻 Pour le Développement**
```bash
# 1. Configuration
setup-environment.bat → [1] Développement Local

# 2. Déploiement
deploy-manager.bat → [1] Déploiement Complet

# 3. Utilisation quotidienne
deploy-manager.bat → [2] Déploiement Rapide
```

### **🧪 Pour les Tests**
```bash
# 1. Configuration
setup-environment.bat → [2] Test/Staging

# 2. Tests
deploy-manager.bat → [5] Mode Test

# 3. Validation
# Vérifier http://localhost:5001
```

### **🌐 Pour la Production Cloud**
```bash
# 1. Configuration locale
setup-environment.bat → [3] Production Cloud

# 2. Configuration plateforme
# - Vercel : Configurer variables d'environnement
# - Railway : Ajouter PostgreSQL
# - Render : Configurer build

# 3. Déploiement
# Push vers Git → Déploiement automatique
```

### **🏢 Pour un Serveur Dédié**
```bash
# 1. Préparation serveur
# - Installer Node.js 18+
# - Installer PostgreSQL
# - Configurer Nginx

# 2. Configuration
setup-environment.bat → [4] Production Serveur

# 3. Déploiement
deploy-manager.bat → [6] Déploiement Production
```

---

## 🛠️ Maintenance et Gestion

### **📊 Surveillance**
```bash
# Vérification système
deploy-manager.bat → [7] Vérification Système

# Maintenance
deploy-manager.bat → [8] Maintenance
```

### **💾 Sauvegardes**
```bash
# Sauvegarde manuelle
deploy-manager.bat → [3] Créer une Sauvegarde

# Gestion des versions
version-manager.bat → [1] Créer une nouvelle version
```

### **🔄 Mises à Jour**
```bash
# Depuis Git
deploy-manager.bat → [4] Mise à Jour depuis Git

# Rollback si problème
version-manager.bat → [3] Basculer vers une version
```

---

## 🚨 Résolution de Problèmes

### **❌ Erreurs Courantes**

#### **Port 5000 occupé**
```bash
# Solution automatique
deploy-manager.bat → Le script libère automatiquement le port

# Solution manuelle
netstat -ano | findstr :5000
taskkill /F /PID [PID_NUMBER]
```

#### **Erreur de base de données**
```bash
# Vérifier la configuration
type .env

# Recréer la base
deploy-manager.bat → [8] Maintenance → [4] Optimiser la base de données
```

#### **Dépendances manquantes**
```bash
# Réinstaller
deploy-manager.bat → [1] Déploiement Complet
# OU
npm install
```

#### **Erreur de build**
```bash
# Nettoyer et rebuilder
deploy-manager.bat → [8] Maintenance → [1] Nettoyer les fichiers temporaires
npm run build
```

### **🔍 Diagnostic**
```bash
# Vérification complète
deploy-manager.bat → [7] Vérification Système

# Logs d'erreur
deploy-manager.bat → [8] Maintenance → [2] Analyser les logs
```

---

## 📞 Support et Ressources

### **📚 Documentation Complète**
- `docs/DEPLOIEMENT.md` - Guide détaillé
- `docs/TROUBLESHOOTING.md` - Résolution de problèmes
- `docs/ARCHITECTURE.md` - Architecture technique

### **🔧 Fichiers de Configuration**
- `.env` - Configuration active
- `.env.example` - Exemple de configuration
- `package.json` - Dépendances et scripts

### **📁 Structure des Dossiers**
```
DEPLOIEMENT-2025-08-26-07-52/
├── deploy-manager.bat          # 🎛️ Gestionnaire principal
├── setup-environment.bat      # ⚙️ Configuration environnement
├── version-manager.bat         # 📦 Gestion des versions
├── start-complete.bat          # 🚀 Démarrage simple
├── .env                        # ⚙️ Configuration active
├── data/                       # 💾 Base de données
├── backups/                    # 💾 Sauvegardes
├── versions/                   # 📦 Versions archivées
├── docs/                       # 📚 Documentation
└── logs/                       # 📊 Fichiers de log
```

---

## ✅ Checklist de Déploiement

### **🎯 Première Installation**
- [ ] Installer Node.js 18+
- [ ] Cloner/télécharger le projet
- [ ] Lancer `setup-environment.bat`
- [ ] Choisir l'environnement approprié
- [ ] Lancer `deploy-manager.bat`
- [ ] Choisir "Déploiement Complet"
- [ ] Tester sur http://localhost:5000
- [ ] Créer une première version avec `version-manager.bat`

### **🔄 Mise à Jour**
- [ ] Créer une sauvegarde
- [ ] Mettre à jour le code
- [ ] Tester en mode développement
- [ ] Déployer en production
- [ ] Vérifier le fonctionnement
- [ ] Créer une nouvelle version

### **🚀 Mise en Production**
- [ ] Configurer l'environnement production
- [ ] Configurer la base de données PostgreSQL
- [ ] Configurer HTTPS/SSL
- [ ] Tester tous les workflows
- [ ] Configurer les sauvegardes automatiques
- [ ] Configurer le monitoring

---

## 🎉 Félicitations !

Votre application SupChaissac est maintenant déployée et prête à l'emploi !

**Prochaines étapes recommandées :**
1. 📖 Lire la documentation complète
2. 🧪 Tester tous les workflows
3. 👥 Former les utilisateurs
4. 📊 Configurer le monitoring
5. 💾 Planifier les sauvegardes

**Besoin d'aide ?**
- Consultez `docs/TROUBLESHOOTING.md`
- Vérifiez les logs avec `deploy-manager.bat`
- Utilisez `version-manager.bat` pour revenir en arrière si nécessaire
