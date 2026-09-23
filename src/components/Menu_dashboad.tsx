import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL;

interface UserProps{
    nome: string
    id: string
}
function Menu_dashboard({ nome } : UserProps){
    const buttons = [
      {id: "dashboard", name: "Dashboard", route: "/dashboard"},
      {id: "despesa", name: "Despesa", route: "/dashboard/despesas"},
      {id: "movimentos", name: "Movimentos", route: "/dashboard/movimentos"},
    ]
    const navigate = useNavigate()
    const sair = async () => {
        const resposta = await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          credentials: "include",
        });
    
        if (resposta.ok) {
          navigate("/login");
        }
      };
    return(
        <aside className="flex h-full w-full flex-col gap-3 bg-slate-900 p-4 text-white justify-center ">
        <p className="text- font-semibold">Gestor de despesas</p>
        <div className="flex flex-col gap-6 mt-15">
          {buttons.map((button) => {
            return(
              <NavLink
                key={button.id}
                to={button.route}
                end
                className={({ isActive }) => `rounded-lg px-4 py-2 font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-slate-700 text-slate-100 hover:bg-slate-600 hover:text-white"
                }`}
              >
                {button.name}
              </NavLink>
            );
          })}
        </div>
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
    )
}
export default Menu_dashboard
