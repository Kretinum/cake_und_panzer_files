@echo off
setlocal enabledelayedexpansion
REM Mods via packwiz (reliable). Client extras via ONE Release zip instead of ~60 jsDelivr files.
set "REPO=Kretinum/cake_und_panzer_files"
set "PACK=full"
set "OVR=CAKE-Full-overrides.zip"
if defined INST_JAVA (set "JAVA=%INST_JAVA%") else (set "JAVA=javaw")
for /f "delims=" %%i in ('powershell -NoProfile -Command "try{(Invoke-RestMethod https://api.github.com/repos/%REPO%/releases/latest).tag_name}catch{''}"') do set "TAG=%%i"
if "%TAG%"=="" set "TAG=v1.0.0"
echo [packwiz-sync] pack %TAG%

REM --- extras: one reliable download from the GitHub release (skipped if already current) ---
set "HAVE="
if exist .overrides-version set /p HAVE=<.overrides-version
if not "!HAVE!"=="%TAG%" (
  echo [packwiz-sync] fetching extras %TAG%...
  curl -fsSL -o overrides.zip "https://github.com/%REPO%/releases/download/%TAG%/%OVR%"
  if !errorlevel! equ 0 (
    tar -xf overrides.zip
    if !errorlevel! equ 0 (
      >.overrides-version echo %TAG%
      echo [packwiz-sync] extras updated
    )
    del overrides.zip
  ) else (
    echo [packwiz-sync] extras download skipped - packwiz will try instead
  )
)

echo [packwiz-sync] syncing mods
set /a n=0
:retry
"%JAVA%" -jar packwiz-installer-bootstrap.jar "https://cdn.jsdelivr.net/gh/%REPO%@%TAG%/%PACK%/pack.toml" && goto done
set /a n+=1
if !n! lss 6 (echo [packwiz-sync] attempt !n! incomplete, retrying... ^& goto retry)
echo [packwiz-sync] launching with current mods
:done
exit /b 0
