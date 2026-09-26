import { useState } from "react";
import { Minus, Plus } from "lucide-react";

function Despesas() {
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");

  return (
    <div>
      <div className="grid min-h-screen w-full grid-cols-[200px_1fr] bg-slate-50 ">
        <div></div>
        <div className="flex flex-col items-start  min-h-screen bg-gray-200">
          <div className="flex  mt-2 ml-2">
            <p>
              <a href="/dashboard" className="text-blue-600">
                Painel
              </a>
              / Adicionar movimentos
            </p>
          </div>
          <div className="ml-2 mt-3">
            <h1 className="text-3xl font-bold">Adicionar movimento</h1>
            <div className="mt-1">
              <p className="text-gray-400 text-1xl">
                Regista uma despesa ou receita nas tuas finanças
              </p>
            </div>
          </div>
          <div className="flex h-full mb-3 ml-2 mt-5">
            <div className="w-[700px] flex flex-col bg-white">
              <div className="flex ml-2 mr-2 h-[40px] gap-2 mt-2">
                <button
                  type="button"
                  aria-pressed={tipo === "despesa"}
                  onClick={() => setTipo("despesa")}
                  className={`flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
                    tipo === "despesa"
                      ? "border-red-300 bg-red-50 text-red-800"
                      : "border-slate-200 bg-gray-100 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-700 text-white">
                    <Minus size={12} aria-hidden="true" />
                  </span>
                  Despesa
                </button>
                <button
                  type="button"
                  aria-pressed={tipo === "receita"}
                  onClick={() => setTipo("receita")}
                  className={`flex w-1/2 cursor-pointer items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors ${
                    tipo === "receita"
                      ? "border-green-300 bg-green-50 text-green-800"
                      : "border-slate-200 bg-gray-100 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-green-700 text-white">
                    <Plus size={12} aria-hidden="true" />
                  </span>
                  Receita
                </button>
              </div>
            </div>
            <div className=" w-[300px] ml-2 h-[250px]"> </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Despesas;
