import { useEffect } from "react";
import { useNavigate } from "react-router";

function Dashboard() {
  const navigate = useNavigate();

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

        const resposta_id = await fetch(`http://localhost:3000/auth/${userId}`, {
          method: "GET",
        });

        if (!resposta_id.ok) {
            localStorage.removeItem("Usuario");
          navigate("/login");
        }
      } catch {
        navigate("/login");
      }
    };

    verificarUsuario();
  }, [navigate]);

  return <h1>Olá!</h1>;
}

export default Dashboard;