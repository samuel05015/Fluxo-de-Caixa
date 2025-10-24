// src/components/Dashboard.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
// Gráfico (recharts)
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Profile {
  current_balance: number;
}

interface Transaction {
  id?: string;
  description: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
}

interface ProjectionDataPoint {
  dia: string;
  saldo: string;
}

interface DashboardProps {
  session: Session;
}

export default function Dashboard({ session }: DashboardProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projectionData, setProjectionData] = useState<ProjectionDataPoint[]>([]);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'upcoming'>('all');

  // Estados do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [isExpense, setIsExpense] = useState(true); // Se é despesa (negativo)

  useEffect(() => {
    fetchProfileAndTransactions();
  }, [session]);

  // Efeito que recalcula a projeção quando os dados mudam
  useEffect(() => {
    if (profile && transactions.length >= 0) {
      // Usa o saldo atual do perfil (já inclui transações pagas)
      const data = calculateProjection(profile.current_balance, transactions);
      setProjectionData(data);
    }
  }, [profile, transactions]);

  // Busca perfil (saldo) e transações
  const fetchProfileAndTransactions = async () => {
    try {
      setLoading(true);
      const { user } = session;

      // Busca Perfil (Saldo Inicial) - cria se não existir
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('current_balance')
        .eq('id', user.id)
        .single();
      
      // Se perfil não existe, cria um com saldo inicial 0
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ id: user.id, current_balance: 0 })
          .select()
          .single();
        
        if (createError) throw createError;
        profileData = newProfile;
      } else if (profileError) {
        throw profileError;
      }
      
      setProfile(profileData);

      // Busca Lançamentos
      let { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
    .select('id, description, amount, due_date, is_paid')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (transactionsError) throw transactionsError;
  setTransactions((transactionsData as Transaction[]) || []);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Salva um novo lançamento
  const handleSubmitTransaction = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { user } = session;
    
    // Converte para negativo se for despesa
    const finalAmount = isExpense ? Math.abs(amount) * -1 : Math.abs(amount);

    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        description,
        amount: finalAmount,
        due_date: dueDate,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
    } else {
      // Atualiza a lista local (mantém ordenação por data)
      const added = newTransaction as Transaction;
      setTransactions(prev => {
        const next = [...prev, added];
        return next.sort((a, b) => a.due_date.localeCompare(b.due_date));
      });
      
      // Se a transação for marcada como paga, atualiza o saldo do perfil
      if (added.is_paid) {
        const newBalance = (profile?.current_balance || 0) + finalAmount;
        await supabase
          .from('profiles')
          .update({ current_balance: newBalance })
          .eq('id', user.id);
        
        setProfile(prev => prev ? { ...prev, current_balance: newBalance } : null);
      }
      
      // Limpa formulário
      setDescription('');
      setAmount(0);
      setDueDate('');
    }
  };

  // Marca/Desmarca como pago
  const togglePaid = async (id: string, currentlyPaid: boolean, transactionAmount: number) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ is_paid: !currentlyPaid })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    // Atualiza o saldo do perfil
    const { user } = session;
    const currentBalance = profile?.current_balance || 0;
    const newBalance = !currentlyPaid 
      ? currentBalance + transactionAmount  // Marcando como pago: adiciona ao saldo
      : currentBalance - transactionAmount; // Desmarcando: remove do saldo
    
    await supabase
      .from('profiles')
      .update({ current_balance: newBalance })
      .eq('id', user.id);
    
    setProfile(prev => prev ? { ...prev, current_balance: newBalance } : null);
    setTransactions(prev => prev.map(t => (t.id === id ? (data as Transaction) : t)));
  };

  // Exporta CSV simples das transações
  const exportCSV = () => {
    const rows = [
      ['id', 'description', 'amount', 'due_date', 'is_paid'],
      ...transactions.map(t => [t.id || '', t.description, String(t.amount), t.due_date, String(t.is_paid)]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Carregando dados...</p>
      </div>
    );
  }

  // Aplica filtro à lista exibida
  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'paid') return t.is_paid === true;
    if (filter === 'unpaid') return t.is_paid === false;
    if (filter === 'upcoming') {
      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(t.due_date + 'T00:00:00');
      return due >= today && !t.is_paid;
    }
    return true;
  });

  // Calcula estatísticas
  const totalPaid = transactions
    .filter(t => t.is_paid)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalPending = transactions
    .filter(t => !t.is_paid)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header com Saldo */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem' }}>💰 Caixa Radar</h1>
        <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Saldo Atual</div>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', margin: '10px 0' }}>
          R$ {profile?.current_balance?.toFixed(2) || '0.00'}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
          Total Realizado: R$ {totalPaid?.toFixed(2) || '0.00'} | 
          Total Pendente: R$ {totalPending?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Card Adicionar Lançamento */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>➕ Adicionar Lançamento</h2>
          <form onSubmit={handleSubmitTransaction}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Descrição</label>
            <input
              type="text"
              placeholder="Descrição (ex: Aluguel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />

            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Valor</label>
            <input
              type="number"
              placeholder="Valor"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />

            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Data</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 12 }}
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input
                type="checkbox"
                checked={isExpense}
                onChange={(e) => setIsExpense(e.target.checked)}
              />
              É uma despesa?
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Adicionar Lançamento
              </button>

              <button type="button" onClick={exportCSV} style={{ padding: '10px 12px' }}>Exportar CSV</button>
            </div>
          </form>
        </div>

        {/* Card Projeção */}
        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>📈 Projeção (30 dias)</h2>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="saldo" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 12 }}>
            {projectionData.length > 0 ? (
              <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={{ textAlign: 'left', padding: 8 }}>Data</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionData.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
                        <td style={{ padding: 8 }}>{p.dia}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{p.saldo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#999' }}>Nenhuma projeção disponível.</p>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ marginTop: 0 }}>📋 Lançamentos</h2>
          <div>
            <label style={{ marginRight: 8 }}>Filtrar:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">Todas</option>
              <option value="upcoming">Próximas (não pagas)</option>
              <option value="paid">Pagas</option>
              <option value="unpaid">Não pagas</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0', background: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Data</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((transaction, index) => {
                  const isExpenseItem = transaction.amount < 0;
                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{transaction.description}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {new Date(transaction.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: isExpenseItem ? '#e74c3c' : '#27ae60'
                      }}>
                        {isExpenseItem ? '-' : '+'} R$ {Math.abs(transaction.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          background: transaction.is_paid ? '#d4edda' : '#fff3cd',
                          color: transaction.is_paid ? '#155724' : '#856404'
                        }}>
                          {transaction.is_paid ? '✓ Pago' : '⏳ Pendente'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => togglePaid(transaction.id as any, transaction.is_paid, transaction.amount)}>
                          {transaction.is_paid ? 'Desmarcar' : 'Marcar como pago'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            Nenhum lançamento cadastrado ainda. Comece adicionando seu primeiro lançamento!
          </p>
        )}
      </div>
    </div>
  );
}

// =========================================================
// A LÓGICA PRINCIPAL (PURO JAVASCRIPT)
// =========================================================
function calculateProjection(currentBalance: number, transactions: Transaction[], days: number = 30): ProjectionDataPoint[] {
  let projection: ProjectionDataPoint[] = [];
  let runningBalance = Number(currentBalance);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zera a hora para comparar só a data

  // 1. Filtra transações relevantes (apenas futuras e não pagas)
  const futureTransactions = transactions.filter((t: Transaction) => {
    const dueDate = new Date(t.due_date + 'T00:00:00'); // Corrige fuso
    return !t.is_paid && dueDate >= today;
  });

  // 2. Cria o array de projeção dia a dia
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const currentDateStr = currentDate.toISOString().split('T')[0];
    
    let dailyNetChange = 0;

    // 3. Soma todos os lançamentos que vencem nesse dia
    futureTransactions.forEach((t: Transaction) => {
      if (t.due_date === currentDateStr) {
        dailyNetChange += Number(t.amount);
      }
    });

    // 4. Atualiza o saldo projetado
    runningBalance += dailyNetChange;

    projection.push({
      dia: currentDateStr.substring(5), // Formato MM-DD
      saldo: runningBalance.toFixed(2),
    });
  }

  return projection;
}
