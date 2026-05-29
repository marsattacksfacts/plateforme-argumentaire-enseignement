"use client";

import { useEffect, useRef, useState } from "react";

// ── TRACÉS GPX ─────────────────────────────────────────────────────────────

const TRACE_J1: [number, number][] = [
  [50.592580, 5.861104], [50.595435, 5.852475], [50.597115, 5.843460],
  [50.602935, 5.834511], [50.613100, 5.833085], [50.621561, 5.829529],
  [50.627432, 5.817931], [50.630898, 5.809227], [50.635831, 5.799091],
  [50.639393, 5.794122], [50.640309, 5.786100], [50.637832, 5.762320],
  [50.634982, 5.745288], [50.632466, 5.734238], [50.625047, 5.706262],
  [50.616984, 5.686349], [50.611573, 5.677691], [50.616451, 5.661240],
  [50.624412, 5.646470], [50.622045, 5.626702], [50.615214, 5.621465],
  [50.609603, 5.614213], [50.611154, 5.612289], [50.615083, 5.598919],
  [50.620851, 5.582673], [50.627590, 5.575856], [50.634703, 5.567662],
  [50.632281, 5.563784], [50.628629, 5.553649], [50.625357, 5.549832],
  [50.624987, 5.538380], [50.620775, 5.525557], [50.620571, 5.514879],
  [50.617485, 5.511619], [50.610054, 5.514136], [50.606683, 5.495514],
  [50.596641, 5.480689], [50.590478, 5.458498], [50.584077, 5.422926],
  [50.578571, 5.409004], [50.573807, 5.399380], [50.568508, 5.388587],
  [50.561237, 5.360439], [50.555456, 5.345514], [50.544818, 5.335708],
  [50.534845, 5.317744], [50.534929, 5.283487], [50.534830, 5.260238],
  [50.529592, 5.248972], [50.525247, 5.243584], [50.526529, 5.233093],
  [50.525693, 5.229781],
];

const TRACE_J2: [number, number][] = [
  [50.523751, 5.231206], [50.517493, 5.235594], [50.524128, 5.221603],
  [50.524275, 5.199392], [50.516237, 5.183160], [50.509525, 5.149107],
  [50.498974, 5.120757], [50.493275, 5.096887], [50.487463, 5.099271],
  [50.491840, 5.084746], [50.492990, 5.064573], [50.492591, 5.031349],
  [50.483774, 5.019698], [50.469450, 5.003953], [50.469337, 4.987399],
  [50.480051, 4.960752], [50.466908, 4.924976], [50.464391, 4.906444],
  [50.465499, 4.893198], [50.460786, 4.887240], [50.462361, 4.871814],
  [50.464966, 4.855660], [50.470870, 4.851799], [50.478105, 4.845195],
  [50.483184, 4.836371], [50.486343, 4.829326], [50.490887, 4.817962],
  [50.498425, 4.797980], [50.512593, 4.774796], [50.529996, 4.746381],
  [50.550471, 4.712578], [50.559751, 4.694289],
];

const TRACE_J3: [number, number][] = [
  [50.559751, 4.694289], [50.568714, 4.693244], [50.579760, 4.678910],
  [50.593969, 4.673697], [50.607445, 4.660519], [50.611548, 4.647890],
  [50.619940, 4.629961], [50.630859, 4.620536], [50.635188, 4.613860],
  [50.637440, 4.602088], [50.641883, 4.592124], [50.643744, 4.575705],
  [50.651499, 4.569092], [50.661538, 4.566870], [50.669424, 4.566785],
  [50.681454, 4.560817], [50.684092, 4.547829], [50.684807, 4.532442],
  [50.698709, 4.522230], [50.711433, 4.520861], [50.720936, 4.515916],
  [50.730005, 4.508052], [50.731645, 4.494710], [50.735901, 4.474639],
  [50.749023, 4.464039], [50.761258, 4.452417], [50.769089, 4.442942],
  [50.785317, 4.425893], [50.794008, 4.417841], [50.803107, 4.408724],
  [50.810944, 4.401002], [50.815811, 4.389997], [50.824274, 4.381564],
  [50.833300, 4.374560], [50.842382, 4.368650], [50.845200, 4.370142],
];

const TRACE: [number, number][] = [...TRACE_J1, ...TRACE_J2, ...TRACE_J3];

