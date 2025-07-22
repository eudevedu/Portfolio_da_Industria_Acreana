#!/bin/bash

# Script para verificar configurações no Vercel
echo "🔍 Verificando configurações do Vercel..."

# Verificar se as variáveis de ambiente estão definidas
echo "📋 Variáveis de ambiente:"
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:-'❌ NÃO DEFINIDA'}"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+✅ DEFINIDA}${NEXT_PUBLIC_SUPABASE_ANON_KEY:-❌ NÃO DEFINIDA}"

# Verificar NODE_ENV
echo "NODE_ENV: ${NODE_ENV:-'❌ NÃO DEFINIDA'}"

# Verificar variáveis específicas do Vercel
echo "VERCEL: ${VERCEL:-'❌ NÃO ESTÁ NO VERCEL'}"
echo "VERCEL_URL: ${VERCEL_URL:-'❌ NÃO DEFINIDA'}"

echo "✅ Verificação concluída!"
