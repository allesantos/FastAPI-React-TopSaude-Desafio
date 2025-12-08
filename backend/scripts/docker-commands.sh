#!/bin/bash

# Script com comandos úteis do Docker

echo "TopSaude Hub - Comandos Docker"
echo "================================="
echo ""
echo "Escolha uma opção:"
echo "1) Subir aplicação"
echo "2) Parar aplicação"
echo "3) Rebuild aplicação"
echo "4) Ver logs do backend"
echo "5) Ver logs do banco"
echo "6) Executar bash no backend"
echo "7) Executar bash no banco"
echo "8) Limpar tudo (volumes inclusos)"
echo "9) Status dos containers"
echo "0) Sair"
echo ""

read -p "Opção: " option

case $option in
    1)
        docker compose up
        ;;
    2)
        docker compose down
        ;;
    3)
        docker compose down
        docker compose up --build
        ;;
    4)
        docker compose logs -f backend
        ;;
    5)
        docker compose logs -f db
        ;;
    6)
        docker compose exec backend bash
        ;;
    7)
        docker compose exec db bash
        ;;
    8)
        read -p "⚠️  Isso vai apagar TODOS os dados! Confirma? (s/n): " confirm
        if [ "$confirm" = "s" ]; then
            docker compose down -v
            echo "✅ Tudo limpo!"
        else
            echo "❌ Operação cancelada"
        fi
        ;;
    9)
        docker compose ps
        ;;
    0)
        echo "👋 Até logo!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        ;;
esac