import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import RiskMap from "./components/RiskMap";
import RiskGauge from "./components/RiskGauge";
import CctvAnalyzer from "./components/CctvAnalyzer";
import {
  hotspots,
  citizenReports,
  alerts,
  weeklyTrend,
  collectionStats,
} from "./data/mockData";
import type { RiskLevel } from "./data/mockData";

type Panel = "hotspots" | "cctv" | "reports" | "analytics";

export default function App() {
  const [layers, setLayers] = useState({ high: true, medium: true, low: true });
  const [selectedId, setSelectedId] = useState<string | null>("Z001");
  const [activePanel, setActivePanel] = useState<Panel>("hotspots");
  const [clock, setClock] = useState(new Date());
  const [cctvRisk, setCctvRisk] = useState<{ score: number; zone: string } | null>(null);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const selectedHotspot = hotspots.find((h) => h.id === selectedId);
  const highCount = hotspots.filter((h) => h.riskLevel === "high").length;
  const medCount = hotspots.filter((h) => h.riskLevel === "medium").length;
  const lowCount = hotspots.filter((h) => h.riskLevel === "low").length;

  const toggleLayer = (key: keyof typeof layers) =>
    setLayers((p) => ({ ...p, [key]: !p[key] }));

  const dispatch = (id: string) =>
    setDispatchedIds((p) => new Set([...p, id]));

  const riskColor = (level: RiskLevel) =>
    level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#22c55e";

  const trendIcon = (t: string) =>
    t === "rising" ? "↑" : t === "falling" ? "↓" : "→";

  const NavBtn = ({
    id,
    label,
    icon,
  }: {
    id: Panel;
    label: string;
    icon: string;
  }) => (
    <button
      onClick={() => setActivePanel(id)}
      style={{
        background: activePanel === id ? "var(--surface-3)" : "transparent",
        border: `1px solid ${activePanel === id ? "var(--border-light)" : "transparent"}`,
        color: activePanel === id ? "var(--text-primary)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.62rem",
        letterSpacing: "0.08em",
        padding: "5px 10px",
        borderRadius: 4,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        whiteSpace: "nowrap" as const,
        transition: "all 0.15s",
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "44px 1fr",
        gridTemplateColumns: "264px 1fr 300px",
        height: "100%",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <header
        style={{
          gridColumn: "1 / -1",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 16,
        }}
      >
        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#2563eb" opacity="0.9" />
            <path d="M2 17l10 5 10-5" stroke="#2563eb" strokeWidth="1.5" fill="none" />
            <path d="M2 12l10 5 10-5" stroke="#2563eb" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              letterSpacing: "0.05em",
            }}
          >
            WASTEGUARD AI
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              borderLeft: "1px solid var(--border)",
              paddingLeft: 10,
            }}
          >
            MUNICIPAL INTELLIGENCE PLATFORM
          </span>
        </div>

        {/* Alert banner */}
        {!alertDismissed && alerts[0] && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--risk-high-bg)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 4,
              padding: "3px 10px",
              maxWidth: 440,
            }}
          >
            <span className="pulse-high" style={{ color: "#ef4444", fontSize: "0.6rem" }}>
              ◉
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "#ef4444",
                flex: 1,
              }}
            >
              ALERT: {alerts[0].zone} — {alerts[0].message}
            </span>
            <button
              onClick={() => setAlertDismissed(true)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
            >
              ×
            </button>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Status pills */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusPill color="#ef4444" count={highCount} label="HIGH" />
          <StatusPill color="#f59e0b" count={medCount} label="MED" />
          <StatusPill color="#22c55e" count={lowCount} label="LOW" />
        </div>

        {/* Clock + officer */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--text-secondary)",
            borderLeft: "1px solid var(--border)",
            paddingLeft: 12,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "flex-end",
          }}
        >
          <span style={{ color: "var(--text-primary)", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
            {clock.toLocaleTimeString("en-ZA", { hour12: false })}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.55rem" }}>
            OFF. J. DLAMINI · SECTOR CMD
          </span>
        </div>
      </header>

      {/* ── LEFT SIDEBAR ───────────────────────────────── */}
      <aside
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Layer toggles */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
          <span className="panel-header">Map Layers</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
            {(["high", "medium", "low"] as const).map((lv) => (
              <LayerToggle
                key={lv}
                label={lv.toUpperCase()}
                color={riskColor(lv)}
                active={layers[lv]}
                count={lv === "high" ? highCount : lv === "medium" ? medCount : lowCount}
                onToggle={() => toggleLayer(lv)}
              />
            ))}
          </div>
        </div>

        {/* Risk summary gauges */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
          <span className="panel-header">System Risk Overview</span>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
            <RiskGauge score={87} label="ZONE AVG" size={72} />
            <RiskGauge score={94} label="PEAK" size={72} />
            <RiskGauge score={63} label="TREND" size={72} />
          </div>
        </div>

        {/* Collection stats */}
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
          <span className="panel-header">Today's Collections</span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
              marginTop: 8,
            }}
          >
            <StatTile label="Scheduled" value={collectionStats.scheduled} color="#7d8fa8" />
            <StatTile label="Completed" value={collectionStats.completed} color="#22c55e" />
            <StatTile label="Missed" value={collectionStats.missed} color="#ef4444" />
            <StatTile label="In Progress" value={collectionStats.inProgress} color="#f59e0b" />
          </div>
        </div>

        {/* Quick alerts */}
        <div style={{ padding: "10px 12px", flex: 1, overflow: "auto" }}>
          <span className="panel-header">Active Alerts</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 8 }}>
            {alerts.map((a) => (
              <div
                key={a.id}
                style={{
                  background: "var(--surface-2)",
                  border: `1px solid ${riskColor(a.level)}33`,
                  borderRadius: 4,
                  padding: "6px 8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: riskColor(a.level),
                      letterSpacing: "0.08em",
                    }}
                  >
                    {a.level.toUpperCase()} · {a.time}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {a.message}
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {a.zone}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAP CENTER ─────────────────────────────────── */}
      <main style={{ position: "relative", overflow: "hidden" }}>
        <RiskMap
          hotspots={hotspots}
          layerToggles={layers}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {/* Selected zone overlay */}
        {selectedHotspot && (
          <div
            className="animate-fade-up"
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              right: 16,
              background: "rgba(15,20,32,0.95)",
              borderTop: `2px solid ${riskColor(selectedHotspot.riskLevel)}`,
              borderRight: `1px solid ${riskColor(selectedHotspot.riskLevel)}55`,
              borderBottom: `1px solid ${riskColor(selectedHotspot.riskLevel)}55`,
              borderLeft: `1px solid ${riskColor(selectedHotspot.riskLevel)}55`,
              borderRadius: 6,
              padding: "10px 14px",
              backdropFilter: "blur(8px)",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 10,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  className="data-value"
                  style={{ fontSize: "0.58rem", color: riskColor(selectedHotspot.riskLevel), letterSpacing: "0.1em" }}
                >
                  ZONE {selectedHotspot.id}
                </span>
                <span
                  className={`badge-${selectedHotspot.riskLevel}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    padding: "1px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.1em",
                  }}
                >
                  {selectedHotspot.riskLevel.toUpperCase()} RISK
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: riskColor(selectedHotspot.riskLevel) }}>
                  {trendIcon(selectedHotspot.trend)} {selectedHotspot.trend}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  margin: "0 0 2px",
                }}
              >
                {selectedHotspot.name}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  color: "var(--text-muted)",
                  margin: "0 0 6px",
                }}
              >
                {selectedHotspot.district} · Last report {selectedHotspot.lastReport} · {selectedHotspot.reportCount} total reports
              </p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {selectedHotspot.factors.map((f) => (
                  <span
                    key={f}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      color: "var(--text-secondary)",
                      background: "var(--surface-3)",
                      border: "1px solid var(--border)",
                      padding: "1px 6px",
                      borderRadius: 3,
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", justifyContent: "center" }}>
              <RiskGauge score={selectedHotspot.riskScore} size={64} />
              {dispatchedIds.has(selectedHotspot.id) ? (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    color: "#22c55e",
                    padding: "3px 10px",
                    border: "1px solid rgba(34,197,94,0.4)",
                    borderRadius: 4,
                    background: "rgba(34,197,94,0.08)",
                  }}
                >
                  ✓ DISPATCHED
                </span>
              ) : (
                <button
                  onClick={() => dispatch(selectedHotspot.id)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    color: "#fff",
                    background: selectedHotspot.riskLevel === "high" ? "#ef4444" : "#f59e0b",
                    border: "none",
                    borderRadius: 4,
                    padding: "5px 12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.85")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
                >
                  DISPATCH CREW →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Coordinate readout */}
        {selectedHotspot && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(10,13,18,0.8)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "4px 10px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.58rem",
              color: "var(--text-muted)",
              backdropFilter: "blur(4px)",
            }}
          >
            {selectedHotspot.lat.toFixed(4)}°S · {selectedHotspot.lng.toFixed(4)}°E
          </div>
        )}
      </main>

      {/* ── RIGHT PANEL ────────────────────────────────── */}
      <aside
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Panel nav */}
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <NavBtn id="hotspots" label="HOTSPOTS" icon="⬡" />
          <NavBtn id="cctv" label="CCTV" icon="◈" />
          <NavBtn id="reports" label="REPORTS" icon="◎" />
          <NavBtn id="analytics" label="TRENDS" icon="◻" />
        </div>

        {/* Panel content */}
        <div style={{ flex: 1, overflow: "auto", padding: "10px 12px" }}>
          {activePanel === "hotspots" && (
            <HotspotsPanel
              hotspots={hotspots}
              selectedId={selectedId}
              onSelect={setSelectedId}
              dispatched={dispatchedIds}
              onDispatch={dispatch}
              riskColor={riskColor}
              trendIcon={trendIcon}
            />
          )}
          {activePanel === "cctv" && (
            <CctvPanel
              onRiskUpdate={(score, zone) => setCctvRisk({ score, zone })}
              cctvRisk={cctvRisk}
            />
          )}
          {activePanel === "reports" && (
            <ReportsPanel reports={citizenReports} riskColor={riskColor} />
          )}
          {activePanel === "analytics" && (
            <AnalyticsPanel trend={weeklyTrend} />
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function StatusPill({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 4,
        background: color + "18",
        border: `1px solid ${color}44`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color, fontWeight: 500 }}>
        {count}
      </span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

function LayerToggle({
  label,
  color,
  active,
  count,
  onToggle,
}: {
  label: string;
  color: string;
  active: boolean;
  count: number;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: active ? color + "14" : "var(--surface-2)",
        border: `1px solid ${active ? color + "55" : "var(--border)"}`,
        borderRadius: 4,
        padding: "5px 8px",
        cursor: "pointer",
        transition: "all 0.15s",
        width: "100%",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: active ? color : "var(--text-muted)",
          flexShrink: 0,
          boxShadow: active ? `0 0 6px ${color}88` : "none",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: active ? color : "var(--text-muted)",
          flex: 1,
          textAlign: "left",
          letterSpacing: "0.08em",
        }}
      >
        {label} RISK
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          color: active ? color : "var(--text-muted)",
          opacity: 0.7,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "6px 8px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.1rem",
          fontWeight: 500,
          color,
          display: "block",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.6rem",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function HotspotsPanel({ hotspots, selectedId, onSelect, dispatched, onDispatch, riskColor, trendIcon }: any) {
  const top5 = [...hotspots].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="panel-header" style={{ marginBottom: 4 }}>Top 5 Risk Zones</span>
      {top5.map((h: any, i: number) => (
        <div
          key={h.id}
          onClick={() => onSelect(h.id)}
          style={{
            background: selectedId === h.id ? "var(--surface-3)" : "var(--surface-2)",
            borderTop: `1px solid ${selectedId === h.id ? riskColor(h.riskLevel) + "66" : "var(--border)"}`,
            borderRight: `1px solid ${selectedId === h.id ? riskColor(h.riskLevel) + "66" : "var(--border)"}`,
            borderBottom: `1px solid ${selectedId === h.id ? riskColor(h.riskLevel) + "66" : "var(--border)"}`,
            borderLeft: `3px solid ${riskColor(h.riskLevel)}`,
            borderRadius: 4,
            padding: "8px 10px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
                  #{i + 1} · {h.id}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: riskColor(h.riskLevel) }}>
                  {trendIcon(h.trend)}
                </span>
              </div>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 500, color: "var(--text-primary)", display: "block", lineHeight: 1.3 }}>
                {h.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
                {h.district}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 500, color: riskColor(h.riskLevel), lineHeight: 1 }}>
                {h.riskScore}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.52rem", color: "var(--text-muted)" }}>/ 100</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
              {h.reportCount} reports · {h.lastReport}
            </span>
            {dispatched.has(h.id) ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "1px 6px", borderRadius: 3 }}>
                ✓ DISPATCHED
              </span>
            ) : h.riskLevel !== "low" ? (
              <button
                onClick={(e) => { e.stopPropagation(); onDispatch(h.id); }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color: riskColor(h.riskLevel),
                  background: riskColor(h.riskLevel) + "18",
                  border: `1px solid ${riskColor(h.riskLevel)}44`,
                  borderRadius: 3,
                  padding: "1px 7px",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                DISPATCH
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function CctvPanel({ onRiskUpdate, cctvRisk }: { onRiskUpdate: any; cctvRisk: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <span className="panel-header">CCTV / Image Analysis</span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
          Upload a CCTV snapshot for AI waste detection. Mock YOLO model overlays bounding boxes and updates zone risk score.
        </p>
      </div>
      <CctvAnalyzer onRiskUpdate={onRiskUpdate} />
      {cctvRisk && (
        <div
          className="animate-fade-up"
          style={{
            background: "var(--risk-high-bg)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 4,
            padding: "8px 10px",
          }}
        >
          <span className="panel-header" style={{ marginBottom: 4, display: "block" }}>
            Risk Score Updated
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--text-secondary)" }}>
              {cctvRisk.zone}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "#ef4444", fontWeight: 500 }}>
              {cctvRisk.score}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsPanel({ reports, riskColor }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span className="panel-header">Citizen Reports</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "#22c55e" }}>
          ● LIVE
        </span>
      </div>
      {reports.map((r: any) => (
        <div
          key={r.id}
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            borderLeft: `3px solid ${riskColor(r.severity)}`,
            borderRadius: 4,
            padding: "8px 10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: riskColor(r.severity), letterSpacing: "0.08em" }}>
              {r.id} · {r.time}
            </span>
            {r.verified && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "0 5px", borderRadius: 3 }}>
                ✓ VERIFIED
              </span>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--text-primary)", margin: "0 0 3px", lineHeight: 1.4 }}>
            {r.description}
          </p>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>
            📍 {r.location}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel({ trend }: { trend: typeof weeklyTrend }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <span className="panel-header">7-Day Hotspot Trend</span>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={trend} barCategoryGap="28%" margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="day"
            tick={{ fill: "#4a5a72", fontSize: 9, fontFamily: "'DM Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4a5a72", fontSize: 9, fontFamily: "'DM Mono', monospace" }}
            axisLine={false}
            tickLine={false}
          />
          <ReTooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              color: "var(--text-primary)",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="high" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
          <Bar dataKey="low" stackId="a" fill="#22c55e" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {[["#ef4444", "High"], ["#f59e0b", "Medium"], ["#22c55e", "Low"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)" }}>{l}</span>
          </div>
        ))}
      </div>

      {/* AI Prediction summary */}
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: "10px 12px",
          marginTop: 4,
        }}
      >
        <span className="panel-header" style={{ display: "block", marginBottom: 6 }}>AI Prediction — Next 24h</span>
        {[
          { zone: "Industrial Belt S7", prob: 96, delta: "+4%" },
          { zone: "Khumalo Corridor", prob: 83, delta: "+11%" },
          { zone: "N12 Underpass", prob: 77, delta: "stable" },
          { zone: "Rivergate Market", prob: 61, delta: "-3%" },
        ].map((p) => (
          <div
            key={p.zone}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 5,
            }}
          >
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.zone}
            </span>
            <div style={{ width: 60, height: 3, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden" }}>
              <div
                style={{
                  width: `${p.prob}%`,
                  height: "100%",
                  background: p.prob >= 80 ? "#ef4444" : p.prob >= 60 ? "#f59e0b" : "#22c55e",
                  borderRadius: 2,
                  transition: "width 1s ease",
                }}
              />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: p.prob >= 80 ? "#ef4444" : "#f59e0b", minWidth: 28, textAlign: "right" }}>
              {p.prob}%
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>
              {p.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
