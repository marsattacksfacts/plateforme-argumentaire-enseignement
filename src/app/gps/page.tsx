"use client";

import { useEffect, useRef, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GPS_UI_KEY ?? "";

type Status = "idle" | "running" | "error" | "denied";

export default function GpsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [lastCoords, setLastCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [sendCount, setSendCount] = useState(0);
  const [key, setKey] = useState(API_KEY);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef = useRef<number | null>(null);
  const latestCoords = useRef<{ lat: number; lng: number } | null>(null);

  // Envoi de la position vers l'API route
  const send = async (lat: number, lng: number) => {
    try {
      const url = `/api/location?lat=${lat}&lng=${lng}&key=${encodeURIComponent(key)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLastSent(new Date().toLocaleTimeString("fr-BE"));
      setLastCoords({ lat, lng });
      setSendCount((c) => c + 1);
    } catch (e) {
      setErrorMsg("Erreur d'envoi : " + (e as Error).message);
      setStatus("error");
    }
  };

  const start = () => {
    if (!navigator.geolocation) {
      setErrorMsg("La géolocalisation n'est pas supportée par ce navigateur.");
      setStatus("error");
      return;
    }
    setStatus("running");
    setErrorMsg("");

    // Watcher GPS continu pour avoir des coords fraîches
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestCoords.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMsg("Permission de localisation refusée.");
        } else {
          setErrorMsg("Erreur GPS : " + err.message);
          setStatus("error");
        }
        stop();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Envoi toutes les 30 secondes
    intervalRef.current = setInterval(async () => {
      if (!latestCoords.current) return;
      await send(latestCoords.current.lat, latestCoords.current.lng);
    }, 30_000);

    // Premier envoi immédiat
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        latestCoords.current = coords;
        await send(coords.lat, coords.lng);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    setStatus("idle");
  };

  // Nettoyage au démontage
  useEffect(() => () => stop(), []);

  // Empêcher la mise en veille de l'écran (Wake Lock API)
  useEffect(() => {
    if (status !== "running") return;
    let wakeLock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } }).wakeLock.request("screen");
        }
      } catch { /* non bloquant */ }
    };
    acquire();
    return () => { wakeLock?.release(); };
  }, [status]);

  const isRunning = status === "running";

  return (
    <main className="min-h-screen bg-[#1C1917] text-[#F5F0E8] flex flex-col items-center justify-center px-6 py-12">

      <div className="w-full max-w-sm space-y-8">

        {/* En-tête */}
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-[#C0440E] mb-2">Facteurs à bicyclette</p>
          <h1 className="font-serif text-2xl font-black">📍 Envoi GPS</h1>
          <p className="text-xs text-[#F5F0E8]/50 mt-1">Toutes les 30 secondes · Garde l&apos;écran allumé</p>
        </div>

        {/* Champ clé API (si non injecté via env) */}
        {!API_KEY && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#F5F0E8]/50 mb-2">Clé d&apos;accès</p>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Ta clé secrète"
              disabled={isRunning}
              className="w-full bg-white/10 border border-white/15 px-4 py-3 text-sm text-[#F5F0E8] placeholder:text-white/30 focus:outline-none focus:border-[#C0440E] rounded-none"
            />
          </div>
        )}

        {/* Statut visuel */}
        <div className={`border p-6 text-center transition-all ${
          isRunning
            ? "border-green-500/50 bg-green-500/5"
            : status === "error" || status === "denied"
            ? "border-red-500/50 bg-red-500/5"
            : "border-white/10 bg-white/5"
        }`}>
          {isRunning ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-400">Envoi actif</span>
              </div>
              {lastCoords && (
                <p className="text-xs text-[#F5F0E8]/60 font-mono mb-1">
                  {lastCoords.lat.toFixed(5)}, {lastCoords.lng.toFixed(5)}
                </p>
              )}
              {lastSent && (
                <p className="text-xs text-[#F5F0E8]/40">
                  Dernier envoi : {lastSent} ({sendCount} total)
                </p>
              )}
            </>
          ) : status === "error" || status === "denied" ? (
            <p className="text-sm text-red-400">{errorMsg || "Une erreur s'est produite."}</p>
          ) : (
            <p className="text-sm text-[#F5F0E8]/40">En attente de démarrage…</p>
          )}
        </div>

        {/* Bouton principal */}
        {!isRunning ? (
          <button
            onClick={start}
            disabled={!key}
            className="w-full bg-[#C0440E] text-white font-medium py-4 text-sm tracking-wide hover:bg-[#8A2E06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Démarrer l&apos;envoi GPS
          </button>
        ) : (
          <button
            onClick={stop}
            className="w-full bg-white/10 border border-white/20 text-[#F5F0E8] font-medium py-4 text-sm tracking-wide hover:bg-white/15 transition-colors"
          >
            Arrêter
          </button>
        )}

        {/* Instructions */}
        <div className="text-xs text-[#F5F0E8]/30 space-y-1 border-t border-white/10 pt-4">
          <p>→ Garde cette page ouverte en premier plan</p>
          <p>→ Désactive la mise en veille automatique dans tes réglages</p>
          <p>→ Active la localisation précise (GPS, pas Wi-Fi uniquement)</p>
        </div>

      </div>
    </main>
  );
}