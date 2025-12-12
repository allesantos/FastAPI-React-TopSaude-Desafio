@echo off
echo.
echo ================================================
echo    🔥 TopSaude Hub - Modo Desenvolvimento
echo ================================================
echo.

echo 🛑 Parando containers anteriores...
docker compose down

echo.
echo 🚀 Iniciando modo desenvolvimento...
echo.

docker compose --profile dev up

echo.
echo ================================================
echo    ✅ Ambiente Finalizado!
echo ================================================
pause