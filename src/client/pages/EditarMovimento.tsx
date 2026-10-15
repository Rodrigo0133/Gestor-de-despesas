import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import Menu_dashboard from "../components/Menu_dashboad";
import Top_Painel from "../components/Top_Painel";
import { useMovimento, type CategoriaMovimento, type DetalheMovimento } from "../hooks/useMovimento";

const API_URL = import.meta.env.VITE_API_URL;
const estiloCampo = "mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50";

function FormularioEdicao({ movimento, categorias }: { movimento: DetalheMovimento; categorias: CategoriaMovimento[] }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState(movimento.titulo ?? "");
  const [descricao, setDescricao] = useState(movimento.descricao);
  const [valor, setValor] = useState(String(movimento.valor));
  const [data, setData] = useState(movimento.data.slice(0, 10));
  const [categoria, setCategoria] = useState(categorias.some((item) => item._id === movimento.categoria) ? movimento.categoria : "");
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (aGuardar) return;
    const valorNumerico = Number(valor.replace(",", "."));
    if (!titulo.trim() || !descricao.trim() || !Number.isFinite(valorNumerico) || valorNumerico <= 0 || !data || !categoria) {
      setErro("Preenche todos os campos e indica um valor superior a zero.");
      return;
    }
    setAGuardar(true);
    setErro("");
    try {
      const rota = movimento.tipo === "despesa" ? "updateexpense" : "updaterevenue";
      const resposta = await fetch(`${API_URL}/api/${rota}/${encodeURIComponent(movimento._id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo.trim(), descricao: descricao.trim(), valor: valorNumerico, data, categoria }),
      });
      if (resposta.status === 401) { navigate("/login"); return; }
      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        setErro(dados?.message ?? "Não foi possível guardar o movimento.");
        return;
      }
      navigate("/dashboard/movimentos", { replace: true });
    } catch {
      setErro("Não foi possível contactar o servidor. Os dados continuam no formulário.");
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <form onSubmit={guardar} className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Pencil size={20} aria-hidden="true" /></span>
        <div><h2 className="font-bold text-slate-900">Detalhes do movimento</h2><p className="mt-1 text-sm text-slate-500">{movimento.tipo === "despesa" ? "Despesa" : "Receita"} · Atualiza os campos abaixo.</p></div>
      </div>
      {erro && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{erro}</p>}
      <fieldset disabled={aGuardar} className="mt-6 space-y-5">
        <label className="block text-sm font-semibold text-slate-700">Título <span className="text-rose-500">*</span><input name="titulo" value={titulo} onChange={(event) => setTitulo(event.target.value)} required className={estiloCampo} /></label>
        <label className="block text-sm font-semibold text-slate-700">Descrição <span className="text-rose-500">*</span><textarea name="descricao" value={descricao} onChange={(event) => setDescricao(event.target.value)} required rows={3} className={`${estiloCampo} resize-y`} /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Valor (€) <span className="text-rose-500">*</span><input name="valor" value={valor} onChange={(event) => setValor(event.target.value)} inputMode="decimal" required className={estiloCampo} /></label>
          <label className="block text-sm font-semibold text-slate-700">Data <span className="text-rose-500">*</span><input name="data" type="date" value={data} onChange={(event) => setData(event.target.value)} required className={estiloCampo} /></label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Categoria <span className="text-rose-500">*</span>
          <select name="categoria" value={categoria} onChange={(event) => setCategoria(event.target.value)} required className={estiloCampo}>
            <option value="">Escolhe uma categoria</option>
            {categorias.map((item) => <option key={item._id} value={item._id}>{item.nome}</option>)}
          </select>
        </label>
      </fieldset>
      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <Link to="/dashboard/movimentos" className="inline-flex min-h-11 items-center rounded-xl px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500">Cancelar</Link>
        <button type="submit" disabled={aGuardar} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-60"><Check size={17} aria-hidden="true" />{aGuardar ? "A guardar…" : "Guardar alterações"}</button>
      </div>
    </form>
  );
}

export default function EditarMovimento() {
  const { id } = useParams();
  const { movimento, categorias, carregado, erro } = useMovimento(id, true);
  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[200px_minmax(0,1fr)]">
      <Menu_dashboard />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-12">
        <Top_Painel route="Editar movimento" />
        <header className="mt-5"><p className="text-sm font-semibold text-blue-600">MOVIMENTOS</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Editar movimento</h1><p className="mt-2 text-sm text-slate-500">Revê os dados e guarda as alterações nas tuas finanças.</p></header>
        {!carregado && <p role="status" className="mt-8 text-sm text-slate-500">A carregar movimento…</p>}
        {erro && <p role="alert" className="mt-8 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{erro}</p>}
        {movimento && <FormularioEdicao key={movimento._id} movimento={movimento} categorias={categorias} />}
        <Link to="/dashboard/movimentos" className="mt-6 inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-blue-600 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-500"><ArrowLeft size={16} aria-hidden="true" /> Voltar aos movimentos</Link>
      </main>
    </div>
  );
}
