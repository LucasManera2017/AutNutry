import React, { useEffect, useState, type JSX } from "react";
import { supabase } from "../services/supabase";
import { useTitle } from "../hooks/useTitle";
import { Header } from "../components/header";

// Tipagem do pagamento no front
interface Pagamento {
  id: string;
  paciente_id: string;
  historico_plano_id: string | null;
  valor: number;
  nome_pagamento: string;
  forma_pagamento: string;
  observacoes: string | null;
  data_pagamento: string;
  data_registro: string;
  paciente: { nome_completo: string };
}

// Tipagem do retorno do Supabase (pagamento + paciente)
interface PagamentoSupabase {
  id: string;
  paciente_id: string;
  historico_plano_id: string | null;
  valor: number;
  nome_pagamento: string;
  forma_pagamento: string;
  observacoes: string | null;
  data_pagamento: string;
  data_registro: string;
  paciente?: { nome_completo: string } | null;
}

// Tipagem da despesa
interface Despesa {
  id: string;
  nome_despesa: string;
  valor: number;
  forma_pagamento: string;
  observacoes: string | null;
  data_despesa: string;
  nutricionista_id: string;
}

// Tipagem para pacientes
interface Patient {
  id: string;
  nome_completo: string;
}

function FinancialPage(): JSX.Element {
  useTitle("Financeiro | App Nutry");

  const [user, setUser] = useState<{ email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Formulário
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [nome, setNome] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [formaPagamento, setFormaPagamento] = useState<string>("Pix");
  const [observacoes, setObservacoes] = useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // Cards
  const [totalEntrada, setTotalEntrada] = useState<number>(0);
  const [totalSaida, setTotalSaida] = useState<number>(0);
  const [balanco, setBalanco] = useState<number>(0);

  const [patients, setPatients] = useState<Patient[]>([]);

  // Buscar pacientes
  useEffect(() => {
    supabase.from("pacientes").select("id, nome_completo").then(({ data }) => {
      if (data) setPatients(data as Patient[]);
    });
  }, []);

  // Buscar movimentações
  const fetchMovimentacoes = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return console.error("Usuário não autenticado.");

    const { data: pagamentosData, error: pagamentosError } = await supabase
      .from("pagamentos")
      .select(`
        *,
        paciente:paciente_id (
          nome_completo
        )
      `)
      .order("data_pagamento", { ascending: false });

    if (pagamentosError) {
      console.error("Erro ao buscar pagamentos:", pagamentosError.message);
    } else {
      const pagamentosMapped: Pagamento[] = (pagamentosData as PagamentoSupabase[]).map((p) => ({
        ...p,
        paciente: p.paciente ?? { nome_completo: "Paciente não definido" },
      }));
      setPagamentos(pagamentosMapped);
    }

    const { data: despesasData, error: despesasError } = await supabase
      .from("despesas")
      .select("*")
      .order("data_despesa", { ascending: false });

    if (despesasError) {
      console.error("Erro ao buscar despesas:", despesasError.message);
    } else {
      setDespesas(despesasData as Despesa[]);
    }

    setLoading(false);
  };

  // Totais
  useEffect(() => {
    const entradas = pagamentos.reduce((sum, p) => sum + p.valor, 0);
    const saidas = despesas.reduce((sum, d) => sum + d.valor, 0);
    setTotalEntrada(entradas);
    setTotalSaida(saidas);
    setBalanco(entradas - saidas);
  }, [pagamentos, despesas]);

  // Logout
  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Erro ao fazer logout:", error.message);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    fetchMovimentacoes();
  }, []);

  // Adicionar movimentação
  const handleAddMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    setFormError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setFormError("Você precisa estar logado para adicionar movimentações.");
      setIsFormSubmitting(false);
      return;
    }

    if (tipo === "saida") {
      const { data, error } = await supabase.from("despesas").insert({
        nome_despesa: nome,
        valor: parseFloat(valor),
        forma_pagamento: formaPagamento,
        observacoes: observacoes || null,
        data_despesa: new Date().toISOString(),
        nutricionista_id: user.id,
      }).select();
      if (error) setFormError(`Erro ao adicionar despesa: ${error.message}`);
      else if (data && data.length > 0) setDespesas((prev) => [data[0] as Despesa, ...prev]);
    } else {
      if (!selectedPatientId) {
        setFormError("Selecione um paciente para adicionar a entrada.");
        setIsFormSubmitting(false);
        return;
      }

      const { data: newPagamentoData, error: insertError } = await supabase
        .from("pagamentos")
        .insert({
          paciente_id: selectedPatientId,
          historico_plano_id: null,
          nome_pagamento: nome,
          valor: parseFloat(valor),
          data_pagamento: new Date().toISOString(),
          forma_pagamento: formaPagamento,
          observacoes: observacoes || null,
          data_registro: new Date().toISOString(),
        })
        .select(`
          *,
          paciente:paciente_id (
            nome_completo
          )
        `);

      if (insertError) setFormError(`Erro ao adicionar entrada: ${insertError.message}`);
      else if (newPagamentoData && newPagamentoData.length > 0) {
        const mapped: Pagamento[] = (newPagamentoData as PagamentoSupabase[]).map((p) => ({
          ...p,
          paciente: p.paciente ?? { nome_completo: "Paciente não definido" },
        }));
        setPagamentos((prev) => [mapped[0], ...prev]);
      }
    }

    setNome("");
    setValor("");
    setObservacoes("");
    setSelectedPatientId("");
    setIsFormSubmitting(false);
  };

  // Combina e ordena todas movimentações
  const allMovimentacoes = [
    ...pagamentos.map((p) => ({
      id: p.id,
      tipo: "entrada" as const,
      nome: p.nome_pagamento,
      paciente: p.paciente,
      valor: p.valor,
      data: p.data_pagamento,
      formaPagamento: p.forma_pagamento,
      observacoes: p.observacoes,
    })),
    ...despesas.map((d) => ({
      id: d.id,
      tipo: "saida" as const,
      nome: d.nome_despesa,
      valor: d.valor,
      data: d.data_despesa,
      formaPagamento: d.forma_pagamento,
      observacoes: d.observacoes,
    })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="min-h-screen bg-black/90">
      <Header user={user} handleLogout={handleLogout} loading={loading} />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="md:col-span-2 bg-[#222222] p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-green-400 mb-6">Financeiro</h1>
          {/* Formulário */}
          <div className="mb-8">
            <div className="flex border-b border-green-400/40 mb-4">
              <button onClick={() => setTipo("entrada")} className={`py-2 px-4 font-semibold text-lg ${tipo === "entrada" ? "text-green-400 border-b-2 border-green-400" : "text-gray-400"}`}>Nova Entrada</button>
              <button onClick={() => setTipo("saida")} className={`py-2 px-4 font-semibold text-lg ${tipo === "saida" ? "text-red-400 border-b-2 border-red-400" : "text-gray-400"}`}>Nova Saída</button>
            </div>
            <form onSubmit={handleAddMovimentacao} className="space-y-4">
              {tipo === "entrada" && (
                <div>
                  <label htmlFor="paciente" className="block text-sm font-medium text-gray-300">Paciente</label>
                  <select id="paciente" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required className="mt-1 block w-full pl-2 bg-[#303030] text-gray-200 border border-green-400/40 rounded-md shadow-sm">
                    <option value="">Selecione um paciente</option>
                    {patients.map((p) => (<option key={p.id} value={p.id}>{p.nome_completo}</option>))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-300">{tipo === "entrada" ? "Nome da Entrada" : "Nome da Saída"}</label>
                <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full pl-2 bg-[#303030] text-gray-200 border border-green-400/40 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-300">Valor</label>
                <input type="number" id="valor" value={valor} onChange={(e) => setValor(e.target.value)} step="0.01" required className="mt-1 block w-full pl-2 bg-[#303030] text-gray-200 border border-green-400/40 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-300">Forma de Pagamento</label>
                <select id="formaPagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} required className="mt-1 block w-full pl-2 bg-[#303030] text-gray-200 border border-green-400/40 rounded-md shadow-sm">
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Transferência">Transferência</option>
                </select>
              </div>
              <div>
                <label htmlFor="observacoes" className="block text-sm font-medium text-gray-300">Observação (Opcional)</label>
                <textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="mt-1 block w-full pl-2 bg-[#303030] text-gray-200 border border-green-400/40 rounded-md shadow-sm"></textarea>
              </div>
              {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
              <button type="submit" disabled={isFormSubmitting} className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition ${tipo === "entrada" ? "bg-green-400 hover:bg-green-500" : "bg-red-400 hover:bg-red-500"}`}>
                {isFormSubmitting ? "Salvando..." : tipo === "entrada" ? "Adicionar Entrada" : "Adicionar Saída"}
              </button>
            </form>
          </div>

          <hr className="my-8 border-green-400/40" />

          {/* Lista */}
          <h2 className="text-2xl font-bold text-green-400 mb-4">Histórico de Movimentações</h2>
          {loading ? <p className="text-gray-400 text-center">Carregando movimentações...</p> :
            allMovimentacoes.length > 0 ? (
              <div className="space-y-4">
                {allMovimentacoes.map((mov) => (
                  <div key={mov.id} className={`p-4 rounded-lg shadow-sm ${mov.tipo === "entrada" ? "bg-[#303030]" : "bg-[#222222]"} border-l-4 ${mov.tipo === "entrada" ? "border-green-400" : "border-red-400"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-lg text-gray-200">{mov.nome}</h3>
                      <p className={`font-bold ${mov.tipo === "entrada" ? "text-green-400" : "text-red-400"}`}>{mov.tipo === "entrada" ? "+" : "-"} R$ {mov.valor.toFixed(2)}</p>
                    </div>
                    {mov.tipo === "entrada" && <p className="text-sm text-gray-400">Paciente: {mov.paciente?.nome_completo}</p>}
                    <p className="text-sm text-gray-400">Forma de Pagamento: {mov.formaPagamento}</p>
                    <p className="text-xs text-gray-500 mt-1">Data: {new Date(mov.data).toLocaleString()}</p>
                    {mov.observacoes && <p className="text-sm italic mt-2 text-gray-400">Obs: {mov.observacoes}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-center">Nenhuma movimentação registrada.</p>}
        </div>

        {/* Cards */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#303030] p-6 rounded-lg shadow-lg border-l-4 border-green-400">
            <p className="text-lg text-gray-400">Total de Entradas</p>
            <p className="text-4xl font-bold text-green-400">R$ {totalEntrada.toFixed(2)}</p>
          </div>
          <div className="bg-[#303030] p-6 rounded-lg shadow-lg border-l-4 border-red-400">
            <p className="text-lg text-gray-400">Total de Saídas</p>
            <p className="text-4xl font-bold text-red-400">R$ {totalSaida.toFixed(2)}</p>
          </div>
          <div className="bg-[#303030] p-6 rounded-lg shadow-lg border-l-4 border-blue-400">
            <p className="text-lg text-gray-400">Balanço do Período</p>
            <p className={`text-4xl font-bold ${balanco >= 0 ? "text-green-400" : "text-red-400"}`}>R$ {balanco.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinancialPage;
