import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Menu_dashboard from "../components/Menu_dashboad";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

const formatarMoeda = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

function AbrirDespesas(navigate: ReturnType<typeof useNavigate>): void {
  console.log("Abrindo página de despesas...");
  navigate("/dashboard/despesas");
}

type CategoriaResumo = {
  id: string;
  nome: string;
  cor: string;
  total: number;
  percentagem: number;
};
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
function Dashboard() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [dia, setDia] = useState("");
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState("2026-09");
  const [categorias, setCategorias] = useState<CategoriaResumo[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);

  const gradienteCategorias = categorias.length
    ? `conic-gradient(${categorias
        .reduce<{ partes: string[]; percentagemAtual: number }>(
          (resultado, categoria) => {
            const inicio = resultado.percentagemAtual;
            const fim = inicio + categoria.percentagem;
            resultado.partes.push(`${categoria.cor} ${inicio}% ${fim}%`);
            resultado.percentagemAtual = fim;
            return resultado;
          },
          { partes: [], percentagemAtual: 0 },
        )
        .partes.join(", ")})`
    : "#e2e8f0";

  

  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const resposta_id = await fetch("http://localhost:3000/api/auth", {
          credentials: "include",
        });

        if (resposta_id.status === 401) {
          navigate("/login");
          return;
        }

        if (!resposta_id.ok) {
          throw new Error("Erro ao verificar sessão");
        }

        const resultado = await resposta_id.json();
        setNome(resultado.utilizador.nome);
      } catch {
        alert("Não foi possível contactar o servidor.");
      }
    };
    const carregarDashboard = async () => {
      try {
        const resposta = await fetch(
          `http://localhost:3000/api/Dashboard?mes=${mesSelecionado}`,
          {
            credentials: "include",
            method: "GET",
          },
        );
        const resultado = await resposta.json();
        if (resposta.status === 401) {
          navigate("/login");
          return;
        }
        if (!resposta.ok) {
          throw new Error(resultado.message ?? "Erro ao carregar dashboard");
        }
        setNome(resultado.Utilizador.nome);
        setTotalDespesas(resultado.resumo.totalDespesas);
        setTotalReceitas(resultado.resumo.totalReceitas);
        setTotalSaldo(resultado.resumo.saldo);
        const resposta2 = await fetch(
          `http://localhost:3000/api/summary/categories?mes=${mesSelecionado}`,
          { credentials: "include" },
        );

        const resultado2 = await resposta2.json();
        if (resposta2.ok) {
          setCategorias(resultado2.categorias);
        }
        const respostaMovimentos = await fetch(
          "http://localhost:3000/api/movement/10",
          { credentials: "include" },
        );

        const resultadoMovimentos = await respostaMovimentos.json();

        if (respostaMovimentos.ok) {
          setMovimentos(resultadoMovimentos.movimentos);
        }
      } catch {
        alert("Não foi possível contactar o servidor.");
      }
    };
    const VerificarHoras = () => {
      const agora = new Date();
      const hora = agora.getHours();

      if (hora < 12) {
        setDia("Bom Dia");
      } else if (hora < 18) {
        setDia("Boa Tarde");
      } else {
        setDia("Boa Noite");
      }
    };

    VerificarHoras();
    verificarUsuario();
    carregarDashboard();
  }, [navigate, mesSelecionado]);

  return (
    <div className="grid min-h-screen w-full grid-cols-[200px_1fr] bg-slate-50 ">
        <Menu_dashboard nome={nome} id="dashboard" />
      <div className="w-full h-full  p-3">
        <div className="mb-5 flex">
          <div id="Saudação">
            <h2 className="text-2xl">
              {dia} {nome} !
            </h2>
            <p>Aqui está o seu resumo das finanças</p>
          </div>
          <div className=" ml-auto">
            <div className="flex gap-3">
              <div className="relative inline-flex items-center">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 text-slate-500"
                />

                <select
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(event.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/20 hover:cursor-pointer"
                >
                  <option value="2024-05">Maio de 2024</option>
                  <option value="2024-04">Abril de 2024</option>
                  <option value="2024-03">Março de 2024</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 text-slate-500"
                />
              </div>
              <button
                onClick={() => AbrirDespesas(navigate)}
                className="appearance-none rounded-lg border border-slate-200 bg-blue-400  pl-5 pr-5 text-sm font-medium text-black outline-none  inline-flex items-center gap-2 hover:bg-blue-500 hover:cursor-pointer transition-all"
              >
                <CirclePlus size={20} /> Adicionar Movimento
              </button>
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 mb-7">
          <div className="rounded-xl   bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">
                  Saldo total
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {formatarMoeda.format(totalSaldo)}
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-semibold text-green-700">+12,4%</span>
                  <span className="text-slate-500"> vs. abril</span>
                </p>
              </div>
              <div
                aria-hidden="true"
                className="shrink-0 rounded-lg bg-slate-900/10 p-2.5 text-slate-900"
              >
                <Wallet size={20} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">Receitas</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-green-700">
                  {formatarMoeda.format(totalReceitas)}
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-semibold text-green-700">+8,7%</span>
                  <span className="text-slate-500"> vs. abril</span>
                </p>
              </div>
              <div
                aria-hidden="true"
                className="shrink-0 rounded-lg bg-green-700/10 p-2.5 text-green-700"
              >
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">Despesas</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-red-700">
                  {formatarMoeda.format(totalDespesas)}
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-semibold text-red-700">−3,2%</span>
                  <span className="text-slate-500"> vs. abril</span>
                </p>
              </div>
              <div
                aria-hidden="true"
                className="shrink-0 rounded-lg bg-red-700/10 p-2.5 text-red-700"
              >
                <TrendingDown size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,2fr)_minmax(600px,3fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">Despesas por categoria</h2>

            <div className="mt-7 flex min-h-[280px] flex-col items-center justify-center gap-8 sm:flex-row">
              <div
                role="img"
                aria-label={
                  categorias.length
                    ? "Gráfico das despesas por categoria"
                    : "Não existem despesas neste período"
                }
                className="relative h-56 w-56 shrink-0 rounded-full"
                style={{
                  background: gradienteCategorias,
                }}
              >
                <div className="absolute inset-12 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                  <strong className="text-xl text-slate-900">
                    {formatarMoeda.format(totalDespesas)}
                  </strong>
                  <span className="mt-1 text-sm text-slate-500">Total</span>
                </div>
              </div>

              <ul className="w-full max-w-56 space-y-4 text-sm">
                {categorias.length === 0 && (
                  <li className="text-slate-500">
                    Não existem despesas neste período.
                  </li>
                )}
                {categorias.map((categoria) => (
                  <li
                    key={categoria.nome}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4"
                  >
                    <span className="flex items-center gap-2 font-semibold text-slate-700">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </span>
                    <span className="row-span-2 text-slate-500">
                      {categoria.percentagem}%
                    </span>
                    <span className="mt-1 pl-5 text-slate-700">
                      {formatarMoeda.format(categoria.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 flex justify-end">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50">
                Ver todas as categorias
                <ChevronRight size={16} />
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <h2 className="font-bold text-slate-900">Movimentos recentes</h2>
              <button className="text-sm font-medium text-blue-600 transition hover:text-blue-800">
                Ver todos
              </button>
            </div>

            <div className="overflow-x-auto">
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
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
