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
    AlertTriangle,
    Ban,
    Activity,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    sp1?: boolean;
    sp2?: boolean;
    sp3?: boolean;
    status?: string; // Active, Non-Active, Terminated
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

// ─── SP Letter Content ───
function getSPContent(spLevel: 1 | 2 | 3, name: string) {
    if (spLevel === 1) {
        return {
            title: "SURAT PERINGATAN 1 (SP1)",
            headerColor: "bg-amber-500",
            borderColor: "border-amber-400",
            iconColor: "text-amber-500",
            bgColor: "bg-amber-50",
            paragraphs: [
                <>Kepada Yth. <strong>{name}</strong>,</>,
                <>Melalui surat peringatan ini, kami sampaikan bahwa berdasarkan data kehadiran yang tercatat, Anda telah melakukan <strong>Alpha (tidak hadir tanpa keterangan) sebanyak 3 kali</strong> dalam periode bulan berjalan.</>,
                <>Sesuai dengan ketentuan yang berlaku di <strong>Infinite Learning Indonesia</strong>, kehadiran adalah salah satu komponen penilaian dan komitmen peserta terhadap program.</>,
                <>Dengan ini, kami memberikan <strong>Surat Peringatan Pertama (SP1)</strong> sebagai bentuk peringatan atas pelanggaran batas ketidakhadiran.</>,
                <>Kami berharap Anda dapat meningkatkan kedisiplinan dan komitmen dalam mengikuti kegiatan program ke depannya. Jika Alpha terus bertambah, <strong>sanksi yang lebih berat akan diterapkan sesuai ketentuan yang berlaku</strong>.</>,
            ],
        };
    }
    if (spLevel === 2) {
        return {
            title: "SURAT PERINGATAN 2 (SP2)",
            headerColor: "bg-orange-500",
            borderColor: "border-orange-400",
            iconColor: "text-orange-500",
            bgColor: "bg-orange-50",
            paragraphs: [
                <>Kepada Yth. <strong>{name}</strong>,</>,
                <>Menindaklanjuti Surat Peringatan Pertama (SP1) yang telah diberikan sebelumnya, berdasarkan data kehadiran tercatat bahwa Anda telah melakukan <strong>Alpha (tidak hadir tanpa keterangan) sebanyak 4 kali</strong> dalam periode bulan berjalan.</>,
                <>Hal ini menunjukkan bahwa peringatan sebelumnya belum mendapatkan perhatian yang serius dari Anda. Dengan ini, kami memberikan <strong>Surat Peringatan Kedua (SP2)</strong>.</>,
                <>Kami tekankan bahwa <strong>satu kali Alpha lagi akan mengakibatkan dikeluarkannya Surat Peringatan Ketiga (SP3) / Surat Pengeluaran dari program</strong>. Kami menyarankan Anda untuk segera menghubungi mentor personal dan berkomitmen penuh untuk tidak melakukan Alpha lagi.</>,
                <>Kesempatan Anda untuk tetap berada di program sangat terbatas. Kami berharap Anda mengambil langkah serius untuk memperbaiki kehadiran Anda.</>,
            ],
        };
    }
    // SP3
    return {
        title: "SURAT PERINGATAN 3 / SURAT PENGELUARAN",
        headerColor: "bg-red-600",
        borderColor: "border-red-500",
        iconColor: "text-red-600",
        bgColor: "bg-red-50",
        paragraphs: [
            <>Kepada Yth. <strong>{name}</strong>,</>,
            <>Menindaklanjuti Surat Peringatan Pertama (SP1) dan Surat Peringatan Kedua (SP2) yang telah diberikan sebelumnya, berdasarkan data kehadiran tercatat bahwa Anda telah melakukan <strong>Alpha (tidak hadir tanpa keterangan) sebanyak 5 kali atau lebih</strong> dalam periode bulan berjalan.</>,
            <>Dengan berat hati, kami sampaikan bahwa berdasarkan ketentuan yang berlaku, kami terpaksa menerbitkan <strong>Surat Peringatan Ketiga (SP3) yang sekaligus merupakan Surat Pengeluaran</strong> dari program Infinite Learning Indonesia.</>,
            <>Status Anda dalam program ini akan diubah menjadi <strong className="text-red-600">Terminated</strong>. Jika Anda merasa terdapat kekeliruan atau ingin mengajukan banding, segera hubungi <strong>mentor personal Anda</strong> dengan menyertakan bukti-bukti yang relevan.</>,
            <>Kami menyesalkan keputusan ini dan berharap hal ini menjadi pelajaran berharga untuk ke depannya.</>,
        ],
    };
}

