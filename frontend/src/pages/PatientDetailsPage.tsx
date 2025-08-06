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

function PatientDetailsPage(): JSX.Element {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Use 'useParams' para pegar o ID da URL

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

      // Busca o paciente específico pelo ID
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single(); // '.single()' retorna um único objeto ou null, em vez de um array

      if (error) {
        console.error("Erro ao buscar detalhes do paciente:", error.message);
        navigate("/patients"); // Redireciona se o paciente não for encontrado
      } else {
        setPatient(data);
      }
      setLoading(false);
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
    <div className="min-h-screen bg-gray-100 p-8">
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

        {/* Seção de Histórico de Consultas (Próximo Passo) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Histórico de Consultas
            </h2>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out">
              + Adicionar Consulta
            </button>
          </div>
          {/* Futuro: Tabela ou lista de consultas */}
          <p className="text-gray-500">Nenhuma consulta registrada ainda.</p>
        </div>

        {/* Seção Plano atribuido (Próximo Passo) */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Planos de Acompanhamento
            </h2>
            <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out">
              + Adicionar Plano
            </button>
          </div>
          {/* Futuro: Tabela ou lista de consultas */}
          <p className="text-gray-500">Nenhum Plano atribuido</p>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsPage;
