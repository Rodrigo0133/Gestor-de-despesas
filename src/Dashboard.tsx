import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CalendarDays, ChevronDown, CirclePlus, TrendingDown, TrendingUp, Wallet } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [dia, setDia] = useState("");
  useEffect(() => {
    const STORAGE_KEY = "Usuario";

    const verificarUsuario = async () => {
      const storage = localStorage.getItem(STORAGE_KEY);

      if (!storage) {
        navigate("/login");
        return;
      }

      try {
        const dados = JSON.parse(storage);
        const userId = dados.utilizador?.id;

        if (!userId) {
          localStorage.removeItem("Usuario");
          navigate("/login");
          return;
        }

        const resposta_id = await fetch(
          `http://localhost:3000/auth/${userId}`,
          {
            method: "GET",
          },
        );

        if (!resposta_id.ok) {
          localStorage.removeItem("Usuario");
          navigate("/login");
        }
        const resultado = await resposta_id.json();
        setNome(resultado.utilizador.nome);
      } catch {
        navigate("/login");
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
  }, [navigate]);

  return (
    <div className="grid min-h-screen w-full grid-cols-[200px_1fr] bg-slate-50 ">
      <div className="w-full h-full">MENU</div>
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

                <select className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-900/20 hover:cursor-pointer">
                  <option value="2024-05">Maio de 2024</option>
                  <option value="2024-04">Abril de 2024</option>
                  <option value="2024-03">Março de 2024</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 text-slate-500"
                />
              </div>
              <button className="appearance-none rounded-lg border border-slate-200 bg-blue-400  pl-5 pr-5 text-sm font-medium text-black outline-none  inline-flex items-center gap-2 hover:bg-blue-500 hover:cursor-pointer transition-all">
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
                  1 250,45 €
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
                  2 850,00 €
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
                  1 599,55 €
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
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[2fr_3fr]">
          <div></div>
          <div className="bg-white rounded-md p-2">
            <div className="flex w-full">
              <h2>Ultimas Transições</h2>
              <a href="apple.com" className="ml-auto mr-4">
                Ver Todos
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
