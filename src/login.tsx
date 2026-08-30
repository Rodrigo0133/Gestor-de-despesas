import { KeyRound, User } from "lucide-react"
import Input from "./components/Input"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router";

function Login(){
    const STORAGE_KEY = "Usuario";
      const navigate = useNavigate();
      useEffect(() => {
        const loginGuardado = localStorage.getItem(STORAGE_KEY);

        if (loginGuardado) {
          navigate("/dashboard");
        }
      }, [navigate]);
    const [nome,setNome] = useState("")
    const [senha,setsenha] = useState("")
    const login = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const dados = {
            nome,
            senha
        }
        const resposta = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        });
        const resultado = await resposta.json();
        if(resultado.ok){
            navigate("/dashboard")
        }
    }
    return(
        <div className="flex min-h-screen w-full items-center justify-center bg-surface text-primary">
              <form
                onSubmit={login}
                className="flex flex-col items-center justify-center gap-7 rounded-md border border-primary/20 bg-surface p-6 shadow-lg"
              >
                <h1 className="text-2xl">Login</h1>
        
                <div className="flex">
                  <label htmlFor="nome" className="mr-2 translate-y-2.5">
                    <User />
                  </label>
                  <Input
                    id="nome"
                    value={nome}
                    placeholder="Digite seu nome/email"
                    onChange={(event) => setNome(event.target.value)}
                  />
                </div>
                <div className="flex">
                  <label htmlFor="senha" className="mr-2 translate-y-2.5">
                    <KeyRound />
                  </label>
                  <Input
                    type="password"
                    id="senha"
                    value={senha}
                    placeholder="Digite a sua senha"
                    onChange={(event) => setsenha(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-surface transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
                >
                  Logar
                </button>
              </form>
            </div>
    )
}
export default Login