// ── HALTES ─────────────────────────────────────────────────────────────────
// Points extraits directement du GPX (coordonnées réelles)

const HALTES_PRINCIPALES_RAW = [
  { label: "Verviers", type: "Départ", lat: 50.592580, lng: 5.861104, variant: "depart" as const },
  { label: "Herve", type: "Halte", lat: 50.614, lng: 5.793, variant: "simple" as const },
  { label: "Soumagne", type: "Halte", lat: 50.622, lng: 5.745, variant: "simple" as const },
  { label: "Chênée", type: "Halte", lat: 50.619, lng: 5.621, variant: "simple" as const },
  { label: "Liège", type: "Étape clé", lat: 50.640309, lng: 5.786100, variant: "etape" as const },
  { label: "Seraing", type: "Halte", lat: 50.603, lng: 5.507, variant: "simple" as const },
  { label: "Huy", type: "Nuit J1", lat: 50.523751, lng: 5.231206, variant: "nuit" as const },
  { label: "Andenne", type: "Halte", lat: 50.498974, lng: 5.120757, variant: "simple" as const },
  { label: "Jambes", type: "Halte", lat: 50.469450, lng: 5.003953, variant: "simple" as const },
  { label: "Namur", type: "Étape clé", lat: 50.465499, lng: 4.893198, variant: "etape" as const },
  { label: "St-Servais", type: "Halte", lat: 50.483184, lng: 4.836371, variant: "simple" as const },
  { label: "Gembloux", type: "Nuit J2", lat: 50.559751, lng: 4.694289, variant: "nuit" as const },
  { label: "Mont-St-Guib.", type: "Halte", lat: 50.607445, lng: 4.660519, variant: "simple" as const },
  { label: "Court-St-Ét.", type: "Halte", lat: 50.635188, lng: 4.613860, variant: "simple" as const },
  { label: "Ottignies", type: "Halte", lat: 50.681454, lng: 4.560817, variant: "simple" as const },
  { label: "Rixensart", type: "Halte", lat: 50.735901, lng: 4.474639, variant: "simple" as const },
  { label: "Etterbeek", type: "Halte", lat: 50.824274, lng: 4.381564, variant: "simple" as const },
  { label: "Bruxelles", type: "Arrivée", lat: 50.845200, lng: 4.370142, variant: "arrivee" as const },
];

// Recaler les haltes sur le tracé GPX
const HALTES_PRINCIPALES = HALTES_PRINCIPALES_RAW.map(h => {
  const [lat, lng] = findClosestPointOnTrace(h.lat, h.lng, TRACE);
  return { ...h, lat, lng };
});

// Plus de HALTES_SIMPLES séparées : tout est dans HALTES_PRINCIPALES

// ── CONFIG CARTE ───────────────────────────────────────────────────────────

const CARTE_CONFIG = {
  opacity: 0.01,
  offsetX: -300,
  offsetY: 100,
  scale: 3,
  src: "/carte_belgique.png",
};

// ── HELPERS ─────────────────────────────────────────────────────────────────

function findClosestPointOnTrace(
  lat: number, lng: number, trace: [number, number][]
): [number, number] {
  let best: [number, number] = trace[0];
  let bestDist = Infinity;
  for (const [tlat, tlng] of trace) {
    const d = (tlat - lat) ** 2 + (tlng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = [tlat, tlng];
    }
  }
  return best;
}

function projectPoint(
  lat: number, lng: number,
  minLat: number, maxLat: number,
  minLng: number, maxLng: number,
  width: number, height: number, padding: number
): [number, number] {
  const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
  const y = height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
  return [x, y];
}

function lerpAngle(current: number, target: number, factor: number): number {
  let diff = target - current;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return current + diff * factor;
}

// ── COMPOSANT ───────────────────────────────────────────────────────────────

