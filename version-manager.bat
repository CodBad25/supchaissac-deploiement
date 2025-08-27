@echo off
title SupChaissac - Gestionnaire de Versions
color 0D
setlocal enabledelayedexpansion

:: Configuration
set "APP_NAME=SupChaissac"
set "VERSIONS_DIR=versions"
set "CURRENT_VERSION_FILE=.current-version"

echo.
echo ========================================
echo    %APP_NAME% - GESTIONNAIRE DE VERSIONS
echo ========================================
echo.

:MENU
echo Choisissez une action :
echo.
echo [1] 📦 Créer une nouvelle version
echo [2] 📋 Lister les versions disponibles
echo [3] 🔄 Basculer vers une version
echo [4] 🗑️  Supprimer une version
echo [5] 📊 Comparer les versions
echo [6] 🏷️  Taguer la version actuelle
echo [7] 📤 Exporter une version
echo [8] 📥 Importer une version
echo [9] ❌ Quitter
echo.
set /p choice="Votre choix (1-9): "

if "%choice%"=="1" goto CREATE_VERSION
if "%choice%"=="2" goto LIST_VERSIONS
if "%choice%"=="3" goto SWITCH_VERSION
if "%choice%"=="4" goto DELETE_VERSION
if "%choice%"=="5" goto COMPARE_VERSIONS
if "%choice%"=="6" goto TAG_VERSION
if "%choice%"=="7" goto EXPORT_VERSION
if "%choice%"=="8" goto IMPORT_VERSION
if "%choice%"=="9" goto EXIT

echo Choix invalide. Veuillez réessayer.
goto MENU

:CREATE_VERSION
echo.
echo ========================================
echo    CREATION NOUVELLE VERSION
echo ========================================
echo.

:: Générer timestamp
set "TIMESTAMP=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"

set /p version_name="Nom de la version (défaut: v%TIMESTAMP%): "
if "%version_name%"=="" set "version_name=v%TIMESTAMP%"

set /p description="Description de la version: "
if "%description%"=="" set "description=Version créée le %date% à %time%"

echo.
echo Création de la version "%version_name%"...

:: Créer le dossier versions s'il n'existe pas
if not exist "%VERSIONS_DIR%" mkdir "%VERSIONS_DIR%"

:: Créer le dossier de la version
set "VERSION_PATH=%VERSIONS_DIR%\%version_name%"
if exist "%VERSION_PATH%" (
    echo ❌ La version "%version_name%" existe déjà !
    pause
    goto MENU
)

mkdir "%VERSION_PATH%"

:: Copier les fichiers importants (exclure node_modules, tmp, logs)
echo Copie des fichiers...
xcopy "client" "%VERSION_PATH%\client\" /E /I /Q /EXCLUDE:exclude-list.txt >nul 2>&1
xcopy "server" "%VERSION_PATH%\server\" /E /I /Q >nul 2>&1
xcopy "shared" "%VERSION_PATH%\shared\" /E /I /Q >nul 2>&1
xcopy "docs" "%VERSION_PATH%\docs\" /E /I /Q >nul 2>&1
xcopy "scripts" "%VERSION_PATH%\scripts\" /E /I /Q >nul 2>&1

:: Copier les fichiers de configuration
copy "package.json" "%VERSION_PATH%\" >nul 2>&1
copy "package-lock.json" "%VERSION_PATH%\" >nul 2>&1
copy "tsconfig.json" "%VERSION_PATH%\" >nul 2>&1
copy "vite.config.ts" "%VERSION_PATH%\" >nul 2>&1
copy "tailwind.config.ts" "%VERSION_PATH%\" >nul 2>&1
copy "drizzle.config.ts" "%VERSION_PATH%\" >nul 2>&1
copy ".env.example" "%VERSION_PATH%\" >nul 2>&1

:: Copier la base de données si elle existe
if exist "data\supchaissac.db" (
    if not exist "%VERSION_PATH%\data" mkdir "%VERSION_PATH%\data"
    copy "data\supchaissac.db" "%VERSION_PATH%\data\" >nul 2>&1
    echo ✅ Base de données incluse
)

