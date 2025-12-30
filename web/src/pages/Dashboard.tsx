import React, { useState } from "react";
import StatisticsKehadiran from "../components/StatisticsKehadiran";
import StatisticsRMT from "../components/StatisticsRMT";
import StatisticsPointsModule from "../components/StatisticsPoints";
import "./Dashboard.css";

type ModuleType = "kehadiran" | "rmt" | "sahsiah" | "disiplin";

function Dashboard() {
  const [activeModule, setActiveModule] = useState<ModuleType>("kehadiran");

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Papan Pemuka</h1>
        <p>Ringkasan statistik harian</p>
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

      {/* Module Content */}
      <div className="module-content">
        {activeModule === "kehadiran" && <StatisticsKehadiran />}
        {activeModule === "rmt" && <StatisticsRMT />}
        {activeModule === "sahsiah" && <StatisticsPointsModule moduleType="sahsiah" />}
        {activeModule === "disiplin" && <StatisticsPointsModule moduleType="disiplin" />}
      </div>
    </div>
  );
}

export default Dashboard;
