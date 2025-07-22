// Script de teste para verificar configuração do Supabase
import { supabase } from './supabase'

export async function testSupabaseAuth() {
  console.log('=== Teste de Configuração do Supabase Auth ===')
  
  if (!supabase) {
    console.error('❌ Cliente Supabase não configurado')
    return false
  }
  
  // Teste 1: Verificar se o cliente Supabase está funcionando
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('✅ Cliente Supabase Auth funcionando:', { hasSession: !!data.session })
  } catch (error) {
    console.error('❌ Erro no cliente Supabase Auth:', error)
    return false
  }
  
  // Teste 2: Verificar se as tabelas necessárias existem
  try {
    const { data, error } = await supabase.from('perfis_empresas').select('id').limit(1)
    if (error && error.message.includes('does not exist')) {
      console.error('❌ Tabela perfis_empresas não existe')
      return false
    }
    console.log('✅ Tabela perfis_empresas acessível')
  } catch (error) {
    console.error('❌ Erro ao acessar tabela perfis_empresas:', error)
  }
  
  // Teste 3: Verificar políticas RLS
  try {
    const { data, error } = await supabase.from('empresas').select('id').limit(1)
    console.log('✅ Tabela empresas acessível')
  } catch (error) {
    console.error('❌ Erro ao acessar tabela empresas:', error)
  }
  
  return true
}

// Função para testar um cadastro simples
export async function testUserRegistration(testEmail: string = 'test@example.com', testPassword: string = 'test123456') {
  console.log('=== Teste de Registro de Usuário ===')
  
  if (!supabase) {
    console.error('❌ Cliente Supabase não configurado')
    return { success: false, error: 'Cliente Supabase não configurado' }
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.error('❌ Erro no registro de teste:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Registro de teste bem-sucedido:', data.user?.id)
    
    // Limpar o usuário de teste
    if (data.user) {
      try {
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('✅ Usuário de teste removido')
      } catch (deleteError) {
        console.log('⚠️ Não foi possível remover usuário de teste:', deleteError)
      }
    }
    
    return { success: true, userId: data.user?.id }
  } catch (error) {
    console.error('❌ Erro inesperado no teste:', error)
    return { success: false, error: (error as Error).message || 'Erro desconhecido' }
  }
}
