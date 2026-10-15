import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Trash2, TriangleAlert } from "lucide-react";
import Menu_dashboard from "../components/Menu_dashboad";
import Top_Painel from "../components/Top_Painel";
import { useMovimento } from "../hooks/useMovimento";
import { formatarMoeda } from "../utils/formatarmoeda";

const API_URL = import.meta.env.VITE_API_URL;

export default function EliminarMovimento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movimento, categorias, carregado, erro } = useMovimento(id, true);
  const [aEliminar, setAEliminar] = useState(false);
  const [erroPedido, setErroPedido] = useState("");
  const categoria = categorias.find((item) => item._id === movimento?.categoria);

  async function eliminar() {
    if (!movimento || aEliminar) return;
    setAEliminar(true);
    setErroPedido("");
    try {
      const rota = movimento.tipo === "despesa" ? "deleteexpense" : "deleterevenue";
      const resposta = await fetch(`${API_URL}/api/${rota}/${encodeURIComponent(movimento._id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (resposta.status === 401) { navigate("/login"); return; }
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        setErroPedido(dados?.message ?? "Não foi possível eliminar o movimento.");
        return;
      }
      navigate("/dashboard/movimentos", { replace: true });
    } catch {
      setErroPedido("Não foi possível contactar o servidor. Confirma o histórico antes de tentar novamente.");
    } finally {
      setAEliminar(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[200px_minmax(0,1fr)]">
      <Menu_dashboard />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-12">
        <Top_Painel route="Eliminar movimento" />
        <header className="mt-5">
          <p className="text-sm font-semibold text-blue-600">MOVIMENTOS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Eliminar movimento</h1>
          <p className="mt-2 text-sm text-slate-500">Confirma os detalhes antes de remover este registo.</p>
        </header>
        {!carregado && <p role="status" className="mt-8 text-sm text-slate-500">A carregar movimento…</p>}
        {(erro || erroPedido) && <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{erro || erroPedido}</p>}
        {movimento && (
          <section aria-labelledby="confirmar-eliminacao" className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Trash2 size={21} aria-hidden="true" /></span>
              <div><h2 id="confirmar-eliminacao" className="font-bold text-slate-900">Queres eliminar este movimento?</h2><p className="mt-1 text-sm leading-6 text-slate-500">O registo será removido do histórico e dos teus resumos financeiros.</p></div>
            </div>
            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="flex justify-between gap-6 py-3"><dt className="shrink-0 text-slate-500">Título</dt><dd className="min-w-0 break-words text-right font-semibold text-slate-800">{movimento.titulo || "Sem título"}</dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="shrink-0 text-slate-500">Descrição</dt><dd className="min-w-0 whitespace-pre-wrap break-words text-right text-slate-700">{movimento.descricao || "Sem descrição"}</dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-500">Tipo</dt><dd className="font-semibold text-slate-800">{movimento.tipo === "despesa" ? "Despesa" : "Receita"}</dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-500">Valor</dt><dd className={`font-semibold ${movimento.tipo === "despesa" ? "text-rose-700" : "text-emerald-700"}`}>{formatarMoeda.format(movimento.valor)}</dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-500">Data</dt><dd className="font-medium text-slate-700">{new Date(movimento.data).toLocaleDateString("pt-PT", { timeZone: "UTC" })}</dd></div>
              <div className="flex justify-between gap-6 py-3"><dt className="text-slate-500">Categoria</dt><dd className="min-w-0 break-words text-right font-medium text-slate-700">{categoria?.nome ?? "Sem categoria"}</dd></div>
            </dl>
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" /><p>Esta ação é permanente. Se só precisas de corrigir os dados, podes editar o movimento.</p></div>
            <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
              <Link to="/dashboard/movimentos" className="inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500">Cancelar</Link>
              <button type="button" onClick={eliminar} disabled={aEliminar} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60"><Trash2 size={17} aria-hidden="true" />{aEliminar ? "A eliminar…" : "Confirmar eliminação"}</button>
            </div>
          </section>
        )}
        <Link to="/dashboard/movimentos" className="mt-6 inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-500"><ArrowLeft size={16} aria-hidden="true" /> Voltar aos movimentos</Link>
      </main>
    </div>
  );
}
