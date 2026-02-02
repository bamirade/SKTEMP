import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { seedLocalSurveys } from "@shared/seedMockData";

// Seed mock data for frontend-only mode when backend is not available
if (typeof window !== "undefined") seedLocalSurveys();

createRoot(document.getElementById("root")!).render(<App />);
