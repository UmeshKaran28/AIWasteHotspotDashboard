import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Hotspot } from "../data/mockData";

interface Props {
  hotspots: Hotspot[];
  layerToggles: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function FlyTo({ hotspot }: { hotspot: Hotspot | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!hotspot) return;
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) return;
    map.flyTo([hotspot.lat, hotspot.lng], 14, { duration: 1.2 });
  }, [hotspot, map]);
  return null;
}

export default function RiskMap({ hotspots, layerToggles, selectedId, onSelect }: Props) {
  const selectedHotspot = hotspots.find((h) => h.id === selectedId);

  const riskColor = (level: string) => {
    if (level === "high") return "#ef4444";
    if (level === "medium") return "#f59e0b";
    return "#22c55e";
  };

  const visible = hotspots.filter((h) => layerToggles[h.riskLevel]);

  return (
    <MapContainer
      center={[-26.18, 27.98]}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
      />
      <FlyTo hotspot={selectedHotspot} />
      {visible.map((h) => {
        const color = riskColor(h.riskLevel);
        const isSelected = h.id === selectedId;
        const radius = h.riskLevel === "high" ? 800 : h.riskLevel === "medium" ? 560 : 380;

        return (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lng]}
            radius={isSelected ? 18 : 13}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: isSelected ? 0.45 : 0.22,
              weight: isSelected ? 2.5 : 1.5,
              opacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(h.id) }}
          >
            <Tooltip
              permanent={false}
              direction="top"
              offset={[0, -8]}
              className="risk-tooltip"
            >
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem" }}>
                {h.name} — {h.riskScore}/100
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}
      {/* Outer pulse rings for high-risk */}
      {visible
        .filter((h) => h.riskLevel === "high")
        .map((h) => (
          <CircleMarker
            key={`pulse-${h.id}`}
            center={[h.lat, h.lng]}
            radius={22}
            pathOptions={{
              color: "#ef4444",
              fillColor: "transparent",
              fillOpacity: 0,
              weight: 1,
              opacity: 0.3,
            }}
          />
        ))}
    </MapContainer>
  );
}
