import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './style.css'
import App from './pages/App.tsx'
import Registrar from "./pages/Registrar.tsx";
import Login from './pages/login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Despesas from './pages/Despesas.tsx';
import Movements from './pages/Movements.tsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/registrar",
    element: <Registrar />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/dashboard/despesas",
    element: <Despesas />
  },
  {
    path: "/dashboard/movimentos",
    element: <Movements />
  }
]);  

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