// ─── Alpha Count Color Helper ───
function getAlphaInfo(alphaCount: number) {
    if (alphaCount <= 0) {
        return {
            bg: "bg-emerald-50 border-emerald-200",
            text: "text-emerald-700",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            message: `Anda belum pernah Alpha bulan ini. Pertahankan! 💪`,
        };
    }
    if (alphaCount === 1) {
        return {
            bg: "bg-indigo-50 border-indigo-200",
            text: "text-indigo-700",
            icon: <AlertCircle className="h-5 w-5 text-indigo-500" />,
            message: `Anda sudah Alpha sebanyak : ${alphaCount}x`,
        };
    }
    if (alphaCount === 2) {
        return {
            bg: "bg-yellow-50 border-yellow-300",
            text: "text-yellow-700",
            icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
            message: `Anda sudah Alpha sebanyak : ${alphaCount}x`,
        };
    }
    if (alphaCount === 3) {
        return {
            bg: "bg-amber-100 border-amber-400",
            text: "text-amber-800",
            icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
            message: `Anda sudah Alpha sebanyak : ${alphaCount}x — Batas SP1 tercapai!`,
        };
    }
    if (alphaCount === 4) {
        return {
            bg: "bg-red-100 border-red-400",
            text: "text-red-700",
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
            message: `Anda sudah Alpha sebanyak : ${alphaCount}x — Batas SP2 tercapai!`,
        };
    }
    // 5 or more
    return {
        bg: "bg-red-200 border-red-500",
        text: "text-red-900",
        icon: <Ban className="h-5 w-5 text-red-700" />,
        message: `Anda sudah Alpha sebanyak : ${alphaCount}x. Anda akan dikeluarkan dari program jika tidak menyegerakan aju banding ke mentor dan berkomitmen penuh untuk tetap lanjut tanpa Alpha 1x pun lagi kedepannya.`,
    };
}

