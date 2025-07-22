# 🚀 Checklist: Problemas Vercel vs Local

## ✅ Variáveis de Ambiente no Vercel

### 1. Verificar se as variáveis estão configuradas no Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Como configurar no Vercel:
1. Acesse seu projeto no dashboard do Vercel
2. Vá em Settings > Environment Variables
3. Adicione as variáveis:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://czyxfbqjonwmjqqkdesd.supabase.co`
   - Environment: Production, Preview, Development

   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXhmYnFqb253bWpxcWtkZXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA0ODgsImV4cCI6MjA2ODc3NjQ4OH0.9JiPDQM84mTD5vQRKnr5CVPTHF6gvz3Qd4qJzEaiglM`
   - Environment: Production, Preview, Development

### 3. Após adicionar, faça um novo deploy

## ✅ Configuração do Supabase

### 1. Verificar URLs permitidas no Supabase:
1. Acesse o painel do Supabase
2. Vá em Authentication > URL Configuration
3. Adicione sua URL do Vercel em:
   - Site URL: `https://seu-projeto.vercel.app`
   - Redirect URLs: `https://seu-projeto.vercel.app/**`

### 2. Verificar configurações de Auth:
- Authentication > Settings
- Enable email confirmations: pode estar causando problemas
- Email templates: verificar se estão configurados

## ✅ Problemas Comuns Vercel + Supabase

### 1. CORS (Cross-Origin Resource Sharing)
- Supabase pode estar bloqueando requests do domínio do Vercel

### 2. Edge Runtime vs Node.js Runtime
- Vercel usa Edge Runtime por padrão no Next.js 13+
- Algumas funções do Supabase podem não funcionar no Edge

### 3. Timeouts
- Funções no Vercel têm timeout menor que local

## 🔧 Soluções

### 1. Forçar Node.js Runtime (se necessário):
Adicionar no arquivo que está dando erro:
```typescript
export const runtime = 'nodejs'
```

### 2. Verificar logs do Vercel:
- Acessar Functions > View Function Logs no dashboard do Vercel
- Verificar erros específicos

### 3. Configuração de domínio:
- Certificar que o domínio do Vercel está autorizado no Supabase
