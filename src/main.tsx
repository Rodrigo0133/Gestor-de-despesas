import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './style.css'
import App from './App.tsx'
import Registrar from "./Registrar.tsx";
import Login from './login.tsx';
import Dashboard from './Dashboard.tsx';
import Despesas from './Despesas.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/Registrar",
    element: <Registrar />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/Dashboard",
    element: <Dashboard />
  },
  {
    path: "/Dashboard/Despesas",
    element: <Despesas />
  }
]);  

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
