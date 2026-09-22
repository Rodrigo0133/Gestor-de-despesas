import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
interface UserProps{
    nome: string
}
function Menu_dashboard({ nome } : UserProps){
    const navigate = useNavigate()
    const sair = async () => {
        const resposta = await fetch("http://localhost:3000/api/logout", {
          method: "POST",
          credentials: "include",
        });
    
        if (resposta.ok) {
          navigate("/login");
        }
      };
    return(
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
    )
}
export default Menu_dashboard