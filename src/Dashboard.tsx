import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Clapperboard,
  Fuel,
  House,
  LogOut,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";

const formatarMoeda = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

const categorias = [
  { nome: "Alimentação", valor: 607.3, percentagem: 38, cor: "#ef4444" },
  { nome: "Transporte", valor: 399.65, percentagem: 25, cor: "#3b82f6" },
  { nome: "Casa", valor: 319.9, percentagem: 20, cor: "#7c6ee6" },
  { nome: "Lazer", valor: 272.7, percentagem: 17, cor: "#2fb5aa" },
];

const movimentosRecentes = [
  {
    data: "24/05/2024",
    descricao: "Supermercado Continente",
    categoria: "Alimentação",
    valor: -85.64,
    Icone: ShoppingCart,
    estilo: "bg-red-50 text-red-500",
  },
  {
    data: "23/05/2024",
    descricao: "Repsol",
    categoria: "Transporte",
    valor: -52.1,
    Icone: Fuel,
    estilo: "bg-blue-50 text-blue-600",
  },
  {
    data: "22/05/2024",
    descricao: "Salário",
    categoria: "Receitas",
    valor: 2850,
    Icone: BriefcaseBusiness,
    estilo: "bg-green-50 text-green-700",
  },
  {
    data: "21/05/2024",
    descricao: "Renda de casa",
    categoria: "Casa",
    valor: -750,
    Icone: House,
    estilo: "bg-violet-50 text-violet-600",
  },
  {
    data: "19/05/2024",
    descricao: "Cinema",
    categoria: "Lazer",
    valor: -23.4,
    Icone: Clapperboard,
    estilo: "bg-teal-50 text-teal-600",
  },
  {
    data: "18/05/2024",
    descricao: "Restaurante",
    categoria: "Alimentação",
    valor: -28.75,
    Icone: Utensils,
    estilo: "bg-red-50 text-red-500",
  },
];




function AbrirDespesas(navigate: ReturnType<typeof useNavigate>): void {
  console.log("Abrindo página de despesas...");
  navigate("/dashboard/despesas");
}


const estilosCategoria: Record<string, string> = {
  Alimentação: "bg-red-50 text-red-600",
  Transporte: "bg-blue-50 text-blue-600",
  Receitas: "bg-green-50 text-green-700",
  Casa: "bg-violet-50 text-violet-600",
  Lazer: "bg-teal-50 text-teal-700",
};

function Dashboard() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [dia, setDia] = useState("");
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [mesSelecionado, setMesSelecionado] = useState("2026-09");

  const sair = async () => {
    const resposta = await fetch("http://localhost:3000/logout", {
      method: "POST",
      credentials: "include",
    });

    if (resposta.ok) {
      navigate("/login");
    }
  };

  useEffect(() => {
    const verificarUsuario = async () => {
      try {
        const resposta_id = await fetch("http://localhost:3000/auth", {
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
        const resposta = await fetch(`http://localhost:3000/dashboard?mes=${mesSelecionado}`, {
          credentials: "include",
          method: "GET",
        });
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
      <aside className="flex h-full w-full flex-col gap-3 bg-slate-900 p-4 text-white justify-center ">
        <p className="text-lg font-semibold">Gestor de despesas</p>
        <p className="mt-auto text-lg text-center"> Olá {nome}</p>
        <button
          type="button"
          onClick={sair}
          className="items-end inline-flex cursor-pointer  gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-white/10"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>
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

                <select value={mesSelecionado} onChange={(event) => setMesSelecionado(event.target.value)} className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/20 hover:cursor-pointer">
                  <option value="2024-05">Maio de 2024</option>
                  <option value="2024-04">Abril de 2024</option>
                  <option value="2024-03">Março de 2024</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 text-slate-500"
                />
              </div>
              <button onClick={() => AbrirDespesas(navigate)} className="appearance-none rounded-lg border border-slate-200 bg-blue-400  pl-5 pr-5 text-sm font-medium text-black outline-none  inline-flex items-center gap-2 hover:bg-blue-500 hover:cursor-pointer transition-all">
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
                aria-label="Gráfico das despesas: 38% alimentação, 25% transporte, 20% casa e 17% lazer"
                className="relative h-56 w-56 shrink-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(#ef4444 0 38%, #ffffff 38% 38.5%, #3b82f6 38.5% 63%, #ffffff 63% 63.5%, #7c6ee6 63.5% 83%, #ffffff 83% 83.5%, #2fb5aa 83.5% 100%)",
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
                      {formatarMoeda.format(categoria.valor)}
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
                    <th className="px-5 py-3 text-right font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentosRecentes.map((movimento) => {
                    const Icone = movimento.Icone;

                    return (
                      <tr
                        key={`${movimento.data}-${movimento.descricao}`}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                          {movimento.data}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-lg p-2 ${movimento.estilo}`}>
                              <Icone size={18} />
                            </span>
                            <span className="font-medium text-slate-700">
                              {movimento.descricao}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${estilosCategoria[movimento.categoria]}`}
                          >
                            {movimento.categoria}
                          </span>
                        </td>
                        <td
                          className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${
                            movimento.valor >= 0 ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {movimento.valor >= 0 ? "+" : ""}
                          {formatarMoeda.format(movimento.valor)}
                        </td>
                      </tr>
                    );
                  })}
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
