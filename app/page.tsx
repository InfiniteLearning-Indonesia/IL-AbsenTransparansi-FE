"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ClipboardCheck,
  Info,
  Loader2,
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp.trim()) {
      setLoading(true);
      router.push(`/absen?whatsapp=${encodeURIComponent(whatsapp)}`);
    }
  };

  const features = [
    {
      icon: Clock,
      title: "Real-time",
      desc: "Data kehadiran diperbarui secara berkala",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: BarChart3,
      title: "Statistik",
      desc: "Ringkasan persentase kehadiran otomatis",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      icon: Shield,
      title: "Aman",
      desc: "Akses data hanya dengan nomor terdaftar",
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-950/30",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-zinc-950 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[100px] dark:bg-blue-900/15 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] dark:bg-indigo-900/15 animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-violet-200/20 rounded-full blur-[80px] dark:bg-violet-900/10" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      </div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Main Card */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white/90 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/30 transition-all">
          {/* Header */}
          <div className="space-y-4 text-center mb-8">
            <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <ClipboardCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                Portal Absensi
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed max-w-sm mx-auto">
                Pantau kehadiran dan performa belajar Anda secara real-time. Masukkan nomor WhatsApp terdaftar untuk memulai.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Infinite Learning Indonesia — Batch 10</span>
              <Sparkles className="h-3 w-3 text-amber-500" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCheck} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="whatsapp" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Nomor WhatsApp
              </Label>
              <div className="relative">
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="h-12 pl-4 text-base rounded-xl border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50 transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Info className="h-3 w-3 shrink-0" />
                Pastikan nomor WA aktif dan sesuai dengan data pendaftaran.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 w-full text-sm font-bold tracking-wide rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Lihat Riwayat Absensi
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-200/80 bg-white/80 backdrop-blur-sm p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/80 hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className={`inline-flex p-2 rounded-lg ${f.bg} mb-2`}>
                <f.icon className={`h-4 w-4 ${f.color}`} />
              </div>
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{f.title}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 leading-tight">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-600">
          &copy; {new Date().getFullYear()} Infinite Learning Indonesia. All rights reserved.
        </div>
      </div>
    </div>
  );
}
