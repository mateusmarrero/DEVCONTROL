@echo off
title DEVCONTROL 1.0 - Startup Manager
echo ========================================================
echo        DEVCONTROL 1.0 - Inicializando Servicos
echo ========================================================
echo [1/3] Iniciando MariaDB 10.11 Server...
start "MariaDB 10.11" /min cmd /c "database\mariadb-10.11\bin\mysqld.exe --defaults-file=database\my.ini --console"

timeout /t 2 /nobreak > nul

echo [2/3] Iniciando Backend Fastify API (Porta 4000)...
start "DEVCONTROL Backend" cmd /c "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [3/3] Iniciando Frontend React + Vite (Porta 5173)...
start "DEVCONTROL Frontend" cmd /c "cd frontend && npm run dev"

timeout /t 2 /nobreak > nul
echo.
echo ========================================================
echo DEVCONTROL operacional! Acesse: http://localhost:5173/
echo ========================================================
pause