export default function CartePeriple() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0]);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [progress, setProgress] = useState(0);
  const angleRef = useRef(0);
  const posRef = useRef<[number, number]>([0, 0]);

  const lats = TRACE.map(([lat]) => lat);
  const lngs = TRACE.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const padding = dimensions.width < 500 ? 25 : 60;

  const points = TRACE.map(([lat, lng]) =>
    projectPoint(lat, lng, minLat, maxLat, minLng, maxLng, dimensions.width, dimensions.height, padding)
  );

  const pathD = points.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = points[i - 1];
    const cpx1 = px + (x - px) * 0.35;
    const cpy1 = py;
    const cpx2 = x - (x - px) * 0.35;
    const cpy2 = y;
    return `${d} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x} ${y}`;
  }, "");

  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const pathLengthRef = useRef(0);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      pathLengthRef.current = len;
      setPathLength(len);
    }
  }, [dimensions]);

  // Animation fluide + linéaire
  useEffect(() => {
    if (!pathRef.current || pathLength === 0) return;

    const duration = 50000;
    const startTime = Date.now();
    let raf: number;

    const animate = () => {
      const len = pathLengthRef.current;
      if (len === 0 || !pathRef.current) {
        raf = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - startTime;
      const t = (elapsed % duration) / duration;
      setProgress(t);

      const dist = t * len;
      const pt = pathRef.current!.getPointAtLength(dist);

      const [prevX, prevY] = posRef.current;
      const smoothX = prevX + (pt.x - prevX) * 0.3;
      const smoothY = prevY + (pt.y - prevY) * 0.3;
      posRef.current = [smoothX, smoothY];
      setCurrentPos([smoothX, smoothY]);

      const lookAhead = 10;
      const ptAhead = pathRef.current!.getPointAtLength(Math.min(dist + lookAhead, len));
      const rawAngle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);

      let orientedAngle = rawAngle;
      if (Math.abs(rawAngle) > 90) {
        orientedAngle = rawAngle + 180;
      }

      angleRef.current = lerpAngle(angleRef.current, orientedAngle, 0.2);
      setCurrentAngle(angleRef.current);

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [pathLength]); 

  // Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setDimensions({ width: w, height: w < 500 ? Math.max(280, w * 0.7) : Math.max(380, w * 0.45) });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const labelOffset = 20;

  return (
    <div className="bg-[#F5F0E8] px-4 md:px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-[10px] uppercase tracking-widest text-[#C0440E] mb-3">La carte du périple</p>
        <h2 className="font-serif text-3xl font-bold text-[#1C1917] mb-6">
          Verviers → Bruxelles en 3 jours
        </h2>

        <div
          ref={containerRef}
          className="relative border-2 border-[#D4C8B8] overflow-hidden"
          style={{ backgroundColor: "#FBF6ED" }}
        >
          {/* Carte ancienne */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              opacity: CARTE_CONFIG.opacity,
              transform: `translate(${CARTE_CONFIG.offsetX}px, ${CARTE_CONFIG.offsetY}px) scale(${CARTE_CONFIG.scale})`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={CARTE_CONFIG.src}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: "grayscale(0.3) sepia(0.5)" }}
            />
          </div>

          {/* Texture grain */}
          <div
            className="absolute inset-0 pointer-events-none z-[1]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            }}
          />

          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="block relative z-10"
            style={{ backgroundColor: "transparent" }}
          >
            {/* Tracé pointillé */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="#C0440E"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              strokeLinecap="round"
              opacity="0.5"
            />

            {/* Tracé parcouru */}
            {pathLength > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#C0440E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${progress * pathLength} ${pathLength}`}
                opacity="1"
              />
            )}

            {/* Toutes les haltes */}
            {HALTES_PRINCIPALES.map((h) => {
              const [px, py] = projectPoint(h.lat, h.lng, minLat, maxLat, minLng, maxLng, dimensions.width, dimensions.height, padding);
              const isRight = px < dimensions.width * 0.55;
              const lx = isRight ? px + labelOffset : px - labelOffset;
              const ta = isRight ? "start" : "end";

              // Style selon variant
              const isSimple = h.variant === "simple";
              const isNuit = h.variant === "nuit";
              const isArrivee = h.variant === "arrivee";
              const isEtape = h.variant === "etape";
              const isDepart = h.variant === "depart";

              if (isSimple) {
                return (
                  <g key={h.label}>
                    <circle cx={px} cy={py} r="3" fill="#1C1917" opacity="0.45" />
                    <text x={lx} y={py + 4} textAnchor={ta} fill="#6B6459" fontFamily="Space Grotesk, sans-serif" fontSize="8">{h.label}</text>
                  </g>
                );
              }

              const r = isNuit || isArrivee ? 7 : 5;
              const fill = isNuit ? "#E8B43A" : isArrivee ? "#1C1917" : "#C0440E";
              const stroke = isNuit ? "#1C1917" : "#FBF6ED";

              return (
                <g key={h.label}>
                  <line x1={px} y1={py} x2={isRight ? px + labelOffset - 5 : px - labelOffset + 5} y2={py - labelOffset * 0.5} stroke="#6B6459" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.4" />
                  <circle cx={px} cy={py} r={r} fill={fill} stroke={stroke} strokeWidth="2" />
                  {isNuit && <text x={px} y={py + 0.5} textAnchor="middle" fontSize="7" fill="#1C1917" fontWeight="bold">🌙</text>}
                  {isDepart && <text x={px} y={py + 0.5} textAnchor="middle" fontSize="7" fill="#FBF6ED" fontWeight="bold">D</text>}
                  {isArrivee && <text x={px} y={py + 0.5} textAnchor="middle" fontSize="7" fill="#FBF6ED" fontWeight="bold">A</text>}
                  <text x={lx} y={py - labelOffset * 0.5 + 5} textAnchor={ta} fill="#1C1917" fontFamily="Space Grotesk, sans-serif" fontSize="13" fontWeight="bold">{h.label}</text>
                  <text x={lx} y={py - labelOffset * 0.5 + 19} textAnchor={ta} fill="#6B6459" fontFamily="Space Grotesk, sans-serif" fontSize="9" letterSpacing="0.05em">{h.type}</text>
                </g>
              );
            })}

            {/* Vélo */}
            {currentPos[0] > 0 && currentPos[1] > 0 && (
              <g transform={`translate(${currentPos[0]}, ${currentPos[1]}) rotate(${currentAngle})`}>
                <ellipse cx="2" cy="14" rx="16" ry="4" fill="rgba(0,0,0,0.1)" />
                <g transform="scale(0.9)">
                  {/* Roues */}
                  <circle cx="-14" cy="0" r="11" fill="none" stroke="#1C1917" strokeWidth="1.5" />
                  <circle cx="-14" cy="0" r="2" fill="#1C1917" />
                  <circle cx="14" cy="0" r="11" fill="none" stroke="#1C1917" strokeWidth="1.5" />
                  <circle cx="14" cy="0" r="2" fill="#1C1917" />
                  {/* Cadre */}
                  <line x1="-14" y1="0" x2="0" y2="-10" stroke="#C0440E" strokeWidth="2.5" />
                  <line x1="0" y1="-10" x2="14" y2="0" stroke="#C0440E" strokeWidth="2.5" />
                  <line x1="-14" y1="0" x2="0" y2="0" stroke="#C0440E" strokeWidth="2.5" />
                  <line x1="0" y1="0" x2="0" y2="-10" stroke="#C0440E" strokeWidth="2.5" />
                  {/* Guidon */}
                  <line x1="14" y1="0" x2="17" y2="-8" stroke="#1C1917" strokeWidth="2" />
                  <line x1="13" y1="-8" x2="21" y2="-8" stroke="#1C1917" strokeWidth="2" strokeLinecap="round" />
                  {/* Selle */}
                  <line x1="-5" y1="-10" x2="5" y2="-10" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
                  {/* Pédalier */}
                  <circle cx="0" cy="0" r="4" fill="#1C1917" />
                  {/* Facteur */}
                  <circle cx="0" cy="-15" r="5" fill="#C0440E" />
                  <line x1="0" y1="-10" x2="0" y2="-15" stroke="#1C1917" strokeWidth="2.5" />
                  {/* Casquette */}
                  <ellipse cx="0" cy="-20" rx="7" ry="2.5" fill="#1C1917" />
                  {/* Sacoche */}
                  <rect x="3" y="-18" width="10" height="7" rx="1.5" fill="#C0440E" opacity="0.85" />
                </g>
              </g>
            )}
          </svg>

          {/* Légende */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-4 text-[10px] font-medium text-[#6B6459] bg-[#FBF6ED]/90 px-3 py-1.5 z-20">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#C0440E] border border-[#FBF6ED] inline-block"></span> Étape clé</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#E8B43A] border border-[#1C1917] inline-block"></span> Nuit</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1C1917] opacity-50 inline-block"></span> Halte</span>
          </div>
        </div>
      </div>
    </div>
  );
}