"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { endpoints, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    Loader2,
    Building2,
    BookOpen,
    GraduationCap,
    UserCheck,
    Phone,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Ban,
    Activity,
    Shield,
    BarChart3,
    Calendar,
    Clock,
    AlertCircle,
    CalendarDays,
    TrendingUp,
} from "lucide-react";

type MenteeProfile = {
    name: string;
    institusi: string;
    whatsapp: string;
    programIL: string;
    jenjang: string;
    mentor: string;
    batch: string;
    sp1: boolean;
    sp2: boolean;
    sp3: boolean;
    status: string;
};

type MonthlyBreakdown = {
    month: string;
    hadir: number;
    izin: number;
    alpha: number;
    belumDiisi: number;
    persen: number;
};

type AggregatedData = {
    totalHadir: number;
    totalIzin: number;
    totalAlpha: number;
    totalBelumDiisi: number;
    totalMonths: number;
    menteeTotalDays: number;
    globalTotalDays: number;
    totalPersen: number;
    perMonthDays: { month: string; days: number }[];
    monthlyBreakdown: MonthlyBreakdown[];
};

type MenteeRecord = {
    _id: string;
    month: string;
    attendance: Record<string, string>;
    summary: {
        hadir: number;
        izin: number;
        alpha: number;
        persen: number;
    };
};

// Status badge for daily attendance
function getDayStatusBadge(status: string) {
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
}

