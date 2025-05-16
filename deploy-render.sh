#!/bin/bash

# Script para deploy no Render
echo "Iniciando processo de deploy para o Render..."

# Limpando diretório de build anterior
echo "Limpando builds anteriores..."
rm -rf dist

# Instalando dependências
echo "Instalando dependências..."
npm install

# Construindo a aplicação
echo "Construindo a aplicação..."
npm run build

echo "✅ Build concluído com sucesso!"
echo "Agora você pode fazer deploy no Render usando os arquivos em ./dist"