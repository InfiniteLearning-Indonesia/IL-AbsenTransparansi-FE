"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { endpoints } from "@/lib/api";

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

export default function AbsenContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const whatsapp = searchParams.get("whatsapp");

    const [data, setData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMonth, setSelectedMonth] = useState<string>("");

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
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="rounded-full bg-red-50 dark:bg-red-950/30 p-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 font-medium">Nomor WhatsApp tidak ditemukan.</p>
                <Button onClick={() => router.push("/")} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-blue-100 dark:border-blue-900/30" />
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 absolute inset-0" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Memuat Data</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">Mengambil riwayat kehadiran Anda...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !currentData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="rounded-full bg-red-50 dark:bg-red-950/30 p-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{error || "Data tidak tersedia."}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Pastikan nomor WhatsApp Anda benar dan terdaftar di sistem.</p>
                </div>
                <Button onClick={() => router.push("/")} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
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
        { icon: UserCheck, label: "Mentor", value: currentData.mentor },
    ];

    // Recalculate percentage: hadir / total ALL days (including belumDiisi)
    const totalAllDays = attendanceEntries.length;
    const recalcPersen = totalAllDays > 0 ? parseFloat(((currentData.summary.hadir / totalAllDays) * 100).toFixed(2)) : 0;

    const statCards = [
        { label: "Hadir", value: currentData.summary.hadir, unit: "Sesi", color: "emerald" },
        { label: "Izin / Sakit", value: currentData.summary.izin, unit: "Sesi", color: "amber" },
        { label: "Alpha", value: currentData.summary.alpha, unit: "Sesi", color: "red" },
        { label: "Persentase", value: `${recalcPersen}%`, unit: "Kehadiran", color: "blue" },
    ];

    const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
        emerald: {
            bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
            text: "text-emerald-700 dark:text-emerald-300",
            badge: "text-emerald-600 dark:text-emerald-400",
        },
        amber: {
            bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
            text: "text-amber-700 dark:text-amber-300",
            badge: "text-amber-600 dark:text-amber-400",
        },
        red: {
            bg: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30",
            text: "text-red-700 dark:text-red-300",
            badge: "text-red-600 dark:text-red-400",
        },
        blue: {
            bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30",
            text: "text-blue-700 dark:text-blue-300",
            badge: "text-blue-600 dark:text-blue-400",
        },
    };

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase().trim();
        if (s === "null") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    <Clock className="h-3 w-3" />
                    Kelas belum dimulai
                </span>
            );
        }
        if (s.includes("hadir")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Hadir
                </span>
            );
        }
        if (s === "izin" || s.includes("sakit")) {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3" />
                    {status}
                </span>
            );
        }
        if (s === "alpha") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400">
                    <XCircle className="h-3 w-3" />
                    Alpha
                </span>
            );
        }
        return <span className="text-xs text-zinc-500">{status}</span>;
    };

    return (
        <div className="min-h-screen bg-zinc-50/50 font-sans dark:bg-zinc-950 relative">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[80px] dark:bg-blue-900/10" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-indigo-100/30 rounded-full blur-[80px] dark:bg-indigo-900/10" />
            </div>

            <div className="relative mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/")}
                            className="rounded-xl h-9 w-9 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Detail Absensi
                            </h1>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
                                Riwayat kehadiran mentee
                            </p>
                        </div>
                    </div>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-400" />
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
                </div>

                {/* Profile Banner */}
                <div className="rounded-2xl border border-zinc-200/80 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/90">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%)] bg-[size:20px_20px] opacity-30" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                                {currentData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
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
                            <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
                                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2 shrink-0">
                                    <f.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">{f.label}</p>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{f.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map((s) => {
                        const c = colorMap[s.color];
                        return (
                            <div
                                key={s.label}
                                className={`rounded-xl border p-4 text-center ${c.bg} hover:shadow-md transition-all hover:-translate-y-0.5`}
                            >
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${c.badge} mb-1`}>{s.label}</p>
                                <p className={`text-2xl sm:text-3xl font-black ${c.text}`}>{s.value}</p>
                                <p className={`text-[10px] ${c.badge} opacity-70 mt-0.5`}>{s.unit}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Attendance Table */}
                <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold">Riwayat Kehadiran</CardTitle>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Bulan {selectedMonth} 2026</p>
                            </div>
                            <Badge variant="secondary" className="ml-auto text-[10px]">
                                {attendanceEntries.length} hari
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {attendanceEntries.length > 0 ? (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {attendanceEntries.map(([date, status]) => (
                                    <div
                                        key={date}
                                        className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                                {date}
                                            </div>
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                                                {selectedMonth} {date}, 2026
                                            </span>
                                        </div>
                                        {getStatusBadge(status)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <User className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-3" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Belum ada data absensi untuk bulan ini.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-[11px] text-zinc-400 dark:text-zinc-600 pb-4">
                    &copy; {new Date().getFullYear()} Infinite Learning Indonesia. All rights reserved.
                </div>
            </div>
        </div>
    );
}
