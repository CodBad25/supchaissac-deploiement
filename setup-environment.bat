@echo off
title SupChaissac - Configuration Environnement
color 0B
setlocal enabledelayedexpansion

echo.
echo ========================================
echo    SUPCHAISSAC - CONFIGURATION ENVIRONNEMENT
echo ========================================
echo.

echo Ce script va configurer votre environnement de déploiement.
echo.

:MENU
echo Choisissez votre type d'environnement :
echo.
echo [1] 🖥️  Développement Local (SQLite)
echo [2] 🧪 Test/Staging (SQLite + Tests)
echo [3] 🌐 Production Cloud (PostgreSQL)
echo [4] 🏢 Production Serveur (PostgreSQL + SSL)
echo [5] 🔧 Configuration Personnalisée
echo [6] 📋 Afficher la configuration actuelle
echo [7] ❌ Quitter
echo.
set /p choice="Votre choix (1-7): "

if "%choice%"=="1" goto DEV_CONFIG
if "%choice%"=="2" goto TEST_CONFIG
if "%choice%"=="3" goto CLOUD_CONFIG
if "%choice%"=="4" goto SERVER_CONFIG
if "%choice%"=="5" goto CUSTOM_CONFIG
if "%choice%"=="6" goto SHOW_CONFIG
if "%choice%"=="7" goto EXIT

echo Choix invalide. Veuillez réessayer.
goto MENU

:DEV_CONFIG
echo.
echo ========================================
echo    CONFIGURATION DÉVELOPPEMENT
echo ========================================
echo.
echo Configuration pour développement local avec SQLite...

(
echo # Configuration Développement - SupChaissac
echo # Généré le %date% à %time%
echo.
echo NODE_ENV=development
echo PORT=5000
echo.
echo # Base de données SQLite locale
echo DATABASE_URL=sqlite://./data/supchaissac.db
echo.
echo # Sécurité développement
echo SESSION_SECRET=dev-secret-key-change-in-production
echo.
echo # Logs
echo LOG_LEVEL=debug
echo.
echo # Fonctionnalités développement
echo ENABLE_DEBUG=true
echo HOT_RELOAD=true
) > .env

echo ✅ Fichier .env créé pour le développement
echo.
echo Configuration appliquée :
echo - Base de données : SQLite locale
echo - Port : 5000
echo - Logs : Debug activé
echo - Hot reload : Activé
echo.
goto MENU

:TEST_CONFIG
echo.
echo ========================================
echo    CONFIGURATION TEST
echo ========================================
echo.
echo Configuration pour tests et staging...

(
echo # Configuration Test - SupChaissac
echo # Généré le %date% à %time%
echo.
echo NODE_ENV=test
echo PORT=5001
echo.
echo # Base de données test
echo DATABASE_URL=sqlite://./data/test.db
echo.
echo # Sécurité test
echo SESSION_SECRET=test-secret-key
echo.
echo # Logs
echo LOG_LEVEL=warn
echo.
echo # Tests
echo ENABLE_TESTS=true
echo TEST_TIMEOUT=30000
) > .env.test

echo ✅ Fichier .env.test créé
echo.
echo Configuration appliquée :
echo - Base de données : SQLite test
echo - Port : 5001
echo - Logs : Warnings seulement
echo - Tests : Activés
echo.
goto MENU

:CLOUD_CONFIG
echo.
echo ========================================
echo    CONFIGURATION PRODUCTION CLOUD
echo ========================================
echo.
echo Configuration pour déploiement cloud (Vercel, Railway, etc.)...
echo.
echo Vous devrez configurer ces variables dans votre plateforme cloud :
echo.

(
echo # Configuration Production Cloud - SupChaissac
echo # À configurer dans votre plateforme cloud
echo.
echo NODE_ENV=production
echo PORT=5000
echo.
echo # Base de données PostgreSQL
echo # DATABASE_URL=postgresql://user:password@host:5432/database
echo.
echo # Sécurité production
echo # SESSION_SECRET=your-super-secure-secret-key
echo.
echo # Logs
echo LOG_LEVEL=info
echo.
echo # Production
echo ENABLE_DEBUG=false
echo TRUST_PROXY=true
) > .env.production.example

echo ✅ Fichier .env.production.example créé
echo.
echo ⚠️  IMPORTANT :
echo 1. Configurez DATABASE_URL avec votre base PostgreSQL
echo 2. Générez un SESSION_SECRET sécurisé
echo 3. Configurez ces variables dans votre plateforme cloud
echo.
echo Commandes utiles :
echo - Générer SESSION_SECRET : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo.
goto MENU

