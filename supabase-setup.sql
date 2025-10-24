-- =====================================================
-- CONFIGURAÇÃO DO BANCO DE DADOS - CAIXA RADAR
-- =====================================================
-- Execute estes comandos no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New Query)
-- =====================================================

-- 1. Criar tabela de perfis (saldo atual dos usuários)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de transações (lançamentos financeiros)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_due_date ON transactions(due_date);
CREATE INDEX IF NOT EXISTS idx_transactions_is_paid ON transactions(is_paid);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança para PROFILES
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem inserir apenas seu próprio perfil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. Políticas de segurança para TRANSACTIONS
-- Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir apenas suas próprias transações
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias transações
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias transações
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. (OPCIONAL) Inserir perfil inicial automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, current_balance)
  VALUES (NEW.id, 0.00);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VERIFICAÇÃO (Execute para testar se tudo está OK)
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'transactions');

-- Verificar políticas de segurança
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- DADOS DE TESTE (OPCIONAL)
-- =====================================================
-- Descomente e execute se quiser inserir dados de exemplo
-- IMPORTANTE: Substitua 'YOUR_USER_ID' pelo ID real do seu usuário
-- (você pode encontrar no Supabase > Authentication > Users)

-- INSERT INTO profiles (id, current_balance) 
-- VALUES ('YOUR_USER_ID', 1000.00);

-- INSERT INTO transactions (user_id, description, amount, due_date, is_paid)
-- VALUES 
--   ('YOUR_USER_ID', 'Salário', 3000.00, '2025-10-05', true),
--   ('YOUR_USER_ID', 'Aluguel', -800.00, '2025-10-10', true),
--   ('YOUR_USER_ID', 'Conta de Luz', -150.00, '2025-10-15', false),
--   ('YOUR_USER_ID', 'Internet', -100.00, '2025-10-20', false),
--   ('YOUR_USER_ID', 'Freelance', 500.00, '2025-10-25', false);

-- =====================================================
-- COMANDOS ÚTEIS
-- =====================================================

-- Ver todos os perfis
-- SELECT * FROM profiles;

-- Ver todas as transações
-- SELECT * FROM transactions ORDER BY due_date;

-- Ver saldo atual de um usuário específico
-- SELECT current_balance FROM profiles WHERE id = 'YOUR_USER_ID';

-- Calcular soma de transações pagas
-- SELECT 
--   SUM(CASE WHEN is_paid THEN amount ELSE 0 END) as total_pago,
--   SUM(CASE WHEN NOT is_paid THEN amount ELSE 0 END) as total_pendente
-- FROM transactions 
-- WHERE user_id = 'YOUR_USER_ID';
