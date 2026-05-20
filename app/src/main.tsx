import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      richColors
      toastOptions={{
        style: {
          fontSize: "16px",
          padding: "18px 20px",
          minWidth: "320px",
        },
      }}
      position="top-right"
    />
  </StrictMode>,
);
