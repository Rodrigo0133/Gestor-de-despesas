import { KeyRound, Mail, User } from "lucide-react";
import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";
import Input from "./components/Input";

function Registrar() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email,setEmail] = useState("");
  const [senha,setsenha] = useState("");
  const Registrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const dados = {
      nome,
      email,
      senha,
    };
    const resposta = await fetch("http://localhost:3000/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json();

    if (resposta.ok) {
      const dados2 = {
        nome,
        senha
      }
      const resposta = await fetch("http://localhost:3000/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados2),
        });
        const resultado2 = await resposta.json();
        if(resposta.ok){
            navigate("/dashboard")
        } else {
            alert(resultado2.message);
        }
      return;
    }

    console.log(resultado.message);
  };
  useEffect(() => {
    const verificarUsuario = async () => {
          try {
            const resposta_id = await fetch("http://localhost:3000/auth", {
              credentials: "include",
            });
    
            
    
            if (!resposta_id.ok) {
              throw new Error("Erro ao verificar sessão");
            }else{
              navigate("/dashboard")
            }
    
            const resultado = await resposta_id.json();
            setNome(resultado.utilizador.nome);
          } catch {
            alert("Não foi possível contactar o servidor.");
          }
        };
        verificarUsuario();
  },[navigate])
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface text-primary">
      <form
        onSubmit={Registrar}
        className="flex flex-col items-center justify-center gap-7 rounded-md border border-primary/20 bg-surface p-6 shadow-lg"
      >
        <h1 className="text-2xl">Registar</h1>

        <div className="flex">
          <label htmlFor="nome" className="mr-2 translate-y-2.5">
            <User />
          </label>
          <Input
            id="nome"
            value={nome}
            placeholder="Digite o seu nome"
            onChange={(event) => setNome(event.target.value)}
          />
        </div>
        <div className="flex">
          <label htmlFor="email" className="mr-2 translate-y-2.5">
            <Mail />
          </label>
          <Input
            type="email"
            value={email}
            id="email"
            placeholder="Digite o seu email"
            onChange={(event) => setEmail(event.target.value)}
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
          Registar
        </button>
      </form>
    </div>
  );
}
export default Registrar;
