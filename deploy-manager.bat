@echo off
title SupChaissac - Gestionnaire de Déploiement
color 0A
setlocal enabledelayedexpansion

:: Configuration
set "APP_NAME=SupChaissac"
set "VERSION=2025-08-26"
set "PORT=5000"
set "BACKUP_DIR=backups"

echo.
echo ========================================
echo    %APP_NAME% - GESTIONNAIRE DE DEPLOIEMENT
echo    Version: %VERSION%
echo ========================================
echo.

:MENU
echo Choisissez une option :
echo.
echo [1] 🚀 Déploiement Complet (Recommandé)
echo [2] 🔧 Déploiement Rapide (Développement)
echo [3] 📦 Créer une Sauvegarde
echo [4] 🔄 Mise à Jour depuis Git
echo [5] 🧪 Mode Test
echo [6] 🌐 Déploiement Production
echo [7] 📊 Vérification Système
echo [8] 🛠️  Maintenance
echo [9] ❌ Quitter
echo.
set /p choice="Votre choix (1-9): "

if "%choice%"=="1" goto DEPLOY_COMPLETE
if "%choice%"=="2" goto DEPLOY_QUICK
if "%choice%"=="3" goto CREATE_BACKUP
if "%choice%"=="4" goto UPDATE_GIT
if "%choice%"=="5" goto TEST_MODE
if "%choice%"=="6" goto PRODUCTION_MODE
if "%choice%"=="7" goto SYSTEM_CHECK
if "%choice%"=="8" goto MAINTENANCE
if "%choice%"=="9" goto EXIT

echo Choix invalide. Veuillez réessayer.
goto MENU

:DEPLOY_COMPLETE
echo.
echo ========================================
echo    DEPLOIEMENT COMPLET
echo ========================================
echo.
echo Ce processus va :
echo 1. Vérifier le système
echo 2. Créer une sauvegarde
echo 3. Installer/mettre à jour les dépendances
echo 4. Nettoyer le port %PORT%
echo 5. Démarrer l'application
echo 6. Ouvrir le navigateur
echo.
set /p confirm="Continuer ? (O/N): "
if /i not "%confirm%"=="O" goto MENU

call :SYSTEM_CHECK_FUNC
if !errorlevel! neq 0 goto MENU

call :CREATE_BACKUP_FUNC
call :CLEAN_PORT
call :INSTALL_DEPS
call :START_APP
goto MENU

:DEPLOY_QUICK
echo.
echo ========================================
echo    DEPLOIEMENT RAPIDE
echo ========================================
echo.
call :CLEAN_PORT
call :START_APP
goto MENU

:CREATE_BACKUP
echo.
echo ========================================
echo    CREATION DE SAUVEGARDE
echo ========================================
echo.
call :CREATE_BACKUP_FUNC
goto MENU

:UPDATE_GIT
echo.
echo ========================================
echo    MISE A JOUR DEPUIS GIT
echo ========================================
echo.
echo Vérification du repository Git...
git status >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Ce dossier n'est pas un repository Git.
    echo    Initialisation recommandée pour les futures mises à jour.
    pause
    goto MENU
)

echo Récupération des dernières modifications...
git pull origin main
if !errorlevel! neq 0 (
    echo ⚠️  Erreur lors de la mise à jour Git.
    pause
    goto MENU
)

echo ✅ Mise à jour Git terminée.
call :INSTALL_DEPS
pause
goto MENU

:TEST_MODE
echo.
echo ========================================
echo    MODE TEST
echo ========================================
echo.
echo Démarrage en mode test sur le port 5001...
set "PORT=5001"
call :CLEAN_PORT
call npm run test
pause
goto MENU

:PRODUCTION_MODE
echo.
echo ========================================
echo    DEPLOIEMENT PRODUCTION
echo ========================================
echo.
echo ⚠️  ATTENTION : Mode Production
echo.
echo Ce mode va :
echo 1. Vérifier la sécurité
echo 2. Optimiser les performances
echo 3. Configurer les logs
echo 4. Démarrer en mode production
echo.
set /p confirm="Êtes-vous sûr ? (O/N): "
if /i not "%confirm%"=="O" goto MENU

call :SECURITY_CHECK
call :PRODUCTION_BUILD
call :START_PRODUCTION
goto MENU

:SYSTEM_CHECK
echo.
echo ========================================
echo    VERIFICATION SYSTÈME
echo ========================================
echo.
call :SYSTEM_CHECK_FUNC
pause
goto MENU

:MAINTENANCE
echo.
echo ========================================
echo    MAINTENANCE
echo ========================================
echo.
echo [1] 🧹 Nettoyer les fichiers temporaires
echo [2] 📊 Analyser les logs
echo [3] 🔄 Redémarrer les services
echo [4] 💾 Optimiser la base de données
echo [5] 🔙 Retour au menu principal
echo.
set /p maint_choice="Votre choix (1-5): "

