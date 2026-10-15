import { useEffect, useState } from "react";
import Menu_dashboard from "../components/Menu_dashboad";
import { Link, useNavigate } from "react-router";
import Top_Painel from "../components/Top_Painel";
import { formatarMoeda } from "../utils/formatarmoeda";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, ChevronDown, FileSpreadsheet, ListFilter, Pencil, ReceiptText, Search, Trash2, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const opcoesOrdenacao = {
  recentes: "Mais recentes primeiro",
  antigos: "Mais antigos primeiro",
  maiorValor: "Maior valor primeiro",
  menorValor: "Menor valor primeiro",
};

function normalizarPesquisa(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-PT").trim();
}

type Movimento = {
  tipo: "receita" | "despesa";
  titulo?: string;
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
  const [meses, setMeses] = useState<string[]>([]);
  const [mesSelecionado, setMesSelecionado] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"todos" | Movimento["tipo"]>("todos");
  const [pesquisa, setPesquisa] = useState("");
  const [ordenacao, setOrdenacao] = useState<keyof typeof opcoesOrdenacao>("recentes");
  const [erro, setErro] = useState("");
  const [erroExportacao, setErroExportacao] = useState("");
  const [aExportar, setAExportar] = useState(false);
  const [movimentoExpandido, setMovimentoExpandido] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const controlador = new AbortController();
    async function Allmovements() {
      try {
        const resposta = await fetch(`${API_URL}/api/movement/0${mesSelecionado ? `?mes=${mesSelecionado}` : ""}`, {
          credentials: "include",
          signal: controlador.signal,
        });
        if (resposta.status === 401) {
          navigate("/login");
          return;
        }
        if (!resposta.ok) throw new Error("Não foi possível carregar os movimentos.");
        const resultado = await resposta.json();
        setMovimentos(resultado.movimentos);
        setMeses(resultado.meses);
        setErro("");
      } catch {
        if (!controlador.signal.aborted) setErro("Não foi possível carregar os movimentos.");
      }
    }
    Allmovements();
    return () => controlador.abort();
  }, [navigate, mesSelecionado]);

  const pesquisaNormalizada = normalizarPesquisa(pesquisa);
  const movimentosFiltrados = movimentos.filter((movimento) => {
    const correspondeAoTipo = tipoSelecionado === "todos" || movimento.tipo === tipoSelecionado;
    const texto = normalizarPesquisa(`${movimento.titulo ?? ""} ${movimento.descricao} ${movimento.categoria.nome}`);
    return correspondeAoTipo && texto.includes(pesquisaNormalizada);
  }).sort((a, b) => {
    if (ordenacao === "maiorValor") return b.valor - a.valor;
    if (ordenacao === "menorValor") return a.valor - b.valor;
    const diferencaDatas = new Date(a.data).getTime() - new Date(b.data).getTime();
    return ordenacao === "antigos" ? diferencaDatas : -diferencaDatas;
  });
  const temFiltros = Boolean(pesquisa.trim() || mesSelecionado || tipoSelecionado !== "todos" || ordenacao !== "recentes");

  async function exportarExcel() {
    if (aExportar) return;
    setAExportar(true);
    setErroExportacao("");
    try {
      const filtros = new URLSearchParams({ tipo: tipoSelecionado, pesquisa, ordenacao });
      if (mesSelecionado) filtros.set("mes", mesSelecionado);
      const resposta = await fetch(`${API_URL}/api/movements/export/excel?${filtros}`, {
        credentials: "include",
      });
      if (resposta.status === 401) {
        navigate("/login");
        return;
      }
      if (!resposta.ok) throw new Error("Falha na exportação");
      const ficheiro = await resposta.blob();
      const endereco = URL.createObjectURL(ficheiro);
      const ligacao = document.createElement("a");
      ligacao.href = endereco;
      ligacao.download = `movimentos-${mesSelecionado || "todos"}.xlsx`;
      document.body.appendChild(ligacao);
      ligacao.click();
      ligacao.remove();
      window.setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    } catch {
      setErroExportacao("Não foi possível exportar para Excel. Tenta novamente.");
    } finally {
      setAExportar(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 md:grid md:grid-cols-[200px_minmax(0,1fr)]">
      <Menu_dashboard />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-12">
        <Top_Painel route="Movimentos" />

        <header className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-blue-600">MOVIMENTOS</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Os teus movimentos
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Consulta as tuas receitas e despesas e acompanha cada movimento das tuas finanças.
            </p>
          </div>
          <button
            type="button"
            onClick={exportarExcel}
            disabled={aExportar}
            aria-busy={aExportar}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto"
          >
            <FileSpreadsheet size={18} aria-hidden="true" />
            {aExportar ? "A exportar…" : "Exportar para Excel"}
          </button>
        </header>

        {(erro || erroExportacao) && (
          <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {erroExportacao || erro}
          </p>
        )}

        <section aria-labelledby="historico-movimentos" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ReceiptText size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="historico-movimentos" className="font-bold text-slate-900">Histórico de movimentos</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {movimentosFiltrados.length} {movimentosFiltrados.length === 1 ? "movimento encontrado" : "movimentos encontrados"} de {movimentos.length}
                </p>
              </div>
            </div>
            <label className="flex w-full items-center gap-3 text-sm font-medium text-slate-600 sm:w-auto">
              <span className="inline-flex items-center gap-2">
                <ListFilter size={16} aria-hidden="true" /> Mês
              </span>
              <span className="relative min-w-0 flex-1 sm:flex-none">
                <CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" />
                <select
                  value={mesSelecionado}
                  onChange={(event) => setMesSelecionado(event.target.value)}
                  className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:min-w-48"
                >
                  <option value="">Todos os meses</option>
                  {meses.map((mes) => (
                    <option key={mes} value={mes}>{new Date(`${mes}-01T00:00:00Z`).toLocaleDateString("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" })}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3 text-slate-400" aria-hidden="true" />
              </span>
            </label>
          </div>

          <div className="border-b border-slate-100 bg-slate-50/50 p-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <label className="grid gap-2 text-xs font-semibold text-slate-600 sm:col-span-2 xl:col-span-1">
                Pesquisar
                <span className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Título, descrição ou categoria"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </span>
              </label>
              <label className="grid gap-2 text-xs font-semibold text-slate-600">
                Tipo de movimento
                <select
                  value={tipoSelecionado}
                  onChange={(event) => setTipoSelecionado(event.target.value as typeof tipoSelecionado)}
                  className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="todos">Despesas e receitas</option>
                  <option value="despesa">Só despesas</option>
                  <option value="receita">Só receitas</option>
                </select>
              </label>
              <label className="grid gap-2 text-xs font-semibold text-slate-600">
                Ordenar por
                <select
                  value={ordenacao}
                  onChange={(event) => setOrdenacao(event.target.value as keyof typeof opcoesOrdenacao)}
                  className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {Object.entries(opcoesOrdenacao).map(([valor, nome]) => (
                    <option key={valor} value={valor}>{nome}</option>
                  ))}
                </select>
              </label>
            </div>
            {temFiltros && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPesquisa("");
                    setMesSelecionado("");
                    setTipoSelecionado("todos");
                    setOrdenacao("recentes");
                    setMovimentoExpandido(null);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <X size={14} aria-hidden="true" /> Limpar filtros
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <caption className="sr-only">Receitas e despesas do período selecionado</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Data</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Título</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Categoria</th>
                  <th scope="col" className="px-4 py-4 font-semibold">Tipo</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">Valor</th>
                  <th scope="col" className="px-6 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {movimentosFiltrados.length === 0 && !erro && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <ReceiptText size={23} aria-hidden="true" />
                      </span>
                      <p className="mt-4 font-semibold text-slate-700">Nenhum movimento encontrado</p>
                      <p className="mt-2 text-xs text-slate-500">Experimenta outra pesquisa ou ajusta os filtros para consultar o teu histórico.</p>
                    </td>
                  </tr>
                )}
                {movimentosFiltrados.map((movimento) => (
                  <tr key={movimento._id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-6 py-5 tabular-nums text-slate-500">
                      {new Date(movimento.data).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="max-w-80 break-words px-4 py-5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-expanded={movimentoExpandido === movimento._id}
                          aria-controls={`descricao-${movimento._id}`}
                          aria-label={`${movimentoExpandido === movimento._id ? "Ocultar" : "Mostrar"} descrição de ${movimento.titulo || "movimento sem título"}`}
                          onClick={() => setMovimentoExpandido((atual) => atual === movimento._id ? null : movimento._id)}
                          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        >
                          <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${movimentoExpandido === movimento._id ? "rotate-180" : ""}`} />
                        </button>
                        <span className="min-w-0 font-semibold">{movimento.titulo || "Sem título"}</span>
                      </div>
                      <p
                        id={`descricao-${movimento._id}`}
                        hidden={movimentoExpandido !== movimento._id}
                        className="mt-2 whitespace-pre-wrap pl-10 text-xs font-normal leading-5 text-slate-500"
                      >
                        {movimento.descricao || "Sem descrição."}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: movimento.categoria.cor }} />
                        {movimento.categoria.nome}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${movimento.tipo === "receita" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {movimento.tipo === "receita" ? <ArrowDownLeft size={14} aria-hidden="true" /> : <ArrowUpRight size={14} aria-hidden="true" />}
                        {movimento.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-6 py-5 text-right font-semibold tabular-nums ${movimento.tipo === "receita" ? "text-emerald-700" : "text-rose-700"}`}>
                      {movimento.tipo === "receita" ? "+" : "−"}{formatarMoeda.format(movimento.valor)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <Link to={`/dashboard/movimentos/${movimento._id}/editar`} aria-label={`Editar ${movimento.titulo || "movimento"}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"><Pencil size={14} aria-hidden="true" /> Editar</Link>
                        <Link to={`/dashboard/movimentos/${movimento._id}/eliminar`} aria-label={`Eliminar ${movimento.titulo || "movimento"}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"><Trash2 size={14} aria-hidden="true" /> Eliminar</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-slate-500">
            <p>{opcoesOrdenacao[ordenacao]}</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" /> Receitas</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-rose-500" /> Despesas</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Movements;