:SERVER_CONFIG
echo.
echo ========================================
echo    CONFIGURATION SERVEUR PRODUCTION
echo ========================================
echo.
echo Configuration pour serveur dédié avec SSL...
echo.
set /p domain="Nom de domaine (ex: supchaissac.ac-academie.fr): "
set /p db_host="Host PostgreSQL (ex: localhost): "
set /p db_name="Nom base de données (ex: supchaissac): "
set /p db_user="Utilisateur PostgreSQL: "

echo.
echo Génération d'un SESSION_SECRET sécurisé...
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set SESSION_SECRET=%%i

(
echo # Configuration Serveur Production - SupChaissac
echo # Généré le %date% à %time%
echo.
echo NODE_ENV=production
echo PORT=5000
echo.
echo # Domaine
echo DOMAIN=%domain%
echo.
echo # Base de données PostgreSQL
echo DATABASE_URL=postgresql://%db_user%:YOUR_PASSWORD@%db_host%:5432/%db_name%
echo.
echo # Sécurité production
echo SESSION_SECRET=%SESSION_SECRET%
echo.
echo # SSL
echo FORCE_HTTPS=true
echo TRUST_PROXY=true
echo.
echo # Logs
echo LOG_LEVEL=info
echo LOG_FILE=./logs/app.log
echo.
echo # Production
echo ENABLE_DEBUG=false
echo RATE_LIMIT=true
) > .env.production

echo ✅ Fichier .env.production créé
echo.
echo ⚠️  IMPORTANT :
echo 1. Remplacez YOUR_PASSWORD par le vrai mot de passe PostgreSQL
echo 2. Configurez SSL/HTTPS sur votre serveur
echo 3. Créez le dossier logs/
echo.
goto MENU

:CUSTOM_CONFIG
echo.
echo ========================================
echo    CONFIGURATION PERSONNALISÉE
echo ========================================
echo.
echo Configuration manuelle...
echo.
set /p env_type="Type d'environnement (development/test/production): "
set /p port="Port (défaut 5000): "
if "%port%"=="" set port=5000
set /p db_type="Type de base (sqlite/postgresql): "

if /i "%db_type%"=="sqlite" (
    set /p db_path="Chemin SQLite (ex: ./data/supchaissac.db): "
    set "DATABASE_URL=sqlite://%db_path%"
) else (
    set /p db_url="URL PostgreSQL complète: "
    set "DATABASE_URL=%db_url%"
)

set /p session_secret="SESSION_SECRET (laissez vide pour générer): "
if "%session_secret%"=="" (
    for /f %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set session_secret=%%i
)

(
echo # Configuration Personnalisée - SupChaissac
echo # Généré le %date% à %time%
echo.
echo NODE_ENV=%env_type%
echo PORT=%port%
echo.
echo # Base de données
echo DATABASE_URL=%DATABASE_URL%
echo.
echo # Sécurité
echo SESSION_SECRET=%session_secret%
echo.
echo # Logs
echo LOG_LEVEL=info
) > .env

echo ✅ Configuration personnalisée créée
goto MENU

:SHOW_CONFIG
echo.
echo ========================================
echo    CONFIGURATION ACTUELLE
echo ========================================
echo.
if exist ".env" (
    echo Contenu du fichier .env :
    echo.
    type .env
) else (
    echo ❌ Aucun fichier .env trouvé
)
echo.

if exist ".env.test" (
    echo.
    echo Fichier .env.test existe ✅
)

if exist ".env.production" (
    echo Fichier .env.production existe ✅
)

if exist ".env.production.example" (
    echo Fichier .env.production.example existe ✅
)

echo.
goto MENU

:EXIT
echo.
echo ========================================
echo    Configuration terminée !
echo ========================================
echo.
echo Prochaines étapes :
echo 1. Vérifiez votre fichier .env
echo 2. Lancez deploy-manager.bat pour déployer
echo 3. Testez votre application
echo.
echo Fichiers créés :
if exist ".env" echo - .env (configuration active)
if exist ".env.test" echo - .env.test (configuration test)
if exist ".env.production" echo - .env.production (configuration production)
if exist ".env.production.example" echo - .env.production.example (exemple cloud)
echo.
pause
exit /b 0
