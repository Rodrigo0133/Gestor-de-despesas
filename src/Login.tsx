import { KeyRound, Mail, User } from "lucide-react";

function Login() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface text-primary">
      <div className="flex flex-col items-center justify-center gap-7 rounded-md border border-primary/20 bg-surface p-6 shadow-lg">
        <h1 className="text-2xl">Registrar</h1>

        <div className="flex">
          <label htmlFor="nome" className="mr-2 translate-y-2.5">
            <User />
          </label>
          <input
            id="nome"
            placeholder="Digite o seu nome"
            className="w-full border-primary/20 px-3 py-2 rounded-md focus:border-primary focus:ring-2"
          />
        </div>
        <div className="flex">
          <label htmlFor="email" className="mr-2 translate-y-2.5">
            <Mail />
          </label>
          <input
            id="email"
            placeholder="Digite o seu email"
            className="w-full border-primary/20 px-3 py-2 rounded-md focus:border-primary focus:ring-2"
          />
        </div>
        <div className="flex">
          <label htmlFor="senha" className="mr-2 translate-y-2.5">
            <KeyRound />
          </label>
          <input
            id="senha"
            placeholder="Digite o seu email"
            className="w-full border-primary/20 px-3 py-2 rounded-md focus:border-primary focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-surface transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
        >
          Registar
        </button>
      </div>
    </div>
  );
}
export default Login;
