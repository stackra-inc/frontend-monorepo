import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import ConfigPage from "@/pages/config";
import LoggerPage from "@/pages/logger";
import ContainerPage from "@/pages/container";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<ConfigPage />} path="/config" />
      <Route element={<LoggerPage />} path="/logger" />
      <Route element={<ContainerPage />} path="/container" />
    </Routes>
  );
}

export default App;
