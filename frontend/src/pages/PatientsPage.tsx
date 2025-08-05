// src/pages/PatientsPage.tsx
import React, { useEffect, useState, type JSX } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../hooks/useTitle"; // Importe o hook de título

// Tipagem para um paciente, baseada na sua tabela 'pacientes'
interface Patient {
  id: number;
  nome_completo: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  nutricionista_id: string; // O ID do nutricionista a quem o paciente pertence
}

function PatientsPage(): JSX.Element {
  useTitle("Meus Pacientes | App Nutry");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // NOVOS ESTADOS PARA O FORMULÁRIO DE CADASTRO DE PACIENTE
  const [isAddingPatient, setIsAddingPatient] = useState<boolean>(false); // Controla a visibilidade do formulário
  const [newPatientName, setNewPatientName] = useState<string>("");
  const [newPatientEmail, setNewPatientEmail] = useState<string>("");
  const [newPatientPhone, setNewPatientPhone] = useState<string>("");
  const [newPatientDob, setNewPatientDob] = useState<string>(""); // Data de nascimento (dob = date of birth)
  const [isFormSubmitting, setIsFormSubmitting] = useState<boolean>(false); // Para desativar o botão durante o envio
  const [formError, setFormError] = useState<string>("");

  // ESTADOS PARA O FORMULÁRIO DE EDIÇÃO
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null); // Armazena o paciente que está sendo editado

  // FUNÇÃO QUE ABRE O FORMULÁRIO DE EDIÇÃO
  const startEditing = (patient: Patient) => {
    setEditingPatient(patient);
    setIsAddingPatient(false); // Garante que o formulário de adição está fechado
  };

  // FUNÇÃO QUE FECHA O FORMULÁRIO DE EDIÇÃO
  const cancelEditing = () => {
    setEditingPatient(null);
  };

  useEffect(() => {
    // Função para buscar os pacientes do nutricionista logado
    const fetchPatients = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Se não houver usuário logado, redireciona para o login
        navigate("/login");
        return;
      }

      // Busca os pacientes onde o 'nutricionista_id' é o mesmo que o ID do usuário logado
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("nutricionista_id", user.id);

      if (error) {
        console.error("Erro ao buscar pacientes:", error.message);
      } else {
        setPatients(data as Patient[]);
      }
      setLoading(false);
    };

    fetchPatients();
  }, [navigate]);

  // FUNÇÃO PARA CADASTRAR UM PACIENTE
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento da página

    setIsFormSubmitting(true);
    setFormError("");

    // Obter o ID do usuário logado (nutricionista_id)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setFormError("Você precisa estar logado para adicionar pacientes.");
      setIsFormSubmitting(false);
      return;
    }

    // Lógica para inserção no Supabase
    const { data, error } = await supabase
      .from("pacientes")
      .insert({
        nome_completo: newPatientName,
        email: newPatientEmail,
        telefone: newPatientPhone,
        data_nascimento: newPatientDob,
        nutricionista_id: user.id, // Associa o paciente ao nutricionista logado
      })
      .select(); // Retorna o objeto do paciente recém-criado

    setIsFormSubmitting(false);

    if (error) {
      console.error("Erro ao adicionar paciente:", error.message);
      setFormError("Erro ao adicionar paciente. Tente novamente.");
    } else {
      console.log("Paciente adicionado com sucesso:", data);
      // Se a inserção foi um sucesso, adicionamos o novo paciente ao estado 'patients'
      if (data && data.length > 0) {
        setPatients((prevPatients) => [...prevPatients, data[0] as Patient]);
      }

      // Resetar o formulário e fechar o modal
      setNewPatientName("");
      setNewPatientEmail("");
      setNewPatientPhone("");
      setNewPatientDob("");
      setIsAddingPatient(false);
    }
  };

  // NOVA FUNÇÃO PARA ATUALIZAR UM PACIENTE
  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPatient) return; // Se não tem paciente para editar, sai da função.

    setIsFormSubmitting(true);
    setFormError("");

    const { data, error } = await supabase
      .from("pacientes")
      .update({
        nome_completo: editingPatient.nome_completo,
        email: editingPatient.email,
        telefone: editingPatient.telefone,
        data_nascimento: editingPatient.data_nascimento,
      })
      .eq("id", editingPatient.id) // <<-- IMPORTANTE: Filtra para atualizar apenas o paciente com este ID
      .select();

    setIsFormSubmitting(false);

    if (error) {
      console.error("Erro ao atualizar paciente:", error.message);
      setFormError("Erro ao atualizar paciente. Tente novamente.");
    } else {
      console.log("Paciente atualizado com sucesso:", data);

      // Atualiza o estado da lista para refletir a mudança
      setPatients((prevPatients) =>
        prevPatients.map((p) => (p.id === editingPatient.id ? data[0] : p))
      );

      // Fecha o formulário de edição
      setEditingPatient(null);
    }
  };

  // FUNÇÃO PARA EXCLUIR UM PACIENTE
  const handleDeletePatient = async (patientId: number) => {
    // Passo de segurança: confirmação do usuário
    const confirmation = window.confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.");
    
    if (!confirmation) {
      return; // Se o usuário cancelar, a função para aqui
    }

    // Lógica para exclusão no Supabase
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', patientId); // <<-- IMPORTANTE: Filtra para deletar apenas o paciente com este ID

    if (error) {
      console.error('Erro ao excluir paciente:', error.message);
      //adicionar um estado para exibir um erro para o usuário
    } else {
      console.log('Paciente excluído com sucesso!');
      
      // Atualiza o estado da lista para remover o paciente excluído
      setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-green-400">Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 p-8">
      <button
            className=" flex justify-center py-3 px-8 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            onClick={() => {
              navigate('/dashboard')
            }} 
          >
            Voltar
          </button>
      <div className="max-w-7xl mx-auto bg-gray-800/30 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-400">Meus Pacientes</h1>
          <button
            className=" flex justify-center py-3 px-4 border border-transparent rounded-3xl shadow-sm text-sm font-medium text-white bg-green-400/80 hover:bg-[#05DF63] hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            onClick={() => {
              setIsAddingPatient(true);// ATUALIZAÇÃO: Abre o formulário
              setEditingPatient(null); // ATUALIZAÇÃO: Garante que a edição é cancelada
            }} 
          >
            + Adicionar Paciente
          </button>
        </div>

        {/*Formulário de Cadastro de Paciente */}
        {isAddingPatient && (
          <div className="mb-6 p-6 border-1 border-green-400/40 rounded-lg">
            <h2 className="text-2xl text-center font-semibold text-gray-300 mb-4">
              Novo Paciente
            </h2>
            <form onSubmit={handleAddPatient} className="space-y-4">
              {/* CAMPO NOME */}
              <div>
                <label
                  htmlFor="patientName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* CAMPO E-MAIL */}
              <div>
                <label
                  htmlFor="patientEmail"
                  className="block text-sm font-medium text-gray-300"
                >
                  E-mail
                </label>
                <input
                  type="email"
                  id="patientEmail"
                  value={newPatientEmail}
                  onChange={(e) => setNewPatientEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* CAMPO TELEFONE */}
              <div>
                <label
                  htmlFor="patientPhone"
                  className="block text-sm font-medium text-gray-300"
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  id="patientPhone"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* CAMPO DATA DE NASCIMENTO */}
              <div>
                <label
                  htmlFor="patientDob"
                  className="block text-sm font-medium text-gray-300"
                >
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="patientDob"
                  value={newPatientDob}
                  onChange={(e) => setNewPatientDob(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* MENSAGEM DE ERRO DO FORMULÁRIO */}
              {formError && <p className="text-red-500 text-sm">{formError}</p>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPatient(false)} // Esconde o formulário
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-400/80 rounded-md hover:bg-green-400 cursor-pointer transition"
                >
                  {isFormSubmitting ? "Salvando..." : "Salvar Paciente"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/*Formulário de EDIÇÃO (só aparece se editingPatient não for null) */}
        {editingPatient && (
          <div className="mb-6 p-6 border-1 border-green-400/40">
            <h2 className="text-2xl text-center font-semibold text-gray-300 mb-4">Editar Paciente</h2>
            <form onSubmit={handleUpdatePatient} className="space-y-4">
              {/* CAMPO NOME */}
              <div>
                <label htmlFor="editPatientName" className="block text-sm font-medium text-gray-300">Nome Completo</label>
                <input
                  type="text"
                  id="editPatientName"
                  // Valor inicial do campo é o do paciente que estamos editando
                  value={editingPatient.nome_completo}
                  onChange={(e) => setEditingPatient({...editingPatient, nome_completo: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* ... Repita para E-mail, Telefone e Data de Nascimento, usando o mesmo padrão ... */}
              {/* CAMPO E-MAIL */}
              <div>
                <label htmlFor="editPatientEmail" className="block text-sm font-medium text-gray-300">E-mail</label>
                <input
                  type="email"
                  id="editPatientEmail"
                  value={editingPatient.email}
                  onChange={(e) => setEditingPatient({...editingPatient, email: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* CAMPO TELEFONE */}
              <div>
                <label htmlFor="editPatientPhone" className="block text-sm font-medium text-gray-300">Telefone</label>
                <input
                  type="tel"
                  id="editPatientPhone"
                  value={editingPatient.telefone}
                  onChange={(e) => setEditingPatient({...editingPatient, telefone: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {/* CAMPO DATA DE NASCIMENTO */}
              <div>
                <label htmlFor="editPatientDob" className="block text-sm font-medium text-gray-300">Data de Nascimento</label>
                <input
                  type="date"
                  id="editPatientDob"
                  value={editingPatient.data_nascimento}
                  onChange={(e) => setEditingPatient({...editingPatient, data_nascimento: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-green-400/40 rounded-md text-gray-200"
                  required
                />
              </div>

              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={cancelEditing} // Usa a nova função de cancelar
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                  {isFormSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        )}


        {patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-600 shadow-md  border-none text-gray-300">
              <thead className="bg-gray-700 text-green-400/90  rounded-t-3xl">
                <tr>
                  <th className="py-3 px-6 text-left">Nome</th>
                  <th className="py-3 px-6 text-left">E-mail</th>
                  <th className="py-3 px-6 text-left">Telefone</th>
                  <th className="py-3 px-6 text-left">Data de Nasc.</th>
                  <th className="py-3 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-500">
                    <td className="py-4 px-6">{patient.nome_completo}</td>
                    <td className="py-4 px-6">{patient.email}</td>
                    <td className="py-4 px-6">{patient.telefone}</td>
                    <td className="py-4 px-6">{patient.data_nascimento}</td>
                    <td className="py-4 px-6 text-center flex flex-wrap">
                      <button onClick={() => startEditing(patient)} className="cursor-pointer text-blue-300 hover:text-blue-700 mr-4">
                        Editar
                      </button>
                      <button onClick={() => handleDeletePatient(patient.id)} className="cursor-pointer text-red-500 hover:text-red-700">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-300 mt-10 text-lg">
            Você ainda não tem pacientes cadastrados.
          </p>
        )}
      </div>
    </div>
  );
}

export default PatientsPage;
