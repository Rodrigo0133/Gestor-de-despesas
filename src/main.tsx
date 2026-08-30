import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router";
import './style.css'
import App from './App.tsx'
import Registrar from "./Registrar.tsx";
import Login from './Login.tsx';

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
    path: "/Login",
    element: <Login />
  }
]);  

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