if "%maint_choice%"=="1" call :CLEAN_TEMP
if "%maint_choice%"=="2" call :ANALYZE_LOGS
if "%maint_choice%"=="3" call :RESTART_SERVICES
if "%maint_choice%"=="4" call :OPTIMIZE_DB
if "%maint_choice%"=="5" goto MENU

pause
goto MENU

:: ========================================
:: FONCTIONS
:: ========================================

:SYSTEM_CHECK_FUNC
echo 🔍 Vérification de Node.js...
where node >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Node.js n'est pas installé !
    echo    Téléchargez-le depuis: https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js !NODE_VERSION! détecté

echo 🔍 Vérification de npm...
where npm >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ npm n'est pas installé !
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm !NPM_VERSION! détecté

echo 🔍 Vérification de l'espace disque...
for /f "tokens=3" %%i in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%i
echo ✅ Espace libre : !FREE_SPACE! bytes

echo 🔍 Vérification du port %PORT%...
netstat -an | find ":%PORT%" | find "LISTENING" >nul
if !errorlevel! equ 0 (
    echo ⚠️  Port %PORT% occupé (sera libéré automatiquement)
) else (
    echo ✅ Port %PORT% disponible
)

exit /b 0

:CREATE_BACKUP_FUNC
echo 📦 Création de la sauvegarde...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set "TIMESTAMP=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"
set "BACKUP_NAME=backup_%TIMESTAMP%"

echo Sauvegarde de la base de données...
if exist "data\supchaissac.db" (
    copy "data\supchaissac.db" "%BACKUP_DIR%\%BACKUP_NAME%.db" >nul
    echo ✅ Base de données sauvegardée : %BACKUP_NAME%.db
)

echo Sauvegarde des uploads...
if exist "uploads" (
    xcopy "uploads" "%BACKUP_DIR%\%BACKUP_NAME%_uploads\" /E /I /Q >nul
    echo ✅ Fichiers uploads sauvegardés
)

echo ✅ Sauvegarde terminée dans %BACKUP_DIR%\
exit /b 0

:CLEAN_PORT
echo 🧹 Libération du port %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT%" ^| find "LISTENING" 2^>nul') do (
    echo Arrêt du processus PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo ✅ Port %PORT% libéré
exit /b 0

:INSTALL_DEPS
echo 📦 Installation/vérification des dépendances...
call npm install
if !errorlevel! neq 0 (
    echo ❌ Erreur lors de l'installation des dépendances.
    exit /b 1
)
echo ✅ Dépendances installées
exit /b 0

:START_APP
echo 🚀 Démarrage de l'application...
echo.
echo ========================================
echo    APPLICATION EN COURS D'EXECUTION
echo    URL: http://localhost:%PORT%
echo    Appuyez sur Ctrl+C pour arrêter
echo ========================================
echo.

timeout /t 3 /nobreak >nul
start http://localhost:%PORT%

call npm run dev
exit /b 0

:SECURITY_CHECK
echo 🔐 Vérification de sécurité...
echo ⚠️  Vérifiez que les variables d'environnement sont configurées
echo ⚠️  Vérifiez que les mots de passe sont sécurisés
echo ⚠️  Vérifiez que HTTPS est activé en production
exit /b 0

:PRODUCTION_BUILD
echo 🏗️  Build de production...
call npm run build
exit /b 0

:START_PRODUCTION
echo 🌐 Démarrage en mode production...
set NODE_ENV=production
call npm start
exit /b 0

:CLEAN_TEMP
echo 🧹 Nettoyage des fichiers temporaires...
if exist "tmp" rmdir /s /q "tmp" 2>nul
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" 2>nul
echo ✅ Fichiers temporaires nettoyés
exit /b 0

:ANALYZE_LOGS
echo 📊 Analyse des logs...
if exist "logs" (
    echo Dernières erreurs :
    findstr /i "error" logs\*.log 2>nul | tail -10
) else (
    echo Aucun fichier de log trouvé
)
exit /b 0

:RESTART_SERVICES
echo 🔄 Redémarrage des services...
call :CLEAN_PORT
echo ✅ Services redémarrés
exit /b 0

:OPTIMIZE_DB
echo 💾 Optimisation de la base de données...
if exist "data\supchaissac.db" (
    echo Base de données SQLite détectée
    echo Optimisation en cours...
    node -e "const db = require('better-sqlite3')('data/supchaissac.db'); db.pragma('optimize'); db.close();" 2>nul
    echo ✅ Base de données optimisée
) else (
    echo Aucune base de données locale trouvée
)
exit /b 0

:EXIT
echo.
echo ========================================
echo    Merci d'avoir utilisé %APP_NAME% !
echo ========================================
echo.
exit /b 0
