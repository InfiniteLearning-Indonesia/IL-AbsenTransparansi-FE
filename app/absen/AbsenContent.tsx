"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Loader2,
    User,
    GraduationCap,
    Building2,
    BookOpen,
    UserCheck,
    Clock,
    FileWarning,
    Megaphone,
    ExternalLink,
    Shield,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { endpoints } from "@/lib/api";
import { motion } from "framer-motion";

type AttendanceRecord = {
    _id: string;
    whatsapp: string;
    month: string;
    batch: string;
    institusi: string;
    jenjang: string;
    lastFetchedAt: string;
    mentor: string;
    name: string;
    programIL: string;
    attendance: Record<string, string>;
    summary: {
        hadir: number;
        izin: number;
        alpha: number;
        persen: number;
    };
    __v?: number;
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
    }),
};

export default function AbsenContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const whatsapp = searchParams.get("whatsapp");

    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    // Announcement popup state
    const [announcementOpen, setAnnouncementOpen] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startCountdown = useCallback(() => {
        setCountdown(5);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        startCountdown();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startCountdown]);

    const handleOpenAnnouncement = () => {
        setAnnouncementOpen(true);
        startCountdown();
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!whatsapp) return;

            try {
                const res = await fetch(endpoints.checkAttendance, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ whatsapp }),
                });

                const result = await res.json();

                if (result.success && result.data.length > 0) {
                    setData(result.data);
                    const latestMonth = result.data[result.data.length - 1].month;
                    setSelectedMonth(latestMonth);
                } else {
                    setError(result.message || "Data tidak ditemukan.");
                }
            } catch {
                setError("Terjadi kesalahan saat mengambil data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [whatsapp]);

    const currentData = data.find((d) => d.month === selectedMonth);

    // ─── Error / Edge States ───
    if (!whatsapp) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FFFBFF] p-4">
                <div className="bg-red-50 p-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-[#191919] font-medium">Nomor WhatsApp tidak ditemukan.</p>
                <Button onClick={() => router.push("/")} className="bg-[#8a3dff] text-white shadow-md hover:bg-[#6b1fe0]">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FFFBFF]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 border-4 border-[#e8e0f0]" />
                        <Loader2 className="h-12 w-12 animate-spin text-[#8a3dff] absolute inset-0" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-[#191919]">Memuat Data</p>
                        <p className="text-xs text-[#6b6b6b]">Mengambil riwayat kehadiran Anda...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !currentData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FFFBFF] p-4">
                <div className="bg-red-50 p-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-[#191919]">{error || "Data tidak tersedia."}</p>
                    <p className="text-xs text-[#6b6b6b] mt-1">Pastikan nomor WhatsApp Anda benar dan terdaftar di sistem.</p>
                </div>
                <Button onClick={() => router.push("/")} className="bg-[#8a3dff] text-white shadow-md hover:bg-[#6b1fe0]">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Cari Kembali
                </Button>
            </div>
        );
    }

    // ─── Main Content ───
    const attendanceEntries = Object.entries(currentData.attendance).sort(
        (a, b) => parseInt(a[0]) - parseInt(b[0])
    );

    const profileFields = [
        { icon: Building2, label: "Institusi", value: currentData.institusi },
        { icon: BookOpen, label: "Program", value: currentData.programIL },
        { icon: GraduationCap, label: "Jenjang", value: currentData.jenjang },
        { icon: UserCheck, label: "Mentor", value: `Kak ${currentData.mentor}` },
    ];

    // Recalculate percentage: hadir / total ALL days (including belumDiisi)
    const totalAllDays = attendanceEntries.length;
    const recalcPersen = totalAllDays > 0 ? parseFloat(((currentData.summary.hadir / totalAllDays) * 100).toFixed(2)) : 0;

    const statCards = [
        { label: "Hadir", value: currentData.summary.hadir, unit: "Sesi", color: "emerald" },
        { label: "Izin / Sakit", value: currentData.summary.izin, unit: "Sesi", color: "amber" },
        { label: "Alpha", value: currentData.summary.alpha, unit: "Sesi", color: "red" },
        { label: "Persentase", value: `${recalcPersen}%`, unit: `Kehadiran bulan ${currentData.month}`, color: "purple" },
    ];

    const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
        emerald: {
            bg: "bg-emerald-50 border-emerald-100",
            text: "text-emerald-700",
            badge: "text-emerald-600",
        },
        amber: {
            bg: "bg-amber-50 border-amber-100",
            text: "text-amber-700",
            badge: "text-amber-600",
        },
        red: {
            bg: "bg-red-50 border-red-100",
            text: "text-red-700",
            badge: "text-red-600",
        },
        purple: {
            bg: "bg-[#f3edff] border-[#e4d6ff]",
            text: "text-[#8a3dff]",
            badge: "text-[#8a3dff]",
        },
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase().trim();
        if (s === "null") {
            return (
                <span className="inline-flex items-center gap-1.5 bg-[#f5f3f7] px-2.5 py-1 text-xs font-semibold text-[#6b6b6b]">
                    <Clock className="h-3 w-3" />
                    Kelas belum dimulai
                </span>
            );
        }
        if (s.includes("hadir")) {
            return (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Hadir
                </span>
            );
        }
        if (s === "izin" || s.includes("sakit")) {
            return (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <AlertCircle className="h-3 w-3" />
                    {status}
                </span>
            );
        }
        if (s === "alpha") {
            return (
                <span className="inline-flex items-center gap-1.5 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <XCircle className="h-3 w-3" />
                    Alpha
                </span>
            );
        }
        return <span className="text-xs text-[#6b6b6b]">{status}</span>;
    };

    return (
        <div className="min-h-screen bg-[#FFFBFF] font-[var(--font-sans)] relative">
            {/* Announcement Alert Dialog */}
            <AlertDialog open={announcementOpen}>
                <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 border border-[#e8e0f0] shadow-2xl">
                    {/* Gradient Header */}
                    <div className="bg-[#8a3dff] px-6 py-5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[size:16px_16px] opacity-30" />
                        <div className="relative flex items-center gap-3">
                            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                                <Megaphone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-white tracking-tight font-[var(--font-heading)]">📢 Pengumuman Penting</h2>
                                <p className="text-white/80 text-xs font-medium mt-0.5">Ketentuan Absensi — Wajib Dibaca</p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto max-h-[55vh] px-6 py-5">
                        <AlertDialogHeader className="p-0">
                            <AlertDialogTitle className="sr-only">Pengumuman Ketentuan Absensi</AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div className="space-y-4 text-left">
                                    <p className="text-sm font-medium text-[#191919] leading-relaxed">
                                        Dear teman-teman warga <span className="font-bold">Infinite Learning</span>,
                                        <br />Terkait absensi, berikut kami informasikan kembali ketentuannya:
                                    </p>

                                    <div className="space-y-2.5">
                                        {[
                                            <>Batas keterlambatan adalah <strong>30 menit setelah ice-breaking selesai</strong>.</>,
                                            <>Jika ice-breaking selesai pukul 09.30, maka sistem absensi akan berjalan dari <strong>09.00–10.00</strong>. Untuk sesi malam: <strong>19.00–20.00</strong>.</>,
                                            <>Melewati pukul <strong>10.00</strong> (atau <strong>20.00</strong> untuk sesi malam) akan <strong className="text-red-600">dianggap Alpha</strong>, kecuali sudah melakukan konfirmasi sebelumnya (sebelum pukul 09.00 / 19.00 atau pada hari sebelumnya).</>,
                                            <>Jika keterlambatan tidak terhindarkan, wajib menginformasikan <strong>sebelum pukul 09.00 / 19.00</strong> bahwa Anda akan terlambat.</>,
                                            <>Selalu lakukan <strong>screenshot waktu kedatangan ke kelas</strong> sebagai bukti, terutama jika berpotensi terlambat.</>,
                                            <>Jika Anda hadir penuh tetapi terdeteksi Alpha oleh sistem AI, maka pengajuan banding akan <strong className="text-emerald-600">otomatis diterima (auto accept)</strong> dan status diubah menjadi hadir.</>,
                                            <>Jika masuk setelah sesi absensi berakhir dan tidak mengabari sebelumnya, maka <strong className="text-red-600">pengajuan banding berpotensi ditolak</strong>.</>,
                                            <>Sistem akan mencatat durasi peserta saat bergabung di Zoom untuk mencegah kecurangan dan sebagai bahan pertimbangan pengajuan banding; jika durasi <strong className="text-emerald-600">lebih dari 30 menit</strong> maka banding dapat diterima, sedangkan jika <strong className="text-red-600">kurang dari 30 menit</strong> maka dianggap kurang kuat.</>,
                                            <>Untuk perizinan (ketidakhadiran), wajib mengisi <strong>form izin sebelum pukul 09.00 / 19.00 atau sebelum kelas dimulai</strong>.</>,
                                            <>Form yang diisi setelah kelas dimulai, di tengah sesi, atau setelah jam absensi berakhir akan dianggap <strong className="text-red-600">tidak valid (auto Alpha)</strong> dan tidak dapat diajukan banding.</>,
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="shrink-0 mt-0.5 h-6 w-6 bg-[#f3edff] flex items-center justify-center text-[11px] font-extrabold text-[#8a3dff] group-hover:bg-[#8a3dff] group-hover:text-white transition-all duration-300">
                                                    {i + 1}
                                                </span>
                                                <p className="text-[13px] leading-relaxed text-[#4a4a4a]">
                                                    {item}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Note box */}
                                    <div className="bg-[#f3edff] border border-[#e4d6ff] p-3.5 flex gap-3 items-start mt-4">
                                        <Shield className="h-5 w-5 text-[#8a3dff] shrink-0 mt-0.5" />
                                        <p className="text-[12px] leading-relaxed text-[#5a1dbf]">
                                            Mohon dipahami bahwa sistem AI tetap memiliki kemungkinan kesalahan. Oleh karena itu, <strong>selalu siapkan bukti kehadiran</strong> dan hadirlah dengan penuh komitmen.
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-[#191919] pt-1">
                                        Terima kasih atas perhatian dan kerja samanya. 👌
                                    </p>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>

                    {/* Footer with countdown */}
                    <div className="px-6 pb-5 pt-2">
                        {/* Countdown progress bar */}
                        {countdown > 0 && (
                            <div className="mb-3">
                                <div className="h-1.5 w-full bg-[#f5f3f7] overflow-hidden">
                                    <div
                                        className="h-full bg-[#8a3dff] transition-all duration-1000 ease-linear"
                                        style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <AlertDialogFooter className="p-0">
                            <AlertDialogAction
                                disabled={countdown > 0}
                                onClick={() => setAnnouncementOpen(false)}
                                className={`w-full h-11 text-sm font-bold shadow-lg transition-all duration-300 ${countdown > 0
                                    ? "bg-[#f5f3f7] text-[#999] cursor-not-allowed shadow-none"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/25 hover:shadow-xl"
                                    }`}
                            >
                                {countdown > 0 ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Mohon dibaca terlebih dahulu ({countdown}s)
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Mengerti ✅
                                    </span>
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(138,61,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(138,61,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8a3dff]/5 blur-[80px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-[#ffcd29]/8 blur-[80px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                className="relative mx-auto max-w-4xl p-4 sm:p-6 space-y-6"
            >
                {/* Header */}
                <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/")}
                            className="h-9 w-9 border-[#e8e0f0] hover:bg-[#f5f3f7] hover:border-[#8a3dff] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#191919] font-[var(--font-heading)]">
                                Detail <span className="accent-underline">Absensi</span>
                            </h1>
                            <p className="text-[11px] text-[#6b6b6b] hidden sm:block">
                                Riwayat kehadiran mentee
                            </p>
                        </div>
                    </div>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px] h-9 text-sm border-[#e8e0f0] bg-white hover:border-[#8a3dff] transition-colors">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#8a3dff]" />
                            <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            {data.map((record) => (
                                <SelectItem key={record.month} value={record.month}>
                                    {record.month} 2026
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Profile Banner */}
                <motion.div variants={fadeUp} custom={1} className="border border-[#e8e0f0] bg-white shadow-sm overflow-hidden card-hover">
                    {/* Gradient Header */}
                    <div className="bg-[#8a3dff] p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%)] bg-[size:20px_20px] opacity-50" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="h-14 w-14 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                {currentData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate font-[var(--font-heading)]">
                                    {currentData.name}
                                </h2>
                                <p className="text-sm text-white/80 font-medium mt-0.5">
                                    {currentData.programIL}
                                </p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <Badge className="bg-white/20 hover:bg-white/30 border-0 text-white text-[10px]">
                                        {currentData.batch || "Batch 10"}
                                    </Badge>
                                    <span className="text-[10px] text-white/60 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Sync: {new Date(currentData.lastFetchedAt).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profileFields.map((f) => (
                            <div key={f.label} className="flex items-center gap-3 p-3 bg-[#f5f3f7]/50 border border-[#e8e0f0] hover:border-[#8a3dff] transition-colors duration-300">
                                <div className="bg-[#f3edff] p-2 shrink-0">
                                    <f.icon className="h-4 w-4 text-[#8a3dff]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[#999]">{f.label}</p>
                                    <p className="text-sm font-bold text-[#191919] truncate">{f.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stat Cards */}
                <motion.div variants={fadeUp} custom={2} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map((s) => {
                        const c = colorMap[s.color];
                        return (
                            <div
                                key={s.label}
                                className={`border p-4 text-center ${c.bg} hover:shadow-md transition-all duration-300 card-hover`}
                            >
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${c.badge} mb-1`}>{s.label}</p>
                                <p className={`text-2xl sm:text-3xl font-black ${c.text}`}>{s.value}</p>
                                <p className={`text-[10px] ${c.badge} opacity-70 mt-0.5`}>{s.unit}</p>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Action Buttons: Announcement + Form Perizinan */}
                <motion.div variants={fadeUp} custom={3} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={handleOpenAnnouncement}
                        className="flex items-center gap-3 bg-[#ffcd29]/10 px-4 py-3.5 text-[#191919] border border-[#ffcd29]/30 hover:border-[#ffcd29] hover:shadow-lg hover:shadow-[#ffcd29]/10 transition-all duration-300 cursor-pointer group"
                    >
                        <span className="inline-flex items-center justify-center bg-[#ffcd29] p-2 shadow-md group-hover:scale-110 transition-all duration-300">
                            <Megaphone className="h-4 w-4 text-[#191919]" />
                        </span>
                        <div className="text-left">
                            <p className="text-xs font-bold">📢 Pengumuman Absensi</p>
                            <p className="text-[10px] font-medium text-[#6b6b6b] mt-0.5">Ketuk untuk membaca ketentuan</p>
                        </div>
                    </button>

                    <a
                        href="https://airtable.com/appoU770Y2bZLxCFL/shrrBhk9D26Cu3mpn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-[#f3edff] px-4 py-3.5 text-[#191919] border border-[#e4d6ff] hover:border-[#8a3dff] hover:shadow-lg hover:shadow-[#8a3dff]/10 transition-all duration-300 cursor-pointer group"
                    >
                        <span className="inline-flex items-center justify-center bg-[#8a3dff] p-2 shadow-md group-hover:scale-110 transition-all duration-300">
                            <ExternalLink className="h-4 w-4 text-white" />
                        </span>
                        <div className="text-left">
                            <p className="text-xs font-bold">📝 Form Perizinan</p>
                            <p className="text-[10px] font-medium text-[#6b6b6b] mt-0.5">Isi form izin ketidakhadiran (Ingat! Sebelum 09.00 / 19.00!)</p>
                        </div>
                    </a>
                </motion.div>

                <motion.div variants={fadeUp} custom={4} className="space-y-3">
                    <div className="flex items-center justify-center gap-2 bg-[#f3edff] px-4 py-2 text-[#5a1dbf] border border-[#e4d6ff]">
                        <Clock className="h-3.5 w-3.5" />
                        <p className="text-xs font-semibold">Absen diperbarui tiap jam 13.00 WIB di sesi pagi dan 22.00 WIB di sesi malam.</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 bg-red-50 px-4 py-2 text-red-700 border border-red-100">
                        <FileWarning className="h-3.5 w-3.5" />
                        <p className="text-xs font-semibold">Absen tidak sesuai? <span className="accent-underline">Ajukan banding</span> ke mentor personal kamu kak {currentData.mentor} <span className="accent-underline">dengan bukti!</span> </p>
                    </div>
                </motion.div>

                {/* Attendance Table */}
                <motion.div variants={fadeUp} custom={5}>
                    <Card className="border-[#e8e0f0] shadow-sm overflow-hidden card-hover">
                        <CardHeader className="border-b border-[#e8e0f0] bg-[#f5f3f7]/50 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-[#f3edff] p-2">
                                    <Calendar className="h-4 w-4 text-[#8a3dff]" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Riwayat Kehadiran</CardTitle>
                                    <p className="text-[11px] text-[#6b6b6b]">Bulan {selectedMonth} 2026</p>
                                </div>
                                <Badge variant="secondary" className="ml-auto text-[10px] bg-[#f3edff] text-[#8a3dff] border-0">
                                    {attendanceEntries.length} hari
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {attendanceEntries.length > 0 ? (
                                <div className="divide-y divide-[#e8e0f0]">
                                    {attendanceEntries.map(([date, status]) => (
                                        <div
                                            key={date}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-[#f5f3f7]/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#f5f3f7] flex items-center justify-center text-xs font-bold text-[#191919]">
                                                    {date}
                                                </div>
                                                <span className="text-sm text-[#6b6b6b] hidden sm:inline">
                                                    {selectedMonth} {date}, 2026
                                                </span>
                                            </div>
                                            {getStatusBadge(status)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <User className="h-10 w-10 text-[#ccc] mb-3" />
                                    <p className="text-sm text-[#6b6b6b]">
                                        Belum ada data absensi untuk bulan ini.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div variants={fadeUp} custom={6} className="text-center text-[11px] text-[#999] pb-4">
                    &copy; {new Date().getFullYear()} Infinite Learning Indonesia. All rights reserved.
                </motion.div>
            </motion.div>
        </div>
    );
}