// ─── Status Badge Component ───
function StatusBadge({ status }: { status?: string }) {
    const s = (status || "Active").toLowerCase().trim();
    if (s === "terminated") {
        return (
            <span className="inline-flex items-center gap-1.5 bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                <Ban className="h-3 w-3" /> Terminated
            </span>
        );
    }
    if (s === "non-active" || s === "nonactive" || s === "non active") {
        return (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 border border-gray-200">
                <XCircle className="h-3 w-3" /> Non-Active
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Active
        </span>
    );
}

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

    // SP popup state
    const [spPopupOpen, setSpPopupOpen] = useState(false);
    const [spAgreed, setSpAgreed] = useState(false);
    const [spCountdown, setSpCountdown] = useState(60);
    const spTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    const startSpCountdown = useCallback(() => {
        setSpCountdown(60);
        if (spTimerRef.current) clearInterval(spTimerRef.current);
        spTimerRef.current = setInterval(() => {
            setSpCountdown((prev) => {
                if (prev <= 1) {
                    if (spTimerRef.current) clearInterval(spTimerRef.current);
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
            if (spTimerRef.current) clearInterval(spTimerRef.current);
        };
    }, [startCountdown]);

    const handleOpenAnnouncement = () => {
        setAnnouncementOpen(true);
        startCountdown();
    };

    const openSpPopup = () => {
        setSpAgreed(false);
        setSpPopupOpen(true);
        startSpCountdown();
    };

    // When announcement is closed, check if SP popup should open
    const handleCloseAnnouncement = () => {
        setAnnouncementOpen(false);
        // Check if current mentee has any SP
        if (currentData && (currentData.sp1 || currentData.sp2 || currentData.sp3)) {
            openSpPopup();
        }
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
                    
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const currentRealMonth = monthNames[new Date().getMonth()];
                    const hasCurrentMonth = result.data.some((d: AttendanceRecord) => d.month === currentRealMonth);
                    
                    setSelectedMonth(hasCurrentMonth ? currentRealMonth : result.data[result.data.length - 1].month);
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

    // Determine SP level for current data
    const spLevel: 0 | 1 | 2 | 3 = currentData?.sp3 ? 3 : currentData?.sp2 ? 2 : currentData?.sp1 ? 1 : 0;

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

    // Alpha count info
    const alphaInfo = getAlphaInfo(currentData.summary.alpha);

    // SP Content (only if SP is present)
    const spContent = spLevel > 0 ? getSPContent(spLevel as 1 | 2 | 3, currentData.name) : null;

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
                                onClick={handleCloseAnnouncement}
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

            {/* SP Warning Popup */}
            {spContent && (
                <AlertDialog open={spPopupOpen}>
                    <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 border-2 border-[#e8e0f0] shadow-2xl">
                        {/* SP Header */}
                        <div className={`${spContent.headerColor} px-6 py-5 relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%)] bg-[size:16px_16px] opacity-40" />
                            <div className="relative flex items-center gap-3">
                                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-extrabold text-white tracking-tight font-[var(--font-heading)]">
                                        ⚠️ {spContent.title}
                                    </h2>
                                    <p className="text-white/80 text-xs font-medium mt-0.5">
                                        Infinite Learning Indonesia — Wajib Dibaca
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable SP Content */}
                        <div className="overflow-y-auto max-h-[50vh] px-6 py-5">
                            <AlertDialogHeader className="p-0">
                                <AlertDialogTitle className="sr-only">{spContent.title}</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-4 text-left">
                                        {spContent.paragraphs.map((para, i) => (
                                            <p key={i} className="text-sm leading-relaxed text-[#4a4a4a]">
                                                {para}
                                            </p>
                                        ))}

                                        {/* Aturan Box Inside SP */}
                                        <div className={`${spContent.bgColor} border ${spContent.borderColor} p-4 space-y-2 mt-4`}>
                                            <p className="text-xs font-bold text-[#191919] flex items-center gap-2">
                                                <Shield className="h-4 w-4" /> Ketentuan Sanksi Alpha:
                                            </p>
                                            <ul className="text-xs space-y-1 text-[#4a4a4a] ml-6 list-disc">
                                                <li>Alpha 3x dalam satu bulan → <strong>Surat Peringatan 1 (SP1)</strong></li>
                                                <li>Alpha 4x dalam satu bulan → <strong>Surat Peringatan 2 (SP2)</strong></li>
                                                <li>Alpha ke-5 dalam satu bulan → <strong>Surat Peringatan 3 (SP3) / Dikeluarkan dari program</strong></li>
                                            </ul>
                                        </div>

                                        <p className="text-sm font-semibold text-[#191919] pt-1">
                                            Hormat kami,<br />
                                            <span className="text-[#8a3dff]">Tim Infinite Learning Indonesia</span>
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                        </div>

                        {/* SP Footer with checkbox */}
                        <div className="px-6 pb-5 pt-2 space-y-3 border-t border-[#e8e0f0]">
                            {/* SP Countdown progress bar */}
                            {spCountdown > 0 && (
                                <div>
                                    <div className="h-1.5 w-full bg-[#f5f3f7] overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ease-linear ${spLevel === 3 ? "bg-red-500" : spLevel === 2 ? "bg-orange-500" : "bg-amber-500"}`}
                                            style={{ width: `${((60 - spCountdown) / 60) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-center text-[#999] mt-1.5 font-medium">
                                        Mohon baca dengan seksama — {Math.floor(spCountdown / 60)}:{String(spCountdown % 60).padStart(2, '0')} tersisa
                                    </p>
                                </div>
                            )}

                            <label className={`flex items-start gap-3 select-none group ${spCountdown > 0 ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}>
                                <input
                                    type="checkbox"
                                    checked={spAgreed}
                                    disabled={spCountdown > 0}
                                    onChange={(e) => setSpAgreed(e.target.checked)}
                                    className="mt-0.5 h-5 w-5 accent-[#8a3dff] cursor-pointer"
                                />
                                <span className="text-xs text-[#4a4a4a] leading-relaxed group-hover:text-[#191919] transition-colors">
                                    Saya sudah membaca dan memahami isi Surat Peringatan ini. Saya berkomitmen untuk memperbaiki kehadiran saya sesuai ketentuan yang berlaku.
                                </span>
                            </label>

                            <AlertDialogFooter className="p-0">
                                <AlertDialogAction
                                    disabled={spCountdown > 0 || !spAgreed}
                                    onClick={() => setSpPopupOpen(false)}
                                    className={`w-full h-11 text-sm font-bold shadow-lg transition-all duration-300 ${(spCountdown > 0 || !spAgreed)
                                        ? "bg-[#f5f3f7] text-[#999] cursor-not-allowed shadow-none"
                                        : "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25 hover:shadow-xl"
                                        }`}
                                >
                                    {spCountdown > 0 ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Mohon dibaca terlebih dahulu ({Math.floor(spCountdown / 60)}:{String(spCountdown % 60).padStart(2, '0')})
                                        </span>
                                    ) : !spAgreed ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            Centang persetujuan terlebih dahulu
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Saya Mengerti dan Setuju
                                        </span>
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            )}

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

                    {/* Profile Details + Status */}
                    <div className="p-5 sm:p-6 space-y-4">
                        {/* Status Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-[#8a3dff]" />
                                <span className="text-xs font-bold text-[#191919] uppercase tracking-wider">Status:</span>
                            </div>
                            <StatusBadge status={currentData.status} />
                            {spLevel > 0 && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border ${spLevel === 3
                                    ? "bg-red-100 text-red-700 border-red-300"
                                    : spLevel === 2
                                        ? "bg-orange-100 text-orange-700 border-orange-300"
                                        : "bg-amber-100 text-amber-700 border-amber-300"
                                    }`}>
                                    <AlertTriangle className="h-3 w-3" />
                                    {spLevel === 3 ? "SP3 / Pengeluaran" : `SP${spLevel}`}
                                </span>
                            )}
                        </div>

                        {/* SP Letter Button */}
                        {spLevel > 0 && (
                            <button
                                onClick={openSpPopup}
                                className={`w-full flex items-center gap-3 px-4 py-3 border text-left transition-all duration-300 cursor-pointer group hover:shadow-md ${
                                    spLevel === 3
                                        ? "bg-red-50 border-red-200 hover:border-red-400"
                                        : spLevel === 2
                                            ? "bg-orange-50 border-orange-200 hover:border-orange-400"
                                            : "bg-amber-50 border-amber-200 hover:border-amber-400"
                                }`}
                            >
                                <span className={`inline-flex items-center justify-center p-2 shadow-sm group-hover:scale-110 transition-all duration-300 ${
                                    spLevel === 3
                                        ? "bg-red-500"
                                        : spLevel === 2
                                            ? "bg-orange-500"
                                            : "bg-amber-500"
                                }`}>
                                    <AlertTriangle className="h-4 w-4 text-white" />
                                </span>
                                <div>
                                    <p className={`text-xs font-bold ${
                                        spLevel === 3 ? "text-red-700" : spLevel === 2 ? "text-orange-700" : "text-amber-700"
                                    }`}>
                                        📄 Lihat {spLevel === 3 ? "Surat Pengeluaran (SP3)" : `Surat Peringatan ${spLevel} (SP${spLevel})`}
                                    </p>
                                    <p className="text-[10px] font-medium text-[#6b6b6b] mt-0.5">Ketuk untuk membaca kembali surat peringatan Anda</p>
                                </div>
                            </button>
                        )}

                        {/* Profile Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    </div>
                </motion.div>

                {/* ─── TABS: Absen Bulanan & Performa Total ─── */}
                <Tabs defaultValue="absen" className="gap-0 space-y-4">
                    <TabsList className="w-full bg-[#f5f3f7] border border-[#e8e0f0] h-10">
                        <TabsTrigger value="absen" className="flex-1 text-xs font-bold data-[state=active]:bg-[#8a3dff] data-[state=active]:text-white">
                            📋 Absen Bulanan
                        </TabsTrigger>
                        <TabsTrigger value="performa" className="flex-1 text-xs font-bold data-[state=active]:bg-[#8a3dff] data-[state=active]:text-white">
                            📊 Performa Total
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── TAB 1: Absen Bulanan (existing content) ─── */}
                    <TabsContent value="absen" className="mt-0">
                        <motion.div initial="hidden" animate="visible" className="space-y-4">
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

                {/* Alpha Counter Box */}
                <motion.div variants={fadeUp} custom={3}>
                    <div className={`flex items-start gap-3 p-4 border-2 ${alphaInfo.bg} transition-all duration-300`}>
                        <div className="shrink-0 mt-0.5">{alphaInfo.icon}</div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${alphaInfo.text}`}>
                                {alphaInfo.message}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Aturan Alpha & SP Info Box */}
                <motion.div variants={fadeUp} custom={4}>
                    <div className="bg-[#f5f3f7] border border-[#e8e0f0] p-4 space-y-2">
                        <p className="text-xs font-bold text-[#191919] flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#8a3dff]" />
                            Aturan Sanksi Alpha per Bulan
                        </p>
                        <ul className="text-xs space-y-1.5 text-[#4a4a4a] ml-6">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-amber-500 shrink-0" />
                                Alpha 3x → <strong className="text-amber-600">Surat Peringatan 1 (SP1)</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-orange-500 shrink-0" />
                                Alpha 4x → <strong className="text-orange-600">Surat Peringatan 2 (SP2)</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-red-600 shrink-0" />
                                Alpha ke-5 → <strong className="text-red-600">SP3 / Dikeluarkan dari program</strong>
                            </li>
                        </ul>
                    </div>
                </motion.div>

                {/* Action Buttons: Announcement + Form Perizinan */}
                <motion.div variants={fadeUp} custom={5} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <motion.div variants={fadeUp} custom={6} className="space-y-3">
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
                <motion.div variants={fadeUp} custom={7}>
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
                        </motion.div>
                    </TabsContent>

                    {/* ─── TAB 2: Performa Total ─── */}
                    <TabsContent value="performa" className="mt-0">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="space-y-4">
                        {(() => {
                            // Calculate cross-month stats from all records
                            const allRecords = data;
                            let totalHadir = 0;
                            let totalIzin = 0;
                            let totalAlpha = 0;
                            let totalDays = 0;

                            const monthBreakdown = allRecords.map(record => {
                                const s = record.summary;
                                const daysInMonth = Object.keys(record.attendance).length;
                                totalHadir += s.hadir;
                                totalIzin += s.izin;
                                totalAlpha += s.alpha;
                                totalDays += daysInMonth;
                                return {
                                    month: record.month,
                                    hadir: s.hadir,
                                    izin: s.izin,
                                    alpha: s.alpha,
                                    days: daysInMonth,
                                    persen: daysInMonth > 0 ? parseFloat(((s.hadir / daysInMonth) * 100).toFixed(1)) : 0,
                                };
                            });

                            const totalPersen = totalDays > 0
                                ? parseFloat(((totalHadir / totalDays) * 100).toFixed(2))
                                : 0;

                            const persenColor = totalPersen >= 80 ? "text-emerald-700" : totalPersen >= 60 ? "text-amber-700" : "text-red-700";

                            return (
                                <>
                                    {/* Total Attendance Percentage */}
                                    <Card className="border-[#e8e0f0] shadow-sm overflow-hidden">
                                        <div className="bg-[#8a3dff] text-white p-6 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%)] bg-[size:20px_20px] opacity-50" />
                                            <div className="relative text-center">
                                                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                                                    Persentase Kehadiran Total
                                                </p>
                                                <p className="text-5xl sm:text-6xl font-black">
                                                    {totalPersen}%
                                                </p>
                                                <p className="text-sm text-white/70 mt-2">
                                                    {totalHadir} hadir dari {totalDays} hari terjadwal
                                                </p>
                                                <div className="mt-4 mx-auto max-w-xs h-2 bg-white/20 overflow-hidden">
                                                    <div
                                                        className="h-full bg-white transition-all duration-700"
                                                        style={{ width: `${totalPersen}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="border border-emerald-100 bg-emerald-50/50 p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Hadir</p>
                                            <p className="text-2xl sm:text-3xl font-black text-emerald-700">{totalHadir}</p>
                                        </div>
                                        <div className="border border-amber-100 bg-amber-50/50 p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Total Izin</p>
                                            <p className="text-2xl sm:text-3xl font-black text-amber-700">{totalIzin}</p>
                                        </div>
                                        <div className="border border-red-100 bg-red-50/50 p-4 text-center">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">Total Alpha</p>
                                            <p className="text-2xl sm:text-3xl font-black text-red-700">{totalAlpha}</p>
                                        </div>
                                    </div>

                                    {/* Alpha per Month Breakdown */}
                                    <Card className="border-[#e8e0f0] shadow-sm">
                                        <CardHeader className="border-b border-[#e8e0f0] pb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="bg-[#f3edff] p-2">
                                                    <Shield className="h-4 w-4 text-[#8a3dff]" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Alpha per Bulan</CardTitle>
                                                    <p className="text-[11px] text-[#6b6b6b]">Batas alpha per bulan: 4x. Jika melebihi, sanksi SP berlaku.</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5">
                                            <div className="grid gap-3">
                                                {monthBreakdown.map((m) => {
                                                    const alphaRatio = m.alpha / 4;
                                                    const barColor =
                                                        m.alpha >= 5 ? "bg-red-600" :
                                                        m.alpha === 4 ? "bg-red-500" :
                                                        m.alpha === 3 ? "bg-amber-500" :
                                                        m.alpha >= 1 ? "bg-yellow-400" :
                                                        "bg-emerald-400";
                                                    const textColor =
                                                        m.alpha >= 4 ? "text-red-700 font-black" :
                                                        m.alpha === 3 ? "text-amber-700 font-bold" :
                                                        "text-[#191919] font-semibold";

                                                    return (
                                                        <div key={m.month} className="flex items-center gap-4 py-2 px-3 bg-[#f5f3f7]/50 border border-[#e8e0f0] hover:bg-[#f3edff]/30 transition-colors">
                                                            <span className="text-xs font-bold text-[#191919] w-10">{m.month}</span>
                                                            <div className="flex-1 h-2 bg-[#e8e0f0] overflow-hidden">
                                                                <div
                                                                    className={`h-full ${barColor} transition-all duration-700`}
                                                                    style={{ width: `${Math.min(alphaRatio * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-sm w-12 text-right ${textColor}`}>
                                                                {m.alpha}/4
                                                            </span>
                                                            {m.alpha >= 3 && (
                                                                <AlertTriangle className={`h-4 w-4 shrink-0 ${
                                                                    m.alpha >= 5 ? "text-red-600" :
                                                                    m.alpha === 4 ? "text-red-500" :
                                                                    "text-amber-500"
                                                                }`} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Per Month Stats Table */}
                                    <Card className="border-[#e8e0f0] shadow-sm">
                                        <CardHeader className="border-b border-[#e8e0f0] pb-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="bg-[#f3edff] p-2">
                                                    <Calendar className="h-4 w-4 text-[#8a3dff]" />
                                                </div>
                                                <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Statistik per Bulan</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-[#f5f3f7]/50 border-b border-[#e8e0f0]">
                                                            <th className="text-left px-4 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider">Bulan</th>
                                                            <th className="text-center px-3 py-3 font-semibold text-emerald-600 uppercase tracking-wider">Hadir</th>
                                                            <th className="text-center px-3 py-3 font-semibold text-[#8a3dff] uppercase tracking-wider">Izin</th>
                                                            <th className="text-center px-3 py-3 font-semibold text-red-600 uppercase tracking-wider">Alpha</th>
                                                            <th className="text-center px-3 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider">Hari</th>
                                                            <th className="text-right px-4 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider">%</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {monthBreakdown.map((m) => (
                                                            <tr key={m.month} className="border-b border-[#e8e0f0] hover:bg-[#f3edff]/20 transition-colors">
                                                                <td className="px-4 py-3 font-bold text-[#191919]">{m.month}</td>
                                                                <td className="text-center px-3 py-3">
                                                                    <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold">{m.hadir}</span>
                                                                </td>
                                                                <td className="text-center px-3 py-3">
                                                                    <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-[#f3edff] text-[#8a3dff] font-bold">{m.izin}</span>
                                                                </td>
                                                                <td className="text-center px-3 py-3">
                                                                    <span className={`inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 font-bold ${
                                                                        m.alpha >= 4 ? "bg-red-100 text-red-700" : m.alpha === 3 ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-700"
                                                                    }`}>{m.alpha}</span>
                                                                </td>
                                                                <td className="text-center px-3 py-3">
                                                                    <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-gray-100 text-gray-600 font-bold">{m.days}</span>
                                                                </td>
                                                                <td className="text-right px-4 py-3">
                                                                    <span className={`font-bold ${m.persen >= 80 ? "text-emerald-700" : m.persen >= 60 ? "text-amber-700" : "text-red-700"}`}>
                                                                        {m.persen}%
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {/* Total Row */}
                                                        <tr className="bg-[#f5f3f7] font-bold border-t-2 border-[#e8e0f0]">
                                                            <td className="px-4 py-3 text-[#191919]">TOTAL</td>
                                                            <td className="text-center px-3 py-3 text-emerald-700">{totalHadir}</td>
                                                            <td className="text-center px-3 py-3 text-[#8a3dff]">{totalIzin}</td>
                                                            <td className="text-center px-3 py-3 text-red-700">{totalAlpha}</td>
                                                            <td className="text-center px-3 py-3 text-[#191919]">{totalDays}</td>
                                                            <td className={`text-right px-4 py-3 ${persenColor}`}>{totalPersen}%</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            );
                        })()}
                        </motion.div>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <motion.div variants={fadeUp} custom={8} className="text-center text-[11px] text-[#999] pb-4">
                    &copy; {new Date().getFullYear()} Infinite Learning Indonesia. All rights reserved.
                </motion.div>
            </motion.div>
        </div>
    );
}
