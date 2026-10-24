import { useRef, useState } from "react";

interface Detection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

// Mock YOLO-style detections
const MOCK_DETECTIONS: Detection[] = [
  { label: "Illegal Dump — Construction Debris", confidence: 0.94, x: 0.08, y: 0.38, w: 0.38, h: 0.42, color: "#ef4444" },
  { label: "Plastic Waste Cluster", confidence: 0.87, x: 0.54, y: 0.55, w: 0.28, h: 0.22, color: "#f59e0b" },
  { label: "Suspicious Vehicle Activity", confidence: 0.71, x: 0.62, y: 0.12, w: 0.24, h: 0.28, color: "#f59e0b" },
];

interface Props {
  onRiskUpdate: (score: number, zone: string) => void;
}

export default function CctvAnalyzer({ onRiskUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setDone(false);
    setDetections([]);
    setAnalyzing(true);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const det = MOCK_DETECTIONS.slice(0, 2 + Math.floor(Math.random() * 2));
        det.forEach((d) => {
          const x = d.x * img.naturalWidth;
          const y = d.y * img.naturalHeight;
          const w = d.w * img.naturalWidth;
          const h = d.h * img.naturalHeight;

          // Bounding box
          ctx.strokeStyle = d.color;
          ctx.lineWidth = Math.max(2, img.naturalWidth / 400);
          ctx.strokeRect(x, y, w, h);

          // Label background
          ctx.fillStyle = d.color + "cc";
          const fontSize = Math.max(10, img.naturalWidth / 60);
          ctx.font = `${fontSize}px 'DM Mono', monospace`;
          const textW = ctx.measureText(d.label).width + 8;
          const labelH = fontSize + 6;
          ctx.fillRect(x - 1, y - labelH - 1, textW, labelH + 2);

          // Label text
          ctx.fillStyle = "#ffffff";
          ctx.fillText(d.label, x + 3, y - 5);

          // Confidence chip
          const conf = `${Math.round(d.confidence * 100)}%`;
          ctx.fillStyle = d.color;
          const cw = ctx.measureText(conf).width + 8;
          ctx.fillRect(x + w - cw, y, cw, fontSize + 4);
          ctx.fillStyle = "#fff";
          ctx.fillText(conf, x + w - cw + 4, y + fontSize);
        });

        setDetections(det);
        setAnalyzing(false);
        setDone(true);
        const score = det.some((d) => d.confidence > 0.9) ? 91 : 74;
        onRiskUpdate(score, "Camera Zone A-7");
      };
      img.src = url;
    }, 1800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload zone */}
      {!imgSrc && (
        <div
          className="upload-zone rounded flex flex-col items-center justify-center gap-2 cursor-pointer"
          style={{ height: 130, padding: "12px" }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.5 }}>
            Drop CCTV snapshot or click to upload
            <br />
            <span style={{ color: "var(--text-muted)" }}>JPEG · PNG · WebP supported</span>
          </span>
        </div>
      )}

      {/* Canvas result */}
      {imgSrc && (
        <div className="relative rounded overflow-hidden" style={{ background: "#0a0d12" }}>
          {analyzing && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
              style={{ background: "rgba(10,13,18,0.85)" }}
            >
              <div style={{ width: 32, height: 32, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "#2563eb", letterSpacing: "0.1em" }}>
                RUNNING YOLO ANALYSIS…
              </span>
            </div>
          )}
          <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 4 }} />
          {done && (
            <button
              className="absolute top-2 right-2 text-xs rounded px-2 py-0.5"
              style={{ background: "rgba(10,13,18,0.8)", border: "1px solid var(--border-light)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}
              onClick={() => { setImgSrc(null); setDone(false); setDetections([]); }}
            >
              CLEAR
            </button>
          )}
        </div>
      )}

      {/* Detection results */}
      {done && detections.length > 0 && (
        <div className="flex flex-col gap-1 animate-fade-up">
          <span className="panel-header" style={{ marginBottom: 4 }}>
            {detections.length} object{detections.length > 1 ? "s" : ""} detected
          </span>
          {detections.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded px-2 py-1.5"
              style={{ background: "var(--surface-2)", border: `1px solid ${d.color}33` }}
            >
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--text-primary)" }}>
                {d.label}
              </span>
              <span
                className="data-value"
                style={{ fontSize: "0.62rem", color: d.color, minWidth: 36, textAlign: "right" }}
              >
                {Math.round(d.confidence * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
