# 🏭 SupChaissac - Guide de Mise en Production

## ✅ CONFORMITÉ RGPD ET SÉCURITÉ

### 🛡️ **Sécurité Implémentée**

- ✅ **Authentification sécurisée** : bcrypt avec 12 rounds
- ✅ **Sessions sécurisées** : Cookies httpOnly, secure en production
- ✅ **Gestion des rôles** : TEACHER, SECRETARY, PRINCIPAL, ADMIN
- ✅ **Protection CSRF** : Intégrée dans les sessions
- ✅ **Validation des données** : Zod schemas côté serveur
- ✅ **Logs d'audit** : Traçabilité des actions sensibles

### 📋 **Conformité RGPD**

- ✅ **Droit d'accès** (Art. 15) : Export des données utilisateur
- ✅ **Droit de rectification** (Art. 16) : Modification des données
- ✅ **Droit à l'effacement** (Art. 17) : Suppression sécurisée
- ✅ **Droit à la portabilité** (Art. 20) : Export format JSON
- ✅ **Limitation de conservation** : 5 ans configurable
- ✅ **Sécurité des données** (Art. 32) : Chiffrement, accès contrôlé

## 🚀 **Déploiement Production**

### **1. Prérequis Serveur**

```bash
# Ubuntu Server 20.04+ ou Windows Server 2019+
# Node.js 18+
# PostgreSQL 13+
# Nginx (reverse proxy)
# SSL/TLS certificat
```

### **2. Installation Base de Données**

```sql
-- Créer la base de données
CREATE DATABASE supchaissac_prod;
CREATE USER supchaissac_user WITH PASSWORD 'MOT_DE_PASSE_FORT';
GRANT ALL PRIVILEGES ON DATABASE supchaissac_prod TO supchaissac_user;

-- Activer le chiffrement
ALTER DATABASE supchaissac_prod SET ssl = on;
```

### **3. Configuration Application**

```bash
# 1. Cloner le projet
git clone [votre-repo] /var/www/supchaissac
cd /var/www/supchaissac

# 2. Installer les dépendances
npm ci --only=production

# 3. Configurer l'environnement
cp .env.production .env
# Éditer .env avec vos vraies valeurs

# 4. Build de production
npm run build

# 5. Initialiser la base de données
npm run db:migrate
```

### **4. Configuration Nginx**

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.fr;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Sécurité SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.fr;
    return 301 https://$server_name$request_uri;
}
```

### **5. Service Systemd**

```ini
# /etc/systemd/system/supchaissac.service
[Unit]
Description=SupChaissac Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/supchaissac
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Activer le service
sudo systemctl enable supchaissac
sudo systemctl start supchaissac
sudo systemctl status supchaissac
```

## 📊 **Monitoring et Maintenance**

### **Logs de Sécurité**
```bash
# Surveiller les tentatives de connexion
tail -f /var/log/supchaissac/security.log

# Alertes automatiques
grep "FAILED_LOGIN" /var/log/supchaissac/security.log | wc -l
```

### **Sauvegarde Automatique**
```bash
#!/bin/bash
# /etc/cron.daily/supchaissac-backup

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/supchaissac"

# Sauvegarde base de données
pg_dump -h localhost -U supchaissac_user supchaissac_prod > "$BACKUP_DIR/db_$DATE.sql"

# Chiffrer la sauvegarde
gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output "$BACKUP_DIR/db_$DATE.sql.gpg" "$BACKUP_DIR/db_$DATE.sql"
rm "$BACKUP_DIR/db_$DATE.sql"

# Nettoyer les anciennes sauvegardes (30 jours)
find "$BACKUP_DIR" -name "*.gpg" -mtime +30 -delete
```

## 🔒 **Checklist de Sécurité**

### **Avant la mise en production :**

- [ ] **Base de données** : PostgreSQL avec SSL activé
- [ ] **Mots de passe** : Tous les mots de passe par défaut changés
- [ ] **SESSION_SECRET** : Clé secrète unique générée
- [ ] **HTTPS** : Certificat SSL valide installé
- [ ] **Firewall** : Seuls les ports 80/443 ouverts
- [ ] **Utilisateurs** : Comptes de test supprimés
- [ ] **Logs** : Système de logs configuré
- [ ] **Sauvegarde** : Script de sauvegarde automatique
- [ ] **Monitoring** : Surveillance des performances
- [ ] **RGPD** : Politique de confidentialité publiée

### **Tests de sécurité :**

```bash
# Test de connexion sécurisée
curl -I https://votre-domaine.fr

# Test des headers de sécurité
curl -I https://votre-domaine.fr | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# Test de l'authentification
curl -X POST https://votre-domaine.fr/api/login -d '{"username":"test","password":"wrong"}' -H "Content-Type: application/json"
```

## 📋 **Documentation RGPD**

### **Registre des traitements :**
- **Finalité** : Gestion des heures supplémentaires
- **Base légale** : Intérêt légitime (gestion administrative)
- **Catégories de données** : Identité, données RH, signatures
- **Destinataires** : Personnel administratif autorisé
- **Durée de conservation** : 5 ans après fin de relation
- **Mesures de sécurité** : Chiffrement, contrôle d'accès, audit

### **Droits des personnes :**
- **Accès** : `/api/rgpd/my-data`
- **Rectification** : `/api/rgpd/update-my-data`
- **Effacement** : `/api/rgpd/delete-my-data`
- **Contact DPO** : Configuré dans les variables d'environnement

## ✅ **Validation Finale**

Votre application SupChaissac est maintenant :
- 🔒 **Sécurisée** pour la production
- 📋 **Conforme RGPD**
- 🏭 **Prête pour le déploiement**
- 📊 **Auditable** et traçable

**Vous pouvez présenter ce projet à votre direction en toute confiance !**
