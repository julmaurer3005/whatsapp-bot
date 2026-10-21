@echo off
title Disparador de Mensagens WhatsApp
chcp 65001 > nul
cls

echo ========================================================
echo    INICIANDO DISPARADOR DE MENSAGENS WHATSAPP
echo ========================================================
echo.
echo Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado neste computador!
    echo Instale o Node.js em: https://nodejs.org/
    pause
    exit /b
)

echo [OK] Iniciando o robo...
echo Uma janela do WhatsApp Web abrira a seguir.
echo Se for a primeira vez, escaneie o QR Code com seu celular!
echo.
node disparador.js

echo.
echo ========================================================
echo    DISPAROS FINALIZADOS OU ENCERRADOS
echo ========================================================
pause
