@echo off
REM deploy.bat - Script de deployment para Windows

echo ========================================
echo   RutaFacil v2.0 - Deploy Script
echo ========================================
echo.

REM Verificar que estemos en la carpeta correcta
if not exist "vercel.json" (
    echo ERROR: vercel.json no encontrado
    echo Asegurate de estar en la carpeta del proyecto
    pause
    exit /b 1
)

echo Verificando archivos necesarios...
if not exist "index.html" goto missing_file
if not exist "repartidor.html" goto missing_file
if not exist "app.js" goto missing_file
if not exist "config.js" goto missing_file
echo   Todos los archivos OK
echo.

echo Preparando Git...
echo.

REM Agregar archivos
git add .

REM Mostrar estado
git status --short

echo.
set /p confirm="Deseas continuar con el commit? (s/n): "
if /i not "%confirm%"=="s" (
    echo Deploy cancelado
    pause
    exit /b 0
)

REM Solicitar mensaje de commit
echo.
set /p commit_msg="Mensaje de commit (Enter para usar default): "
if "%commit_msg%"=="" set commit_msg=Deploy RutaFacil v2.0

REM Hacer commit
git commit -m "%commit_msg%"

echo.
echo Pushing a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Push exitoso!
    echo ========================================
    echo.
    echo Vercel detectara los cambios automaticamente
    echo Revisa tu dashboard: https://vercel.com/dashboard
    echo.
    echo Deploy completado!
    echo.
) else (
    echo.
    echo ERROR en push. Verifica tu conexion y credenciales
    pause
    exit /b 1
)

pause
exit /b 0

:missing_file
echo ERROR: Faltan archivos necesarios
pause
exit /b 1