export default function MenteeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const whatsapp = params.id as string;

    const [profile, setProfile] = useState<MenteeProfile | null>(null);
    const [aggregated, setAggregated] = useState<AggregatedData | null>(null);
    const [records, setRecords] = useState<MenteeRecord[]>([]);
    const [selectedDetailMonth, setSelectedDetailMonth] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDetail = async () => {
            if (!whatsapp) return;
            setLoading(true);
            try {
                const res = await apiFetch(endpoints.getMenteeDetail(whatsapp));
                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                    setAggregated(data.aggregated);
                    setRecords(data.records);
                    if (data.records.length > 0) {
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        const currentRealMonth = monthNames[new Date().getMonth()];
                        const hasCurrentMonth = data.records.some((r: { month: string }) => r.month === currentRealMonth);
                        setSelectedDetailMonth(hasCurrentMonth ? currentRealMonth : data.records[data.records.length - 1].month);
                    }
                } else {
                    setError(data.message || "Data tidak ditemukan.");
                }
            } catch {
                setError("Gagal mengambil data mentee.");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [whatsapp]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FFFBFF]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#8a3dff]" />
                    <p className="text-sm text-[#6b6b6b]">Memuat data mentee...</p>
                </div>
            </div>
        );
    }

    if (error || !profile || !aggregated) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#FFFBFF] p-4">
                <XCircle className="h-10 w-10 text-red-500" />
                <p className="text-lg font-bold text-[#191919]">{error || "Data tidak tersedia."}</p>
                <Button onClick={() => router.back()} className="bg-[#8a3dff] text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
            </div>
        );
    }

    const spLevel = profile.sp3 ? 3 : profile.sp2 ? 2 : profile.sp1 ? 1 : 0;
    const statusLower = profile.status.toLowerCase();

    // Chart bar height calculations
    const maxAlpha = 4; // Max per month rule
    const monthlyAlphaData = aggregated.monthlyBreakdown;

    return (
        <div className="min-h-screen bg-[#FFFBFF] font-sans">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(138,61,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(138,61,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="relative mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-9 w-9 border-[#e8e0f0] hover:bg-[#f5f3f7] hover:border-[#8a3dff] transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#191919] font-[var(--font-heading)]">
                            Detail <span className="text-[#8a3dff]">Mentee</span>
                        </h1>
                        <p className="text-[11px] text-[#6b6b6b]">Data lengkap mentee</p>
                    </div>
                </div>

                {/* Profile Banner */}
                <div className="border border-[#e8e0f0] bg-white shadow-sm overflow-hidden">
                    <div className="bg-[#8a3dff] p-6 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%)] bg-[size:20px_20px] opacity-50" />
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate font-[var(--font-heading)]">
                                    {profile.name}
                                </h2>
                                <p className="text-sm text-white/80 font-medium mt-0.5">
                                    {profile.programIL}
                                </p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                    <Badge className="bg-white/20 hover:bg-white/30 border-0 text-white text-[10px]">
                                        {profile.batch || "Batch 10"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status + SP + Profile Info */}
                    <div className="p-5 sm:p-6 space-y-4">
                        {/* Status Row */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-[#8a3dff]" />
                                <span className="text-xs font-bold text-[#191919] uppercase tracking-wider">Status:</span>
                            </div>
                            {statusLower === "terminated" ? (
                                <span className="inline-flex items-center gap-1.5 bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                                    <Ban className="h-3 w-3" /> Terminated
                                </span>
                            ) : statusLower.includes("non") ? (
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 border border-gray-200">
                                    <XCircle className="h-3 w-3" /> Non-Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                            )}
                            {spLevel > 0 && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border ${
                                    spLevel === 3 ? "bg-red-100 text-red-700 border-red-300"
                                    : spLevel === 2 ? "bg-orange-100 text-orange-700 border-orange-300"
                                    : "bg-amber-100 text-amber-700 border-amber-300"
                                }`}>
                                    <AlertTriangle className="h-3 w-3" />
                                    {spLevel === 3 ? "SP3 / Pengeluaran" : `SP${spLevel}`}
                                </span>
                            )}
                        </div>

                        {/* Profile Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { icon: Building2, label: "Institusi", value: profile.institusi },
                                { icon: BookOpen, label: "Program", value: profile.programIL },
                                { icon: GraduationCap, label: "Jenjang", value: profile.jenjang },
                                { icon: UserCheck, label: "Mentor", value: `Kak ${profile.mentor}` },
                                { icon: Phone, label: "No. WhatsApp", value: profile.whatsapp },
                                { icon: Shield, label: "Batch", value: profile.batch || "Batch 10" },
                            ].map((f) => (
                                <div key={f.label} className="flex items-center gap-3 p-3 bg-[#f5f3f7]/50 border border-[#e8e0f0]">
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
                </div>

                {/* Summary Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Hadir</p>
                            <p className="text-3xl font-black text-emerald-700">{aggregated.totalHadir}</p>
                            <p className="text-[10px] text-emerald-600 opacity-70 mt-0.5">Sepanjang {aggregated.totalMonths} bulan</p>
                        </CardContent>
                    </Card>
                    <Card className="border-[#e4d6ff] bg-[#f3edff]/50 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a3dff] mb-1">Total Izin</p>
                            <p className="text-3xl font-black text-[#8a3dff]">{aggregated.totalIzin}</p>
                            <p className="text-[10px] text-[#8a3dff] opacity-70 mt-0.5">Sepanjang {aggregated.totalMonths} bulan</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-100 bg-red-50/50 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">Total Alpha</p>
                            <p className="text-3xl font-black text-red-700">{aggregated.totalAlpha}</p>
                            <p className="text-[10px] text-red-600 opacity-70 mt-0.5">Sepanjang {aggregated.totalMonths} bulan</p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-100 bg-amber-50/50 shadow-sm">
                        <CardContent className="p-4 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Belum Diisi</p>
                            <p className="text-3xl font-black text-amber-700">{aggregated.totalBelumDiisi}</p>
                            <p className="text-[10px] text-amber-600 opacity-70 mt-0.5">Kelas belum dimulai</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alpha per Month Chart */}
                <Card className="border-[#e8e0f0] shadow-sm">
                    <CardHeader className="border-b border-[#e8e0f0] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-[#f3edff] p-2">
                                <BarChart3 className="h-4 w-4 text-[#8a3dff]" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Alpha per Bulan</CardTitle>
                                <p className="text-[11px] text-[#6b6b6b]">Jumlah alpha mentee tiap bulan (maks. {maxAlpha}x/bulan sebelum sanksi berat)</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 pb-4">
                        <div className="flex items-end gap-3 sm:gap-4 justify-center h-[200px]">
                            {monthlyAlphaData.map((m) => {
                                const barHeight = Math.max((m.alpha / Math.max(maxAlpha + 1, m.alpha + 1)) * 160, 4);
                                const barColor = m.alpha >= 5 ? "bg-red-600" : m.alpha === 4 ? "bg-red-500" : m.alpha === 3 ? "bg-amber-500" : m.alpha >= 1 ? "bg-yellow-400" : "bg-emerald-400";
                                return (
                                    <div key={m.month} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                                        <span className="text-xs font-bold text-[#191919]">{m.alpha}x</span>
                                        <div className="w-full flex justify-center">
                                            <div
                                                className={`w-8 sm:w-10 ${barColor} transition-all duration-700 ease-out relative group`}
                                                style={{ height: `${barHeight}px` }}
                                            >
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#191919] text-white text-[10px] px-2 py-1 whitespace-nowrap z-10">
                                                    {m.month}: {m.alpha}x Alpha, {m.hadir}x Hadir
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold text-[#6b6b6b]">{m.month}</span>
                                        {/* Alpha/4 indicator */}
                                        <span className={`text-[10px] font-bold ${
                                            m.alpha >= 4 ? "text-red-600" : m.alpha === 3 ? "text-amber-600" : "text-[#999]"
                                        }`}>
                                            {m.alpha}/{maxAlpha}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Threshold line label */}
                        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-[#999]">
                            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-400" /> 0 Alpha</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-yellow-400" /> 1-2 Alpha</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500" /> 3 (SP1)</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-500" /> 4 (SP2)</span>
                            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-600" /> 5+ (SP3)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Breakdown Table */}
                <Card className="border-[#e8e0f0] shadow-sm">
                    <CardHeader className="border-b border-[#e8e0f0] pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-[#f3edff] p-2">
                                <Calendar className="h-4 w-4 text-[#8a3dff]" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Rincian per Bulan</CardTitle>
                                <p className="text-[11px] text-[#6b6b6b]">Breakdown kehadiran tiap bulan</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-[#f5f3f7]/50 border-b border-[#e8e0f0]">
                                        <th className="text-left px-5 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider text-[11px]">Bulan</th>
                                        <th className="text-center px-3 py-3 font-semibold text-emerald-600 uppercase tracking-wider text-[11px]">Hadir</th>
                                        <th className="text-center px-3 py-3 font-semibold text-[#8a3dff] uppercase tracking-wider text-[11px]">Izin</th>
                                        <th className="text-center px-3 py-3 font-semibold text-red-600 uppercase tracking-wider text-[11px]">Alpha</th>
                                        <th className="text-center px-3 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider text-[11px]">Belum Diisi</th>
                                        <th className="text-right px-5 py-3 font-semibold text-[#6b6b6b] uppercase tracking-wider text-[11px]">% Kehadiran</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyAlphaData.map((m) => (
                                        <tr key={m.month} className="border-b border-[#e8e0f0] hover:bg-[#f3edff]/20 transition-colors">
                                            <td className="px-5 py-3 font-bold text-[#191919]">{m.month} 2026</td>
                                            <td className="text-center px-3 py-3">
                                                <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold">
                                                    {m.hadir}
                                                </span>
                                            </td>
                                            <td className="text-center px-3 py-3">
                                                <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 bg-[#f3edff] text-[#8a3dff] font-bold">
                                                    {m.izin}
                                                </span>
                                            </td>
                                            <td className="text-center px-3 py-3">
                                                <span className={`inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 font-bold ${
                                                    m.alpha >= 4 ? "bg-red-100 text-red-700" : m.alpha === 3 ? "bg-amber-100 text-amber-700" : "bg-red-50 text-red-700"
                                                }`}>
                                                    {m.alpha}
                                                </span>
                                            </td>
                                            <td className="text-center px-3 py-3">
                                                <span className="inline-flex items-center justify-center min-w-[28px] px-1.5 py-0.5 bg-gray-100 text-gray-600 font-bold">
                                                    {m.belumDiisi}
                                                </span>
                                            </td>
                                            <td className="text-right px-5 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-[#f5f3f7] overflow-hidden">
                                                        <div
                                                            className={`h-full ${m.persen >= 80 ? "bg-emerald-500" : m.persen >= 60 ? "bg-amber-500" : "bg-red-500"} transition-all duration-500`}
                                                            style={{ width: `${m.persen}%` }}
                                                        />
                                                    </div>
                                                    <span className={`font-bold w-12 text-right ${
                                                        m.persen >= 80 ? "text-emerald-700" : m.persen >= 60 ? "text-amber-700" : "text-red-700"
                                                    }`}>
                                                        {m.persen}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Daily Attendance Table */}
                {(() => {
                    const currentRecord = records.find(r => r.month === selectedDetailMonth);
                    const attendanceEntries = currentRecord
                        ? Object.entries(currentRecord.attendance).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                        : [];
                    return (
                        <Card className="border-[#e8e0f0] shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-[#e8e0f0] bg-[#f5f3f7]/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="bg-[#f3edff] p-2">
                                            <CalendarDays className="h-4 w-4 text-[#8a3dff]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold font-[var(--font-heading)]">Riwayat Kehadiran Harian</CardTitle>
                                            <p className="text-[11px] text-[#6b6b6b]">Detail absensi per hari</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={selectedDetailMonth} onValueChange={setSelectedDetailMonth}>
                                            <SelectTrigger className="w-[120px] h-8 text-xs bg-white border-[#e8e0f0] hover:border-[#8a3dff] transition-colors">
                                                <SelectValue placeholder="Pilih Bulan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {records.map((r) => (
                                                    <SelectItem key={r.month} value={r.month}>
                                                        {r.month} 2026
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Badge variant="secondary" className="text-[10px] bg-[#f3edff] text-[#8a3dff] border-0">
                                            {attendanceEntries.length} hari
                                        </Badge>
                                    </div>
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
                                                        {selectedDetailMonth} {date}, 2026
                                                    </span>
                                                </div>
                                                {getDayStatusBadge(status)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Calendar className="h-10 w-10 text-[#ccc] mb-3" />
                                        <p className="text-sm text-[#6b6b6b]">
                                            Belum ada data absensi untuk bulan ini.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Aturan SP Box */}
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

                {/* ═══ ADMIN ONLY: Total Performance Section ═══ */}
                <Card className="border-[#e8e0f0] shadow-sm overflow-hidden border-l-4 border-l-[#8a3dff]">
                    <div className="bg-[#8a3dff] text-white p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%)] bg-[size:20px_20px] opacity-50" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5" />
                                <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                                    Performa Kehadiran Total Batch
                                </p>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-5xl font-black">{aggregated.totalPersen}%</p>
                                <p className="text-sm text-white/70">
                                    {aggregated.totalHadir} hadir / {aggregated.menteeTotalDays} hari terjadwal
                                </p>
                            </div>
                            <div className="mt-3 h-2 bg-white/20 overflow-hidden max-w-md">
                                <div
                                    className="h-full bg-white transition-all duration-700"
                                    style={{ width: `${aggregated.totalPersen}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-white/50 mt-3">
                                Total hari terjadwal seluruh batch: {aggregated.globalTotalDays} hari ({aggregated.perMonthDays?.map(m => `${m.month}: ${m.days}`).join(', ')})
                            </p>
                        </div>
                    </div>
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-[#191919] mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#8a3dff]" />
                            Alpha per Bulan (Admin View)
                        </p>
                        <div className="grid gap-2">
                            {monthlyAlphaData.map((m) => {
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
                                    <div key={m.month} className="flex items-center gap-4 py-2 px-3 bg-[#f5f3f7]/50 border border-[#e8e0f0]">
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
                        <div className="bg-amber-50 border border-amber-200 p-3 mt-4">
                            <p className="text-xs text-amber-800">
                                <strong>Info Admin:</strong> Total hari terjadwal batch ini adalah <strong>{aggregated.globalTotalDays} hari</strong>.
                                Batas alpha per bulan: 4x. Data ini bersifat rahasia dan hanya untuk keperluan monitoring mentor.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-[11px] text-[#999] pb-4">
                    &copy; {new Date().getFullYear()} Infinite Learning Indonesia. Admin Panel.
                </div>
            </div>
        </div>
    );
}
