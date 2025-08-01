// src/services/supabase.js (ou supabase.ts)
import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente começam com VITE_ quando usadas com Vite no front-end
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚫 Erro: As variáveis de ambiente VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configuradas.');
}

// Crie e exporte a instância do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✨ Supabase Client Inicializado! Pronto para usar. ✨');