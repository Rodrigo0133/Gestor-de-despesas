import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

export type CategoriaMovimento = { _id: string; nome: string; cor: string };
export type DetalheMovimento = {
  _id: string;
  tipo: "despesa" | "receita";
  titulo?: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
};

export function useMovimento(id: string | undefined, incluirCategorias = false) {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<{
    id: string | undefined;
    movimento: DetalheMovimento | null;
    categorias: CategoriaMovimento[];
    carregado: boolean;
    erro: string;
  }>({ id: undefined, movimento: null, categorias: [], carregado: false, erro: "" });

  useEffect(() => {
    const controlador = new AbortController();
    async function carregar() {
      try {
        if (!id) throw new Error("Movimento não encontrado.");
        const opcoes = { credentials: "include" as const, signal: controlador.signal };
        const [resposta, respostaCategorias] = await Promise.all([
          fetch(`${API_URL}/api/movements/${encodeURIComponent(id)}`, opcoes),
          incluirCategorias ? fetch(`${API_URL}/api/allcategories`, opcoes) : Promise.resolve(null),
        ]);
        if (resposta.status === 401 || respostaCategorias?.status === 401) {
          navigate("/login");
          return;
        }
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.message ?? "Não foi possível carregar o movimento.");
        if (respostaCategorias && !respostaCategorias.ok) {
          const erro = await respostaCategorias.json();
          throw new Error(erro.message ?? "Não foi possível carregar as categorias.");
        }
        const categorias = respostaCategorias ? (await respostaCategorias.json()).utilizador : [];
        if (!controlador.signal.aborted) {
          setEstado({ id, movimento: dados.movimento, categorias, carregado: true, erro: "" });
        }
      } catch (erro) {
        if (!controlador.signal.aborted) {
          setEstado({ id, movimento: null, categorias: [], carregado: true, erro: erro instanceof Error ? erro.message : "Não foi possível contactar o servidor." });
        }
      }
    }
    carregar();
    return () => controlador.abort();
  }, [id, incluirCategorias, navigate]);

  return estado.id === id ? estado : { movimento: null, categorias: [], carregado: false, erro: "" };
}
