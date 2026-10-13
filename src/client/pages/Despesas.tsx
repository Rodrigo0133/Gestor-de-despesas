import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  CircleAlert,
  Minus,
  Plus,
  Tag,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import Menu_dashboard from "../components/Menu_dashboad";
import Top_Painel from "../components/Top_Painel";

type TipoMovimento = "despesa" | "receita";
type Categoria = { _id: string; nome: string; cor: string };

function Despesas() {
  const [tipo, setTipo] = useState<TipoMovimento>("despesa");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<
    Categoria[]
  >([]);
  const categoria = categoriasDisponiveis.find(
    (item) => item._id === categoriaSelecionada,
  );
  const movimentoCompleto = Boolean(
    descricao.trim() && valor && data && categoriaSelecionada,
  );
  const despesa = tipo === "despesa";
  const rotuloTipo = despesa ? "Despesa" : "Receita";
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const AdicionarDespesa = async () => {
    try {
      const resposta = await fetch(`${API_URL}/api/newexpense`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao,
          valor,
          data,
          categoriaSelecionada,
        }),
      });
      if (!resposta.ok) {
        throw new Error("Erro ao adicionar despesa");
      }
    } catch {
      alert("Não foi possível contactar o servidor.");
    }
  };
  const AdicionarReceita = async () => {
    try {
      const resposta = await fetch(`${API_URL}/api/newrevenue`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao,
          valor,
          data,
          categoriaSelecionada,
        }),
      });
      if (!resposta.ok) {
        throw new Error("Erro ao adicionar receita");
      }
    } catch {
      alert("Não foi possível contactar o servidor.");
    }
  }
  useEffect(() => {
    const Catergorias = async () => {
      try {
        const resposta = await fetch(`${API_URL}/api/allcategories`, {
          credentials: "include",
        });

        // A consulta de categorias já é protegida pelo middleware de autenticação.
        if (resposta.status === 401) {
          navigate("/login");
          return;
        }

        if (!resposta.ok) {
          throw new Error("Erro ao obter categorias");
        }

        const dados: { utilizador?: Categoria[] } = await resposta.json();
        setCategoriasDisponiveis(
          Array.isArray(dados.utilizador) ? dados.utilizador : [],
        );
      } catch {
        alert("Não foi possível contactar o servidor.");
      }
    };

    Catergorias();
  }, [navigate]);
  async function guardarMovimento(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (tipo === "despesa") {
      await AdicionarDespesa();
      return;
    }
    await AdicionarReceita();
  }

  return (
    <div className="grid min-h-screen w-full grid-cols-[200px_1fr] bg-slate-50">
      <Menu_dashboard />
      <main
        className="min-w-0 py-6"
        style={{ marginLeft: "3rem", paddingRight: "3rem" }}
      >
        <Top_Painel route="Adicionar movimento" />
        <div className="mt-5 flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-blue-600">MOVIMENTOS</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Adicionar movimento
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Regista uma despesa ou receita nas tuas finanças.
            </p>
          </div>
          <span className="w-fit rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Campos assinalados são necessários
          </span>
        </div>

        <div
          className="mt-8 grid w-full gap-4"
          style={{
            gridTemplateColumns: "minmax(700px, 5fr) minmax(280px, 2fr)",
          }}
        >
          <form
            onSubmit={guardarMovimento}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div className="flex h-10 gap-2">
              {(["despesa", "receita"] as const).map((opcao) => {
                const selecionado = tipo === opcao;
                const opcaoDespesa = opcao === "despesa";
                return (
                  <button
                    key={opcao}
                    type="button"
                    aria-pressed={selecionado}
                    onClick={() => setTipo(opcao)}
                    className={`flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${selecionado ? (opcaoDespesa ? "border-red-300 bg-red-50 text-red-800" : "border-green-300 bg-green-50 text-green-800") : opcaoDespesa ? "border-slate-200 bg-gray-100 text-slate-700 hover:bg-slate-50" : "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100"}`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-white ${opcaoDespesa ? "bg-red-700" : "bg-green-700"}`}
                    >
                      {opcaoDespesa ? <Minus size={12} /> : <Plus size={12} />}
                    </span>
                    {opcaoDespesa ? "Despesa" : "Receita"}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                <span>
                  Descrição <span className="text-rose-500">*</span>
                </span>
                <input
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Ex.: Compras no supermercado"
                  className="h-12 rounded-xl border border-slate-200 px-4 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
              <div className="grid grid-cols-2 gap-5">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  <span>
                    Valor <span className="text-rose-500">*</span>
                  </span>
                  <span className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-slate-500">
                      €
                    </span>
                    <input
                      value={valor}
                      onChange={(event) => setValor(event.target.value)}
                      inputMode="decimal"
                      placeholder="0,00"
                      className="h-12 w-full rounded-xl border border-slate-200 pl-8 pr-4 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  <span>
                    Data <span className="text-rose-500">*</span>
                  </span>
                  <span className="relative">
                    <CalendarDays
                      size={18}
                      className="pointer-events-none absolute left-4 top-3 text-slate-400"
                    />
                    <input
                      value={data}
                      onChange={(event) => setData(event.target.value)}
                      type="date"
                      className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </span>
                </label>
              </div>
              <fieldset>
                <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Tag size={16} className="text-slate-400" /> Categoria{" "}
                  <span className="text-rose-500">*</span>
                </legend>
                <p className="mt-1 text-xs text-slate-500">
                  Escolhe uma categoria para associar ao movimento.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {categoriasDisponiveis.map((item) => {
                    const selecionada = categoriaSelecionada === item._id;
                    return (
                      <button
                        key={item._id}
                        type="button"
                        aria-pressed={selecionada}
                        onClick={() => setCategoriaSelecionada(item._id)}
                        className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-sm font-medium transition ${selecionada ? "border-slate-900 bg-slate-900 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}
                      >
                        <span
                          className="size-3 shrink-0 rounded-full ring-2 ring-white/30"
                          style={{ backgroundColor: item.cor }}
                        />
                        <span className="truncate">{item.nome}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-500 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Plus size={14} aria-hidden="true" />
                    </span>
                    <span className="truncate">Adicionar categoria</span>
                  </button>
                </div>
              </fieldset>
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition ${despesa ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                <Check size={17} /> Guardar {rotuloTipo.toLowerCase()}
              </button>
            </div>
          </form>

          <aside className="h-fit w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-9 items-center justify-center rounded-xl ${despesa ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                >
                  <WalletCards size={18} />
                </span>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Estado do movimento
                  </h2>
                  <p
                    className={`text-sm font-semibold ${despesa ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {rotuloTipo}
                  </p>
                </div>
              </div>
              {movimentoCompleto ? (
                <Check
                  size={20}
                  className="text-emerald-600"
                  aria-label="Pronto"
                />
              ) : (
                <CircleAlert
                  size={20}
                  className="text-amber-500"
                  aria-label="Por preencher"
                />
              )}
            </div>
            <div
              className={`mt-5 rounded-xl border p-4 ${movimentoCompleto ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
            >
              <p className="text-sm font-bold text-slate-800">
                {movimentoCompleto ? "Pronta para guardar" : "Por preencher"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {movimentoCompleto
                  ? "Todos os dados essenciais foram preenchidos."
                  : "Completa a descrição, o valor, a data e a categoria."}
              </p>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-slate-500">Descrição</dt>
                <dd className="max-w-40 truncate text-right font-semibold text-slate-800">
                  {descricao || "Por indicar"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-slate-500">Valor</dt>
                <dd className="font-semibold text-slate-800">
                  {valor ? `${valor} €` : "Por indicar"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-slate-500">Categoria</dt>
                <dd className="flex items-center gap-2 font-semibold text-slate-800">
                  {categoria ? (
                    <>
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </>
                  ) : (
                    "Por indicar"
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-slate-500">Data</dt>
                <dd className="font-semibold text-slate-800">
                  {data
                    ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-PT")
                    : "Por indicar"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              Este painel substitui o quadrado vazio e mostra, em tempo real, o
              estado da despesa.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Despesas;
