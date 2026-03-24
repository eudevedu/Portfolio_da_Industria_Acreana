import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your-supabase-service-role-key') {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados corretamente no .env')
  console.log('Certifique-se de copiar a "service_role key" do painel do Supabase (Settings -> API).')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function makeAdmin(email: string, nome: string) {
  console.log(`\n🔍 Iniciando processo para tornar admin: ${email}...`)

  try {
    // 1. Buscar o usuário no Supabase Auth
    console.log('1. Buscando usuário no Supabase Auth...')
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      throw new Error(`Erro ao listar usuários: ${authError.message}`)
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.log(`\n❌ Usuário com email ${email} não encontrado no Supabase Auth.`)
      console.log('Primeiro, cadastre-se normalmente no site como uma empresa, depois execute este script novamente.')
      return
    }

    console.log(`✅ Usuário encontrado: ${user.id}`)

    // 2. Verificar se já existe na tabela admins
    console.log('2. Verificando tabela admins...')
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingAdmin) {
      console.log('ℹ️ Este usuário já está registrado como administrador.')
      
      // Garantir que está ativo
      const { error: updateError } = await supabaseAdmin
        .from('admins')
        .update({ ativo: true })
        .eq('id', user.id)
      
      if (updateError) console.error('Erro ao ativar admin:', updateError.message)
      else console.log('✅ Status de administrador verificado como ATIVO.')
      
      return
    }

    // 3. Inserir na tabela admins
    console.log('3. Inserindo na tabela admins...')
    const { error: insertError } = await supabaseAdmin
      .from('admins')
      .insert({
        id: user.id,
        nome: nome,
        email: email,
        ativo: true,
        cargo: 'Administrador Geral'
      })

    if (insertError) {
      if (insertError.message.includes('relation "public.admins" does not exist')) {
        console.error('\n❌ Erro: A tabela "admins" não existe no seu banco de dados.')
        console.log('Certifique-se de executar os scripts SQL (01-create-tables.sql e 03-create-auth-tables.sql) no SQL Editor do Supabase.')
      } else {
        throw new Error(`Erro ao inserir na tabela admins: ${insertError.message}`)
      }
      return
    }

    console.log(`\n✨ SUCESSO! ${nome} (${email}) agora é um administrador.`)
    console.log('Agora você pode fazer login em: /admin/login')

  } catch (error: any) {
    console.error('\n❌ Ocorreu um erro inesperado:')
    console.error(error.message)
  }
}

// Obter argumentos da linha de comando
const args = process.argv.slice(2)
const emailArg = args[0]
const nomeArg = args[1] || 'Administrador'

if (!emailArg) {
  console.log('\nUso: npx tsx scripts/make-admin.ts <email> "<nome>"')
  console.log('Exemplo: npx tsx scripts/make-admin.ts seu-email@exemplo.com "Seu Nome"\n')
} else {
  makeAdmin(emailArg, nomeArg)
}
