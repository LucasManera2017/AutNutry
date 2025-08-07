// src/pages/PatientDetailsPage.tsx
import React, { useEffect, useState, type JSX } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";
import { Link } from "react-router-dom";

// Tipagem para um paciente
interface Patient {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  nutricionista_id: string;
}

// tipagem para o Plano de Acompanhamento
interface PlanoAcompanhamento {
  id: string; // O ID é UUID, então tipo string
  paciente_id: number; // Ou string/uuid se o ID do paciente for UUID
  tipo_plano: string; // Ex: 'Mensal', 'Trimestral', 'Semestral'
  valor_cobrado: number; // DECIMAL no DB, em JS será number
  data_inicio: string; // DATE no DB, em JS string no formato 'YYYY-MM-DD'
  data_termino: string | null; // Pode ser null
  data_proximo_pagamento: string | null; // Pode ser null
  status_plano: string; // Ex: 'ativo', 'concluido'
  observacoes: string | null;
  data_registro: string; // TIMESTAMPTZ no DB
  // Vamos adicionar nutricionista_id aqui para facilitar a lógica de inserção,
  // mesmo que a RLS puxe do paciente_id
  nutricionista_id: string;
}

function PatientDetailsPage(): JSX.Element {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Use 'useParams' para pegar o ID da URL

  const [isAddingPlano, setIsAddingPlano] = useState<boolean>(false);
  const [planoTipo, setPlanoTipo] = useState<string>("Mensal"); // Corresponde a 'tipo_plano'
  const [planoValor, setPlanoValor] = useState<string>(""); // Corresponde a 'valor_cobrado'
  const [planoDataInicio, setPlanoDataInicio] = useState<string>(""); // Corresponde a 'data_inicio'
  const [planoObservacoes, setPlanoObservacoes] = useState<string>(""); // Corresponde a 'observacoes'

  const [planos, setPlanos] = useState<PlanoAcompanhamento[]>([]); // Estado para armazenar os planos do paciente
  const [isPlanoSubmitting, setIsPlanoSubmitting] = useState<boolean>(false);
  const [planoError, setPlanoError] = useState<string>("");

  const calculateDatesForPlan = (startDate: string, planType: string): { data_termino: string | null, data_proximo_pagamento: string | null } => {
    if (!startDate) return { data_termino: null, data_proximo_pagamento: null };

    const start = new Date(startDate + 'T00:00:00'); // Garante que a data é tratada como início do dia para evitar problemas de fuso horário
    let endDate = new Date(start);
    let nextPaymentDate = null;

    switch (planType) {
      case 'Mensal':
        endDate.setMonth(start.getMonth() + 1);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 1);
        break;
      case 'Trimestral':
        endDate.setMonth(start.getMonth() + 3);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 3);
        break;
      case 'Semestral':
        endDate.setMonth(start.getMonth() + 6);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 6);
        break;
      case 'Anual': // Adicionando caso para Anual, se for relevante
        endDate.setFullYear(start.getFullYear() + 1);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setFullYear(start.getFullYear() + 1);
        break;
      case 'Avulso': // Para planos sem recorrência ou término fixo
      default:
        // Para 'Avulso' ou tipos não definidos, não há data de término ou próximo pagamento automático
        endDate = start; // Ou null, dependendo de como você quer modelar
        nextPaymentDate = null;
        break;
    }
    
    // Ajusta para o dia anterior se o mês seguinte não tiver o mesmo dia (ex: 31 de janeiro + 1 mês = 28/29 de fevereiro)
    // Isso evita pular um mês se a data for 31 e o mês seguinte tiver menos dias
    if (planType !== 'Avulso' && start.getDate() !== endDate.getDate()) {
        endDate.setDate(0); // Último dia do mês anterior
        if (nextPaymentDate) nextPaymentDate.setDate(0);
    }

    const formatToYYYYMMDD = (date: Date | null): string | null => {
      if (!date) return null;
      return date.toISOString().split('T')[0];
    };

    return {
      data_termino: formatToYYYYMMDD(endDate),
      data_proximo_pagamento: formatToYYYYMMDD(nextPaymentDate)
    };
  };

  const handleAddPlano = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient || !planoDataInicio || !planoTipo || !planoValor) {
      setPlanoError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsPlanoSubmitting(true);
    setPlanoError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlanoError('Você precisa estar logado para adicionar planos.');
      setIsPlanoSubmitting(false);
      return;
    }

    // Calcula as datas de término e próximo pagamento
    const { data_termino, data_proximo_pagamento } = calculateDatesForPlan(planoDataInicio, planoTipo);

    const { data, error } = await supabase
      .from('historico_planos_paciente') // <<-- MUDANÇA AQUI: nome da tabela
      .insert({
        paciente_id: patient.id,
        tipo_plano: planoTipo,
        valor_cobrado: parseFloat(planoValor), // Converte para número, já que no DB é DECIMAL
        data_inicio: planoDataInicio,
        data_termino: data_termino, // Usando a data calculada
        data_proximo_pagamento: data_proximo_pagamento, // Usando a data calculada
        status_plano: 'ativo', // Define um status padrão para o novo plano
        observacoes: planoObservacoes,
      })
      .select();

    setIsPlanoSubmitting(false);

    if (error) {
      console.error('Erro ao adicionar plano:', error.message);
      setPlanoError(`Erro ao adicionar plano: ${error.message}.`); // Mensagem mais específica
    } else {
      console.log('Plano adicionado com sucesso:', data);
      if (data && data.length > 0) {
        setPlanos(prevPlanos => [data[0] as PlanoAcompanhamento, ...prevPlanos]);
      }
      // Resetar o formulário
      setPlanoTipo('Mensal');
      setPlanoValor('');
      setPlanoDataInicio('');
      setPlanoObservacoes('');
      setIsAddingPlano(false);
    }
  };

  // Título dinâmico
  useTitle(
    patient
      ? `Detalhes de ${patient.nome_completo} | App Nutry`
      : "Detalhes do Paciente | App Nutry"
  );

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!id) {
        navigate("/patients"); // Redireciona se não houver ID na URL
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Erro ao buscar detalhes do paciente:", error.message);
        navigate("/patients"); // Redireciona se o paciente não for encontrado
      } else {
        setPatient(data as Patient);
        fetchPlanos(data.id); // Chama a função para buscar os planos
      }
      setLoading(false);
    };

    const fetchPlanos = async (pacienteId: number) => {
      const { data, error } = await supabase
        .from('historico_planos_paciente')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_registro', { ascending: false });

      if (error) {
        console.error('Erro ao buscar planos de acompanhamento:', error.message);
      } else {
        setPlanos(data as PlanoAcompanhamento[]);
      }
    };
    
    fetchPatientDetails();
  }, [id, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-blue-600">
          Carregando detalhes do paciente...
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-600">Paciente não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <Link
          to="/patients"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Voltar para a lista
        </Link>

        <h1 className="text-4xl font-bold text-blue-700 mb-8">
          {patient.nome_completo}
        </h1>

        {/* Seção de Informações do Paciente */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Informações do Paciente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-700">E-mail:</p>
              <p className="text-gray-600">{patient.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Telefone:</p>
              <p className="text-gray-600">{patient.telefone}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Data de Nascimento:</p>
              <p className="text-gray-600">{patient.data_nascimento}</p>
            </div>
          </div>
        </div>

        {/* Seção Plano atribuido (Próximo Passo) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Planos de Acompanhamento
            </h2>
            <button
              onClick={() => setIsAddingPlano(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              + Adicionar Plano
            </button>
          </div>
          
          {/* Formulário de Adição de Plano */}
          {isAddingPlano && (
            <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Adicionar Novo Plano</h3>
              <form onSubmit={handleAddPlano} className="space-y-4">
                <div>
                  <label htmlFor="planoTipo" className="block text-sm font-medium text-gray-700">Tipo de Plano</label>
                  <select
                    id="planoTipo"
                    value={planoTipo}
                    onChange={(e) => setPlanoTipo(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Avulso">Avulso</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="planoValor" className="block text-sm font-medium text-gray-700">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    id="planoValor"
                    value={planoValor}
                    onChange={(e) => setPlanoValor(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    step="0.01" // Permite valores decimais
                    required
                  />
                </div>
                <div>
                  <label htmlFor="planoDataInicio" className="block text-sm font-medium text-gray-700">Data de Início</label>
                  <input
                    type="date"
                    id="planoDataInicio"
                    value={planoDataInicio}
                    onChange={(e) => setPlanoDataInicio(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="planoObservacoes" className="block text-sm font-medium text-gray-700">Observações (Opcional)</label>
                  <textarea
                    id="planoObservacoes"
                    value={planoObservacoes}
                    onChange={(e) => setPlanoObservacoes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                  />
                </div>
                {planoError && <p className="text-red-500 text-sm">{planoError}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPlano(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPlanoSubmitting}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md"
                  >
                    {isPlanoSubmitting ? 'Salvando...' : 'Salvar Plano'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Planos Existentes */}
          {planos.length > 0 ? (
            <div className="space-y-4 mt-6">
              {planos.map((plano) => (
                <div key={plano.id} className="p-4 border rounded-lg shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900">{plano.tipo_plano} - R$ {plano.valor_cobrado.toFixed(2)}</h4>
                  <p className="text-gray-600">Início: {new Date(plano.data_inicio).toLocaleDateString()}</p>
                  {plano.data_termino && <p className="text-gray-600">Fim: {new Date(plano.data_termino).toLocaleDateString()}</p>}
                  {plano.data_proximo_pagamento && <p className="text-gray-600">Próximo Pagamento: {new Date(plano.data_proximo_pagamento).toLocaleDateString()}</p>}
                  <p className="text-gray-600">Status: {plano.status_plano}</p>
                  {plano.observacoes && <p className="text-gray-600 text-sm italic">Obs: {plano.observacoes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-6">Nenhum Plano atribuído.</p>
          )}

        </div>
      </div>
    </div>
  );
}

export default PatientDetailsPage;
