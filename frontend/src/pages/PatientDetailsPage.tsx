// src/pages/PatientDetailsPage.tsx
import React, { useEffect, useState, type JSX } from "react";
import { supabase } from "../services/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { useTitle } from "../hooks/useTitle";
import { Link } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDateBr } from "../hooks/useDateBr";

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
  const [isAddPlanoModalVisible, setIsAddPlanoModalVisible] = useState(false);
  const { formatDateBR } = useDateBr();

  const [editingPlano, setEditingPlano] = useState<PlanoAcompanhamento | null>(
    null
  );
  const [isEditPlanoModalVisible, setIsEditPlanoModalVisible] = useState(false);
  const [isEditPlanoSubmitting, setIsEditPlanoSubmitting] = useState(false);
  const [editPlanoError, setEditPlanoError] = useState("");

  const startEditingPlano = (plano: PlanoAcompanhamento) => {
    setEditingPlano(plano);
    setIsEditPlanoModalVisible(false);
    setTimeout(() => setIsEditPlanoModalVisible(true), 10);
  };

  const cancelEditingPlano = () => {
    setIsEditPlanoModalVisible(false);
    setTimeout(() => setEditingPlano(null), 300);
  };

  const handleUpdatePlano = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlano) return;
    setIsEditPlanoSubmitting(true);
    setEditPlanoError("");

    // Exemplo de update no Supabase
    const { error } = await supabase
      .from("historico_planos_paciente")
      .update({
        tipo_plano: editingPlano.tipo_plano,
        valor_cobrado: parseFloat(String(editingPlano.valor_cobrado)),
        data_inicio: editingPlano.data_inicio,
        observacoes: editingPlano.observacoes,
      })
      .eq("id", editingPlano.id);

    setIsEditPlanoSubmitting(false);

    if (error) {
      setEditPlanoError("Erro ao atualizar plano.");
    } else {
      // Atualize o estado local dos planos
      setPlanos((prev) =>
        prev.map((p) => (p.id === editingPlano.id ? editingPlano : p))
      );
      cancelEditingPlano();
    }
  };

  const calculateDatesForPlan = (
    startDate: string,
    planType: string
  ): { data_termino: string | null; data_proximo_pagamento: string | null } => {
    if (!startDate) return { data_termino: null, data_proximo_pagamento: null };

    const start = new Date(startDate + "T00:00:00"); // Garante que a data é tratada como início do dia para evitar problemas de fuso horário
    let endDate = new Date(start);
    let nextPaymentDate = null;

    switch (planType) {
      case "Mensal":
        endDate.setMonth(start.getMonth() + 1);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 1);
        break;
      case "Trimestral":
        endDate.setMonth(start.getMonth() + 3);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 3);
        break;
      case "Semestral":
        endDate.setMonth(start.getMonth() + 6);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setMonth(start.getMonth() + 6);
        break;
      case "Anual": // Adicionando caso para Anual, se for relevante
        endDate.setFullYear(start.getFullYear() + 1);
        nextPaymentDate = new Date(start);
        nextPaymentDate.setFullYear(start.getFullYear() + 1);
        break;
      case "Avulso": // Para planos sem recorrência ou término fixo
      default:
        // Para 'Avulso' ou tipos não definidos, não há data de término ou próximo pagamento automático
        endDate = start; // Ou null, dependendo de como você quer modelar
        nextPaymentDate = null;
        break;
    }

    // Ajusta para o dia anterior se o mês seguinte não tiver o mesmo dia (ex: 31 de janeiro + 1 mês = 28/29 de fevereiro)
    // Isso evita pular um mês se a data for 31 e o mês seguinte tiver menos dias
    if (planType !== "Avulso" && start.getDate() !== endDate.getDate()) {
      endDate.setDate(0); // Último dia do mês anterior
      if (nextPaymentDate) nextPaymentDate.setDate(0);
    }

    const formatToYYYYMMDD = (date: Date | null): string | null => {
      if (!date) return null;
      return date.toISOString().split("T")[0];
    };

    return {
      data_termino: formatToYYYYMMDD(endDate),
      data_proximo_pagamento: formatToYYYYMMDD(nextPaymentDate),
    };
  };

  const handleCloseAddPlanoModal = () => {
    setIsAddPlanoModalVisible(false);
    setTimeout(() => setIsAddingPlano(false), 300);
  };

  const handleDeletePlan = async (planId: string) => {
    // Passo de segurança: confirmação do usuário
    const confirmation = window.confirm(
      "Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita."
    );

    if (!confirmation) {
      return; // Se o usuário cancelar, a função para aqui
    }

    // Lógica para exclusão no Supabase
    const { error } = await supabase
      .from("historico_planos_paciente")
      .delete()
      .eq("id", planId); // <<-- IMPORTANTE: Filtra para deletar apenas o plano com este ID

    if (error) {
      console.error("Erro ao excluir plano:", error.message);
      //adicionar um estado para exibir um erro para o usuário
    } else {
      console.log("Plano excluído com sucesso!");

      // Atualiza o estado da lista para remover o plano excluído
      setPlanos((prevPlanos) =>
        prevPlanos.filter((p) => String(p.id) !== String(planId))
      );
    }
  };

  const handleAddPlano = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient || !planoDataInicio || !planoTipo || !planoValor) {
      setPlanoError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsPlanoSubmitting(true);
    setPlanoError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPlanoError("Você precisa estar logado para adicionar planos.");
      setIsPlanoSubmitting(false);
      return;
    }

    // Calcula as datas de término e próximo pagamento
    const { data_termino, data_proximo_pagamento } = calculateDatesForPlan(
      planoDataInicio,
      planoTipo
    );

    const { data, error } = await supabase
      .from("historico_planos_paciente") // <<-- MUDANÇA AQUI: nome da tabela
      .insert({
        paciente_id: patient.id,
        tipo_plano: planoTipo,
        valor_cobrado: parseFloat(planoValor), // Converte para número, já que no DB é DECIMAL
        data_inicio: planoDataInicio,
        data_termino: data_termino, // Usando a data calculada
        data_proximo_pagamento: data_proximo_pagamento, // Usando a data calculada
        status_plano: "ativo", // Define um status padrão para o novo plano
        observacoes: planoObservacoes,
      })
      .select();

    setIsPlanoSubmitting(false);

    if (error) {
      console.error("Erro ao adicionar plano:", error.message);
      setPlanoError(`Erro ao adicionar plano: ${error.message}.`); // Mensagem mais específica
    } else {
      console.log("Plano adicionado com sucesso:", data);
      if (data && data.length > 0) {
        setPlanos((prevPlanos) => [
          data[0] as PlanoAcompanhamento,
          ...prevPlanos,
        ]);
      }
      // Resetar o formulário
      setPlanoTipo("Mensal");
      setPlanoValor("");
      setPlanoDataInicio("");
      setPlanoObservacoes("");
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

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
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
        .from("historico_planos_paciente")
        .select("*")
        .eq("paciente_id", pacienteId)
        .order("data_registro", { ascending: false });

      if (error) {
        console.error(
          "Erro ao buscar planos de acompanhamento:",
          error.message
        );
      } else {
        setPlanos(data as PlanoAcompanhamento[]);
      }
    };

    fetchPatientDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-green-400">
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
      <div className="max-w-7xl mx-auto bg-[#222222] p-6 rounded-lg shadow-lg">
        <Link
          to="/patients"
          className="inline-flex items-center text-green-400 hover:text-green-500 mb-6"
        >
          <IoMdArrowRoundBack className="mr-2 " />
          Voltar para a lista
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">
          {patient.nome_completo}
        </h1>

        {/* Seção de Informações do Paciente */}
        <div className="bg-[#303030] p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">
            Informações do Paciente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-300">E-mail:</p>
              <p className="text-gray-200">{patient.email}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-300">Telefone:</p>
              <p className="text-gray-200">{patient.telefone}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-300">Data de Nascimento:</p>
              <p className="text-gray-200">
                {formatDateBR(patient.data_nascimento)}
              </p>
            </div>
          </div>
        </div>

        {/* Seção Plano atribuido */}
        <div className="bg-[#303030] p-6 rounded-lg shadow-md ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-green-400">
              Planos de Acompanhamento
            </h2>
            <button
              onClick={() => {
                setIsAddingPlano(true);
                setIsAddPlanoModalVisible(false);
                setTimeout(() => setIsAddPlanoModalVisible(true), 10);
              }}
              className="bg-green-400/80 hover:bg-green-500/80 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Adicionar Plano
            </button>
          </div>

          {/* Formulário de Adição de Plano */}
          {isAddingPlano && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-brightness-75 transition-all duration-300 ease-in-out ${
                isAddPlanoModalVisible
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div
                className={`bg-[#222222] p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${
                  isAddPlanoModalVisible
                    ? "scale-100 opacity-100"
                    : "scale-95 opacity-0"
                }`}
              >
                <h3 className="text-xl font-semibold text-green-400 mb-4">
                  Adicionar Novo Plano
                </h3>
                <form onSubmit={handleAddPlano} className="space-y-4">
                  <div>
                    <label
                      htmlFor="planoTipo"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Tipo de Plano
                    </label>
                    <select
                      id="planoTipo"
                      value={planoTipo}
                      onChange={(e) => setPlanoTipo(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                      required
                    >
                      <option value="Mensal">Mensal</option>
                      <option value="Trimestral">Trimestral</option>
                      <option value="Semestral">Semestral</option>
                      <option value="Anual">Anual</option>
                      <option value="Avulso">Avulso</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label
                      htmlFor="planoValor"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Valor Cobrado (R$)
                    </label>
                    <div className="flex items-center relative">
                      <span className="absolute left-3 top-6/11 transform -translate-y-1/2 text-gray-300">
                        R$
                      </span>
                      <input
                        type="number"
                        id="planoValor"
                        value={planoValor}
                        onChange={(e) => setPlanoValor(e.target.value)}
                        className="mt-1 block w-full pl-8 px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="planoDataInicio"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Data de Início
                    </label>
                    <input
                      type="date"
                      id="planoDataInicio"
                      value={planoDataInicio}
                      onChange={(e) => setPlanoDataInicio(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="planoObservacoes"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Observações (Opcional)
                    </label>
                    <textarea
                      id="planoObservacoes"
                      value={planoObservacoes}
                      onChange={(e) => setPlanoObservacoes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                    />
                  </div>
                  {planoError && (
                    <p className="text-red-500 text-sm">{planoError}</p>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCloseAddPlanoModal}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPlanoSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-400/80 rounded-md hover:bg-green-500/80 cursor-pointer transition"
                    >
                      {isPlanoSubmitting ? "Salvando..." : "Salvar Plano"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de Planos Existentes */}
          {planos.length > 0 ? (
            <div className="space-y-4 mt-6">
              {planos.map((plano) => (
                <div
                  key={plano.id}
                  className="p-4 border border-green-400/40 rounded-lg shadow-sm bg-[#222222]"
                >
                  <div className="flex justify-between">
                    <h4 className="text-lg font-semibold text-green-400">
                      {plano.tipo_plano} - R$ {plano.valor_cobrado.toFixed(2)}
                    </h4>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditingPlano(plano);
                        }}
                        className="cursor-pointer text-green-400 hover:text-green-500 font-medium mr-4"
                      >
                        Editar
                      </button>
                      {editingPlano && (
                        <div
                          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
                            isEditPlanoModalVisible
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }`}
                        >
                          <div
                            className={`bg-[#222222] p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${
                              isEditPlanoModalVisible
                                ? "scale-100 opacity-100"
                                : "scale-95 opacity-0"
                            }`}
                          >
                            <h3 className="text-xl font-semibold text-green-400 mb-4">
                              Editar Plano
                            </h3>
                            <form
                              onSubmit={handleUpdatePlano}
                              className="space-y-4"
                            >
                              <div>
                                <label
                                  htmlFor="editPlanoTipo"
                                  className="block text-sm font-medium text-gray-300"
                                >
                                  Tipo de Plano
                                </label>
                                <select
                                  id="editPlanoTipo"
                                  value={editingPlano.tipo_plano}
                                  onChange={(e) =>
                                    setEditingPlano({
                                      ...editingPlano,
                                      tipo_plano: e.target.value,
                                    })
                                  }
                                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                                  required
                                >
                                  <option value="Mensal">Mensal</option>
                                  <option value="Trimestral">Trimestral</option>
                                  <option value="Semestral">Semestral</option>
                                  <option value="Anual">Anual</option>
                                  <option value="Avulso">Avulso</option>
                                </select>
                              </div>
                              <div className="relative">
                                <label
                                  htmlFor="editPlanoValor"
                                  className="block text-sm font-medium text-gray-300"
                                >
                                  Valor Cobrado (R$)
                                </label>
                                <div className="flex items-center relative">
                                  <span className="absolute left-3 top-6/11 transform -translate-y-1/2 text-gray-300">
                                    R$
                                  </span>
                                  <input
                                    type="number"
                                    id="editPlanoValor"
                                    value={editingPlano.valor_cobrado}
                                    onChange={(e) =>
                                      setEditingPlano({
                                        ...editingPlano,
                                        valor_cobrado: Number(e.target.value),
                                      })
                                    }
                                    className="mt-1 block w-full pl-8 px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200 "
                                    step="0.01"
                                    required
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="editPlanoDataInicio"
                                  className="block text-sm font-medium text-gray-300"
                                >
                                  Data de Início
                                </label>
                                <input
                                  type="date"
                                  id="editPlanoDataInicio"
                                  value={editingPlano.data_inicio}
                                  onChange={(e) =>
                                    setEditingPlano({
                                      ...editingPlano,
                                      data_inicio: e.target.value,
                                    })
                                  }
                                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                                  required
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="editPlanoObservacoes"
                                  className="block text-sm font-medium text-gray-300"
                                >
                                  Observações (Opcional)
                                </label>
                                <textarea
                                  id="editPlanoObservacoes"
                                  value={editingPlano.observacoes ?? ""}
                                  onChange={(e) =>
                                    setEditingPlano({
                                      ...editingPlano,
                                      observacoes: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md bg-[#303030] text-gray-200"
                                />
                              </div>
                              {editPlanoError && (
                                <p className="text-red-500 text-sm">
                                  {editPlanoError}
                                </p>
                              )}
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={cancelEditingPlano}
                                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer transition"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="submit"
                                  disabled={isEditPlanoSubmitting}
                                  className="px-4 py-2 text-sm font-medium text-white bg-green-400/80 rounded-md hover:bg-green-500/80 cursor-pointer transition"
                                >
                                  {isEditPlanoSubmitting
                                    ? "Salvando..."
                                    : "Salvar Alterações"}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeletePlan(plano.id);
                        }}
                        className="cursor-pointer text-red-500 hover:text-red-700 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-200">
                    Início: {formatDateBR(plano.data_inicio)}
                  </p>
                  {plano.data_termino && (
                    <p className="text-gray-200">
                      Fim: {formatDateBR(plano.data_termino)}
                    </p>
                  )}
                  {plano.data_proximo_pagamento && (
                    <p className="text-gray-200">
                      Próximo Pagamento:{" "}
                      {formatDateBR(plano.data_proximo_pagamento)}
                    </p>
                  )}
                  <p className="text-gray-300">Status: {plano.status_plano}</p>
                  {plano.observacoes && (
                    <p className="text-gray-400 text-sm italic">
                      Obs: {plano.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 mt-6">Nenhum Plano atribuído.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsPage;
