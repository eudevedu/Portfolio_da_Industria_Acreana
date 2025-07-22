# 🚨 SOLUÇÃO RÁPIDA - Vercel não funciona

## 📋 Checklist Imediato

### 1. ✅ Configurar Variáveis no Vercel

1. Acesse [vercel.com](https://vercel.com) e entre no seu projeto
2. Clique em **Settings** → **Environment Variables**
3. Adicione EXATAMENTE estas variáveis:

**Primeira variável:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://czyxfbqjonwmjqqkdesd.supabase.co`
- Environments: ✅ Production ✅ Preview ✅ Development

**Segunda variável:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXhmYnFqb253bWpxcWtkZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA0ODgsImV4cCI6MjA2ODc3NjQ4OH0.9JiPDQM84mTD5vQRKnr5CVPTHF6gvz3Qd4qJzEaiglM`
- Environments: ✅ Production ✅ Preview ✅ Development

### 2. 🔄 Redeploy Obrigatório

Após adicionar as variáveis:
1. Vá na aba **Deployments**
2. Clique nos "..." do último deploy
3. Clique em **Redeploy**
4. ✅ Marque "Use existing Build Cache" como **FALSE**

### 3. 🧪 Testar a API de Diagnóstico

Acesse: `https://seu-projeto.vercel.app/api/diagnostico`

**Resultado esperado:**
```json
{
  "success": true,
  "diagnostics": {
    "supabase": {
      "url": "CONFIGURADO",
      "anonKey": "CONFIGURADO"
    },
    "supabaseConnection": "CONECTADO"
  }
}
```

### 4. 🔍 Se ainda não funcionar

Acesse: `https://seu-projeto.vercel.app/api/teste-empresas`

Isso vai mostrar exatamente qual é o erro.

### 5. 📱 Verificar na HomePage

Se as APIs funcionarem, a homepage deve carregar as empresas.

## 🚨 Problemas Comuns

### ❌ "Supabase não configurado"
- Verifique se as variáveis foram salvas corretamente
- Faça um redeploy completo

### ❌ "CORS Error" ou "Network Error"
- No Supabase → Settings → API → URL Configuration
- Adicione: `https://seu-projeto.vercel.app`

### ❌ "Function timeout"
- Normal no primeiro deploy
- Aguarde alguns minutos e teste novamente

## 📞 Se Nada Funcionar

1. Acesse Vercel → Functions → View Function Logs
2. Procure por erros em tempo real
3. Compartilhe os logs de erro específicos

---

**✅ Dica:** As variáveis de ambiente são a causa #1 de problemas no Vercel!