:: Créer le fichier de métadonnées
(
echo {
echo   "name": "%version_name%",
echo   "description": "%description%",
echo   "created": "%date% %time%",
echo   "creator": "%USERNAME%",
echo   "machine": "%COMPUTERNAME%",
echo   "size": "calculating...",
echo   "files": "calculating..."
echo }
) > "%VERSION_PATH%\version-info.json"

:: Calculer la taille
for /f %%i in ('dir "%VERSION_PATH%" /s /-c ^| find "bytes"') do set "VERSION_SIZE=%%i"

echo ✅ Version "%version_name%" créée avec succès !
echo 📁 Emplacement : %VERSION_PATH%
echo 📊 Taille : %VERSION_SIZE%
echo 📝 Description : %description%
echo.

:: Mettre à jour la version actuelle
echo %version_name% > "%CURRENT_VERSION_FILE%"

pause
goto MENU

:LIST_VERSIONS
echo.
echo ========================================
echo    VERSIONS DISPONIBLES
echo ========================================
echo.

if not exist "%VERSIONS_DIR%" (
    echo ❌ Aucune version trouvée.
    echo    Créez votre première version avec l'option 1.
    pause
    goto MENU
)

:: Afficher la version actuelle
if exist "%CURRENT_VERSION_FILE%" (
    set /p current_version=<"%CURRENT_VERSION_FILE%"
    echo 🎯 Version actuelle : !current_version!
    echo.
)

echo 📦 Versions disponibles :
echo.

set "count=0"
for /d %%i in ("%VERSIONS_DIR%\*") do (
    set /a count+=1
    set "version_name=%%~ni"
    
    echo [!count!] !version_name!
    
    if exist "%%i\version-info.json" (
        for /f "tokens=2 delims=:" %%j in ('findstr "description" "%%i\version-info.json"') do (
            set "desc=%%j"
            set "desc=!desc:~2,-2!"
            echo     📝 !desc!
        )
        for /f "tokens=2 delims=:" %%j in ('findstr "created" "%%i\version-info.json"') do (
            set "created=%%j"
            set "created=!created:~2,-2!"
            echo     📅 !created!
        )
    )
    echo.
)

if %count%==0 (
    echo ❌ Aucune version trouvée.
)

pause
goto MENU

:SWITCH_VERSION
echo.
echo ========================================
echo    BASCULER VERS UNE VERSION
echo ========================================
echo.

call :LIST_VERSIONS_SIMPLE
echo.
set /p version_choice="Nom de la version à activer: "

if not exist "%VERSIONS_DIR%\%version_choice%" (
    echo ❌ Version "%version_choice%" introuvable !
    pause
    goto MENU
)

echo.
echo ⚠️  ATTENTION : Cette opération va :
echo 1. Sauvegarder la version actuelle
echo 2. Remplacer les fichiers par la version "%version_choice%"
echo 3. Redémarrer l'application
echo.
set /p confirm="Continuer ? (O/N): "
if /i not "%confirm%"=="O" goto MENU

:: Créer une sauvegarde de la version actuelle
echo 💾 Sauvegarde de la version actuelle...
call :CREATE_VERSION_SILENT "backup-before-switch"

:: Restaurer la version choisie
echo 🔄 Restauration de la version "%version_choice%"...
xcopy "%VERSIONS_DIR%\%version_choice%\*" "." /E /Y /Q >nul

:: Mettre à jour la version actuelle
echo %version_choice% > "%CURRENT_VERSION_FILE%"

echo ✅ Basculement vers "%version_choice%" terminé !
echo.
echo 🚀 Redémarrage recommandé de l'application.
pause
goto MENU

:DELETE_VERSION
echo.
echo ========================================
echo    SUPPRIMER UNE VERSION
echo ========================================
echo.

