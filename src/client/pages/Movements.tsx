import { useEffect, useState } from "react";
import Menu_dashboard from "../components/Menu_dashboad";
import { Navigate } from "react-router";
import Top_Painel from "../components/Top_Painel";
import { formatarMoeda } from "../utils/formatarmoeda";

const API_URL = import.meta.env.VITE_API_URL;

type Movimento = {
  tipo: "receita" | "despesa";
  descricao: string;
  valor: number;
  data: string;
  categoria: {
    nome: string;
    cor: string;
  };
  _id: string;
};

function Movements() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const navigate = Navigate;
  useEffect(() => {
    async function Allmovements() {
      const resposta = await fetch(`${API_URL}/api/movement/10`, {
        credentials: "include",
      });
      if (!resposta.ok) {
        throw new Error("Erro com a API");
      }
      const resultado = await resposta.json();
      setMovimentos(resultado);
    }
    Allmovements();
  }, [navigate]);

  return (
    <div className="grid min-h-screen w-full grid-cols-[200px_1fr] bg-slate-50 ">
      <Menu_dashboard />

      <div className="w-full h-full  p-3">
        <div>
          <Top_Painel route="Movimentos" />
        </div>
        <div className=" w-full mt-2 h-[95%]">
          <div className="bg-gray-300 flex items-center justify-center h-full w-full rounded-md flex-col shadow-2xl">
            <div className="justify-self-start ">
              <h2 className="text-[20px]">Movimentos</h2>
            </div>
            <div className="h-[90%] w-[97%] bg-gray-400 rounded-md mt-3 shadow-2xs flex-col">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-slate-700">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-3 font-semibold">Data</th>
                    <th className="px-3 py-3 font-semibold">Descrição</th>
                    <th className="px-3 py-3 font-semibold">Categoria</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimentos.map((movimento) => (
                    <tr
                      key={movimento._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                        {new Date(movimento.data).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-700">
                          {movimento.descricao}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="rounded-md px-2.5 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: movimento.categoria.cor }}
                        >
                          {movimento.categoria.nome}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${
                          movimento.valor >= 0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {movimento.tipo === "receita" ? "+" : "-"}
                        {formatarMoeda.format(movimento.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Movements;
