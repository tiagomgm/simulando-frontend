import axios from "axios";
import { getToken } from "../utils/token";
const API_URL = "http://127.0.0.1:8000/api";

// Lista todas as avaliações disponíveis para o usuário logado
export async function listarAvaliacoes() {
  const resp = await axios.get(`${API_URL}/avaliacoes/`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return resp.data;
}

// Lista as questões de uma avaliação específica
export async function listarQuestoes(avaliacaoId: string | undefined, token?: string) {
  try {
    const realToken = token || getToken();
    console.log('Fazendo requisição para:', `${API_URL}/questoes/?avaliacao=${avaliacaoId}`);
    const response = await axios.get(`${API_URL}/questoes/`, {
      params: { avaliacao: avaliacaoId },
      headers: {
        Authorization: `Bearer ${realToken}`
      }
    });
    console.log('Resposta da API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao listar questões:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    throw error;
  }
}

// Envia respostas do aluno para uma avaliação
export async function enviarRespostas(avaliacaoId: string | undefined, respostasQuestoes: any[], token?: string) {
  try {
    const realToken = token || getToken();
    const response = await axios.post(`${API_URL}/respostas/`, {
      avaliacao: avaliacaoId,
      respostas_questoes: respostasQuestoes
    }, {
      headers: {
        Authorization: `Bearer ${realToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar respostas:', error);
    throw error;
  }
}

// Cria uma avaliação
export async function criarAvaliacao(dados: any) {
  const resp = await axios.post(`${API_URL}/avaliacoes/`, dados, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return resp.data;
}

// Cria uma questão
export async function criarQuestao(dados: any) {
  const resp = await axios.post(`${API_URL}/questoes/`, dados, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return resp.data;
}

// Cria um grupo de valor
export async function criarGrupoValor(dados: any) {
  const resp = await axios.post(`${API_URL}/gruposvalor/`, dados, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return resp.data;
}