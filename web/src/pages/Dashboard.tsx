import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StatisticsKehadiran from "../components/StatisticsKehadiran";
import StatisticsRMT from "../components/StatisticsRMT";
import StatisticsPointsModule from "../components/StatisticsPoints";
import "./Dashboard.css";

type ModuleType = "kehadiran" | "rmt" | "sahsiah" | "disiplin";

function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleType>("kehadiran");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([]);

  // Refs for each module
  const moduleRefs = {
    kehadiran: useRef<HTMLDivElement>(null),
    rmt: useRef<HTMLDivElement>(null),
    sahsiah: useRef<HTMLDivElement>(null),
    disiplin: useRef<HTMLDivElement>(null),
  };

  const toggleModuleSelection = (mod: ModuleType) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleExport = async () => {
    if (selectedModules.length === 0) {
      alert("Sila pilih sekurang-kurangnya satu modul untuk eksport.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < selectedModules.length; i++) {
      const mod = selectedModules[i];
      const element = moduleRefs[mod].current;

      if (!element) continue;

      // Temporarily make the module visible offscreen if hidden
      const originalDisplay = element.style.display;
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.display = "block";

      // Capture the element as a canvas
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Restore original style
      element.style.display = originalDisplay;
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
    }

    pdf.save("dashboard_statistics.pdf");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="page-title">Papan Pemuka</h1>
        <p>Ringkasan statistik harian</p>
        <button onClick={() => setExportModalOpen(true)}>Export PDF</button>
      </div>

      {/* Module Selector */}
      <div className="module-selector">
        {(["kehadiran", "rmt", "sahsiah", "disiplin"] as ModuleType[]).map((mod) => (
          <button
            key={mod}
            className={`module-btn ${activeModule === mod ? "active" : ""}`}
            onClick={() => setActiveModule(mod)}
          >
            {mod.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="export-modal">
          <h3>Pilih Modul Untuk Eksport</h3>
          {(["kehadiran", "rmt", "sahsiah", "disiplin"] as ModuleType[]).map((mod) => (
            <label key={mod} style={{ display: "block", marginBottom: "5px" }}>
              <input
                type="checkbox"
                checked={selectedModules.includes(mod)}
                onChange={() => toggleModuleSelection(mod)}
              />
              {mod.toUpperCase()}
            </label>
          ))}
          <button onClick={handleExport}>Eksport ke PDF</button>
          <button onClick={() => setExportModalOpen(false)}>Tutup</button>
        </div>
      )}

      {/* Module Content */}
      <div className="module-content">
        <div ref={moduleRefs.kehadiran} style={{ display: activeModule === "kehadiran" ? "block" : "none" }}>
          <StatisticsKehadiran />
        </div>
        <div ref={moduleRefs.rmt} style={{ display: activeModule === "rmt" ? "block" : "none" }}>
          <StatisticsRMT />
        </div>
        <div ref={moduleRefs.sahsiah} style={{ display: activeModule === "sahsiah" ? "block" : "none" }}>
          <StatisticsPointsModule moduleType="sahsiah" />
        </div>
        <div ref={moduleRefs.disiplin} style={{ display: activeModule === "disiplin" ? "block" : "none" }}>
          <StatisticsPointsModule moduleType="discipline" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
