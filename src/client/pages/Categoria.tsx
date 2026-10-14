import { useState } from "react";
import { Check, Info, Palette, Plus, Tag } from "lucide-react";
import { useNavigate } from "react-router";
import Menu_dashboard from "../components/Menu_dashboad";
import Top_Painel from "../components/Top_Painel";

function Categoria() {
  const navigate = useNavigate()
  const [nome, setnome] = useState<string>("");
  const [cor, setcor] = useState<string>("#3b82f6");
  async function RegistrarCategoria() {
    if (!nome) {
      throw new Error("Precisa de um nome")
    } else {
      try {
        const API_URL = import.meta.env.VITE_API_URL
        const pedido = await fetch(`${API_URL}/api/newcategory`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome,
            cor
          })
        })
        if (!pedido.ok) {
          throw new Error("Erro ao adicionar categoria");
        } else {
          navigate("/dashboard/despesas")
        }
      } catch (erro) {
        console.log(erro)
        b
      }
    }
    
  }
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 md:grid md:grid-cols-[200px_minmax(0,1fr)]">
      <Menu_dashboard />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-12">
        <Top_Painel route="Nova categoria" />

        <header className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">CATEGORIAS</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Nova categoria
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Dá um nome e uma cor aos teus movimentos para organizar melhor as
              tuas finanças.
            </p>
          </div>
          <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Campos com * são obrigatórios
          </span>
        </header>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(280px,3fr)]">
          <section
            aria-labelledby="dados-categoria"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Tag size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="dados-categoria" className="font-bold text-slate-900">
                  Detalhes da categoria
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Uma forma simples de manter tudo organizado.
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-7">
              <div>
                <label htmlFor="nome-categoria" className="text-sm font-semibold text-slate-700">
                  Nome da categoria <span className="text-rose-500">*</span>
                </label>
                <input
                  id="nome-categoria"
                  name="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => setnome(event.target.value)}
                  required
                  placeholder="Ex.: Alimentação"
                  aria-describedby="ajuda-nome-categoria"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <p id="ajuda-nome-categoria" className="mt-2 text-xs leading-5 text-slate-500">
                  Escolhe um nome curto e fácil de reconhecer, como Transportes ou Saúde.
                </p>
              </div>

              <div>
                <label htmlFor="cor-categoria" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Palette size={16} className="text-slate-400" aria-hidden="true" />
                  Cor da categoria <span className="text-rose-500">*</span>
                </label>
                <p id="ajuda-cor-categoria" className="mt-2 text-xs leading-5 text-slate-500">
                  Clica na amostra para escolher uma cor. Será usada para
                  identificar a categoria nas listas e nos gráficos.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    id="cor-categoria"
                    name="cor"
                    type="color"
                    value={cor}
                    onChange={(event) => setcor(event.target.value)}
                    aria-describedby="ajuda-cor-categoria"
                    className="size-14 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700">Cor selecionada</p>
                    <p className="mt-1 font-mono text-xs uppercase text-slate-500">{cor}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                    <Check size={13} aria-hidden="true" /> Personalizada
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <Info size={18} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                <p className="text-xs leading-6 text-blue-800">
                  Usa categorias para agrupar movimentos semelhantes. Assim,
                  torna-se mais fácil perceber onde gastas e de onde vêm as tuas receitas.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:w-auto"
                onClick={() => {RegistrarCategoria()}}
              >
                <Plus size={18} aria-hidden="true" /> Guardar categoria
              </button>
            </div>
          </section>

          <aside
            aria-labelledby="previsualizacao-categoria"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Palette size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="previsualizacao-categoria" className="font-bold text-slate-900">
                  Pré-visualização
                </h2>
                <p className="mt-1 text-xs text-slate-500">A tua categoria, em tempo real.</p>
              </div>
            </div>

            <div className="mt-6 flex min-h-44 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <Tag size={25} style={{ color: cor }} aria-hidden="true" />
              </span>
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
                <span className="min-w-0 break-words">{nome.trim() || "Nome da categoria"}</span>
              </span>
            </div>

            <dl className="mt-5 divide-y divide-slate-100 text-sm">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="shrink-0 text-slate-500">Nome</dt>
                <dd className="min-w-0 break-words text-right font-semibold text-slate-800">
                  {nome.trim() || "Por indicar"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-slate-500">Cor</dt>
                <dd className="inline-flex items-center gap-2 font-mono text-xs uppercase text-slate-700">
                  <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: cor }} />
                  {cor}
                </dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              É assim que o nome e a cor vão identificar a categoria nos teus movimentos.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Categoria;
