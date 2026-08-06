import { Routes, Route } from "react-router-dom";
import Sidebar from "./layout/Sidebar.jsx";
import MobileNav from "./layout/MobileNav.jsx";
import SilkBackground from "./components/SilkBackground.jsx";

import Overview from "./pages/Overview.jsx";
import Architecture from "./pages/Architecture.jsx";
import Models from "./pages/Models.jsx";
import Documents from "./pages/Documents.jsx";
import Memory from "./pages/Memory.jsx";
import Stack from "./pages/Stack.jsx";
import Downloads from "./pages/Downloads.jsx";
import OpenSource from "./pages/OpenSource.jsx";
import Faq from "./pages/Faq.jsx";

export default function App() {
  return (
    <>
      <SilkBackground />
      <Sidebar />
      <MobileNav />
      <main className="nx-shell">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/models" element={<Models />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="/stack" element={<Stack />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/open-source" element={<OpenSource />} />
          <Route path="/faq" element={<Faq />} />
        </Routes>
      </main>
    </>
  );
}
