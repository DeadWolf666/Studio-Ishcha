import { Analytics } from "@vercel/analytics/react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Map from "./components/Map";
import ProjectDetail from "./pages/ProjectDetail";
import "./index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/project/:id"
          element={
            <>
              <ProjectDetail />
              <Analytics />
            </>
          }
        />
        <Route
          path="*"
          element={
            <>
              <Map />
              <Analytics />
            </>
          }
        />
      </Routes>
    </Router>
  );
}
