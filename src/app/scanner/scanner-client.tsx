"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, ScanLine, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ScanResult = {
  ok: boolean;
  message?: string;
  reason?: string;
  remaining_entries?: number;
  holder_first_name?: string;
  holder_last_name?: string;
};

export function ScannerClient({
  parties,
}: {
  parties: { id: string; title: string; status: string }[];
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [token, setToken] = useState("");
  const [partyId, setPartyId] = useState(parties[0]?.id ?? "");
  const [requestedEntries, setRequestedEntries] = useState(1);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [cameraMessage, setCameraMessage] = useState<string | null>(null);

  /** Release all media stream tracks from the video element */
  const releaseMediaTracks = useCallback(() => {
    const video = videoRef.current;
    if (video?.srcObject && video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      releaseMediaTracks();
    };
  }, [releaseMediaTracks]);

  async function startCamera() {
    if (!videoRef.current || cameraState === "running") {
      return;
    }

    setCameraState("starting");
    setCameraMessage(null);

    try {
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (scanResult) => {
        const text = scanResult?.getText();

        if (!text) {
          return;
        }

        setToken(text.replace(/^PARTY_TICKET:/, ""));
        setCameraMessage("QR okundu. Girişi onaylayabilirsin.");
        controlsRef.current?.stop();
        controlsRef.current = null;
        releaseMediaTracks();
        setCameraState("idle");

        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(80);
        }
      });
      setCameraState("running");
    } catch (error) {
      setCameraState("error");
      setCameraMessage(error instanceof Error ? error.message : "Kamera başlatılamadı.");
    }
  }

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    releaseMediaTracks();
    setCameraState("idle");
  }

  async function scan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, partyId, requestedEntries }),
    });
    const payload = await response.json();
    setResult(payload);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(payload.ok ? 120 : [80, 40, 80]);
    }
    setIsLoading(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold text-white">QR Okut</h1>
      <p className="mt-2 text-zinc-400">Kapıda kullanım için büyük, hızlı ve manuel token destekli başlangıç ekranı.</p>
      <Card className="mt-6">
        <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black">
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
          {cameraState !== "running" && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 text-zinc-400">
              <div className="text-center">
                <ScanLine className="mx-auto mb-3" size={46} />
                Kamera hazır.
              </div>
            </div>
          )}
          {cameraState === "running" && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="h-48 w-48 rounded-xl border-2 border-fuchsia-400/60" />
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Button onClick={startCamera} variant="secondary" disabled={cameraState === "starting" || cameraState === "running"}>
            <Camera size={18} /> Kamerayı Aç
          </Button>
          <Button onClick={stopCamera} variant="ghost" disabled={cameraState !== "running"}>
            <Square size={18} /> Durdur
          </Button>
        </div>
        {cameraMessage && (
          <p className={cameraState === "error" ? "mt-3 rounded-md bg-red-500/10 p-3 text-sm text-red-200" : "mt-3 rounded-md bg-teal-500/10 p-3 text-sm text-teal-200"}>
            {cameraMessage}
          </p>
        )}
        <form className="mt-6 space-y-4" onSubmit={scan}>
          <select className="h-12 w-full rounded-md border border-white/10 bg-[#1c1c26] px-3 text-white outline-none focus:border-fuchsia-400" value={partyId} onChange={(event) => setPartyId(event.target.value)} required>
            <option value="">Parti seç</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.title} ({party.status})
              </option>
            ))}
          </select>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <input className="h-12 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" value={token} onChange={(event) => setToken(event.target.value)} placeholder="PARTY_TICKET token veya düz token" required />
            <input className="h-12 w-full rounded-md border border-white/10 bg-white/10 px-3 text-white outline-none focus:border-fuchsia-400" type="number" min={1} value={requestedEntries} onChange={(event) => setRequestedEntries(Number(event.target.value))} />
          </div>
          <Button className="h-14 w-full text-base" type="submit" disabled={isLoading}>
            Girişi Onayla
          </Button>
        </form>
      </Card>
      {result && (
        <Card className={result.ok ? "mt-5 border-teal-400/40" : "mt-5 border-red-400/40"}>
          <p className={result.ok ? "text-xl font-bold text-teal-200" : "text-xl font-bold text-red-200"}>
            {result.message ?? (result.ok ? "Giriş onaylandı." : "Geçersiz bilet.")}
          </p>
          {result.holder_first_name && (
            <p className="mt-2 text-zinc-300">{result.holder_first_name} {result.holder_last_name}</p>
          )}
          {typeof result.remaining_entries === "number" && (
            <p className="mt-2 text-zinc-400">Kalan hak: {result.remaining_entries}</p>
          )}
        </Card>
      )}
    </div>
  );
}