call :LIST_VERSIONS_SIMPLE
echo.
set /p version_to_delete="Nom de la version à supprimer: "

if not exist "%VERSIONS_DIR%\%version_to_delete%" (
    echo ❌ Version "%version_to_delete%" introuvable !
    pause
    goto MENU
)

:: Vérifier si c'est la version actuelle
if exist "%CURRENT_VERSION_FILE%" (
    set /p current_version=<"%CURRENT_VERSION_FILE%"
    if "!current_version!"=="%version_to_delete%" (
        echo ❌ Impossible de supprimer la version actuelle !
        echo    Basculez vers une autre version d'abord.
        pause
        goto MENU
    )
)

echo.
echo ⚠️  ATTENTION : Suppression définitive de "%version_to_delete%"
echo.
set /p confirm="Êtes-vous sûr ? (O/N): "
if /i not "%confirm%"=="O" goto MENU

rmdir /s /q "%VERSIONS_DIR%\%version_to_delete%"
echo ✅ Version "%version_to_delete%" supprimée.
pause
goto MENU

:TAG_VERSION
echo.
echo ========================================
echo    TAGUER LA VERSION ACTUELLE
echo ========================================
echo.

set /p tag_name="Nom du tag (ex: stable, release-1.0): "
set /p tag_description="Description du tag: "

if exist "%CURRENT_VERSION_FILE%" (
    set /p current_version=<"%CURRENT_VERSION_FILE%"
    echo 🏷️  Tag "%tag_name%" ajouté à la version !current_version!
    
    :: Créer un fichier de tag
    (
    echo Tag: %tag_name%
    echo Description: %tag_description%
    echo Date: %date% %time%
    echo Version: !current_version!
    ) > "%VERSIONS_DIR%\!current_version!\tag-%tag_name%.txt"
    
    echo ✅ Tag créé avec succès !
) else (
    echo ❌ Aucune version actuelle définie.
)

pause
goto MENU

:EXPORT_VERSION
echo.
echo ========================================
echo    EXPORTER UNE VERSION
echo ========================================
echo.

call :LIST_VERSIONS_SIMPLE
echo.
set /p version_to_export="Version à exporter: "

if not exist "%VERSIONS_DIR%\%version_to_export%" (
    echo ❌ Version introuvable !
    pause
    goto MENU
)

set "export_name=%version_to_export%_%date:~-4,4%-%date:~-10,2%-%date:~-7,2%.zip"
echo 📦 Création de l'archive %export_name%...

powershell -command "Compress-Archive -Path '%VERSIONS_DIR%\%version_to_export%\*' -DestinationPath '%export_name%'"

echo ✅ Version exportée : %export_name%
pause
goto MENU

:: ========================================
:: FONCTIONS UTILITAIRES
:: ========================================

:LIST_VERSIONS_SIMPLE
echo Versions disponibles :
for /d %%i in ("%VERSIONS_DIR%\*") do (
    echo - %%~ni
)
exit /b 0

:CREATE_VERSION_SILENT
set "silent_name=%~1"
if "%silent_name%"=="" set "silent_name=auto-backup"

if not exist "%VERSIONS_DIR%" mkdir "%VERSIONS_DIR%"
set "VERSION_PATH=%VERSIONS_DIR%\%silent_name%"
if exist "%VERSION_PATH%" rmdir /s /q "%VERSION_PATH%"
mkdir "%VERSION_PATH%"

xcopy "client" "%VERSION_PATH%\client\" /E /I /Q >nul 2>&1
xcopy "server" "%VERSION_PATH%\server\" /E /I /Q >nul 2>&1
xcopy "shared" "%VERSION_PATH%\shared\" /E /I /Q >nul 2>&1
copy "package.json" "%VERSION_PATH%\" >nul 2>&1
copy "*.ts" "%VERSION_PATH%\" >nul 2>&1

exit /b 0

:EXIT
echo.
echo ========================================
echo    Gestionnaire de versions fermé
echo ========================================
echo.
exit /b 0
