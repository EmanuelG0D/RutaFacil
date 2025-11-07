#!/bin/bash
# deploy.sh - Script de deployment automatizado para RutaFácil

echo "🚀 RutaFácil v2.0 - Deploy Script"
echo "=================================="
echo ""

# Verificar que estemos en la carpeta correcta
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json no encontrado"
    echo "Asegúrate de estar en la carpeta del proyecto"
    exit 1
fi

echo "✅ Verificando archivos necesarios..."
required_files=("index.html" "repartidor.html" "app.js" "config.js" "vercel.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Falta archivo: $file"
        exit 1
    fi
    echo "  ✓ $file"
done

echo ""
echo "📦 Preparando Git..."

# Agregar todos los archivos
git add .

# Mostrar cambios
echo ""
echo "Archivos modificados:"
git status --short

echo ""
read -p "¿Deseas continuar con el commit? (s/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
fi

# Solicitar mensaje de commit
echo ""
read -p "Mensaje de commit (Enter para usar default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Deploy RutaFacil v2.0"
fi

# Hacer commit
git commit -m "$commit_msg"

echo ""
echo "🔄 Pushing a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push exitoso!"
    echo ""
    echo "🌐 Vercel detectará los cambios automáticamente"
    echo "   Revisa tu dashboard: https://vercel.com/dashboard"
    echo ""
    echo "🎉 Deploy completado!"
else
    echo ""
    echo "❌ Error en push. Verifica tu conexión y credenciales de Git"
    exit 1
fi
