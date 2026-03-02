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
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBFF] p-4 font-[var(--font-sans)] relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(138,61,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(138,61,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Subtle accent blob */}
        <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] bg-[#8a3dff]/5 blur-[100px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[35%] h-[35%] bg-[#ffcd29]/8 blur-[100px]" />
      </div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Main Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="border border-[#e8e0f0] bg-white p-8 sm:p-10 shadow-sm card-hover"
        >
          {/* Header */}
          <div className="space-y-4 text-center mb-8">
            <motion.div variants={fadeUp} custom={1} className="inline-flex items-center justify-center p-3.5 bg-[#8a3dff] text-white shadow-lg shadow-[#8a3dff]/20">
              <ClipboardCheck className="h-7 w-7" />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#191919] font-[var(--font-heading)]">
                Portal <span className="accent-underline">Absensi</span>
              </h1>
              <p className="text-sm text-[#6b6b6b] mt-2 leading-relaxed max-w-sm mx-auto">
                Pantau kehadiran dan performa belajar Anda selama ini. Masukkan nomor WhatsApp terdaftar untuk memulai.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-[#ffcd29]" />
              <span className="text-[11px] font-medium text-[#8a3dff]">Infinite Learning Indonesia — Batch 10</span>
              <Sparkles className="h-3 w-3 text-[#ffcd29]" />
            </motion.div>
          </div>

          {/* Form */}
          <motion.form variants={fadeUp} custom={4} onSubmit={handleCheck} className="space-y-5">
            <div className="space-y-2.5">
              <Label htmlFor="whatsapp" className="text-sm font-semibold text-[#191919]">
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
                  className="h-12 pl-4 text-base border-[#e8e0f0] bg-[#f5f3f7]/50 transition-all focus:ring-2 focus:ring-[#8a3dff]/20 focus:border-[#8a3dff]"
                />
              </div>
              <p className="text-xs text-[#6b6b6b] flex items-center gap-1.5">
                <Info className="h-3 w-3 shrink-0" />
                Pastikan nomor WA aktif dan sesuai dengan data pendaftaran. Gunakan format 08-nomor-anda.
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 w-full text-sm font-bold tracking-wide bg-[#8a3dff] hover:bg-[#6b1fe0] text-white shadow-md shadow-[#8a3dff]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#8a3dff]/30 active:scale-[0.99]"
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
          </motion.form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={5}
          className="text-center text-[11px] text-[#6b6b6b]"
        >
          &copy; {new Date().getFullYear()} Infinite Learning Indonesia. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
}
