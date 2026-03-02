"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { endpoints, apiFetch } from "@/lib/api";
import { Loader2, Users, Building2, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MenteeData = {
    _id: string;
    name: string;
    programIL: string;
    institusi: string;
    whatsapp: string;
    summary: {
        hadir: number;
        izin: number;
        alpha: number;
        persen: number;
    };
    month: string;
};

type DataViewerProps = {
    defaultProgram?: string;
    defaultMentor?: string;
    hideFilter?: boolean;
};

export default function DataViewer({ defaultProgram, defaultMentor, hideFilter }: DataViewerProps) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = monthNames[new Date().getMonth()];

    const [data, setData] = useState<MenteeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [program, setProgram] = useState(defaultProgram || "All");
    const [programsList, setProgramsList] = useState<string[]>([]);
    const [month, setMonth] = useState(currentMonth);
    const [monthsList, setMonthsList] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // If filtering by mentor, use the mentor endpoint
                const url = defaultMentor
                    ? endpoints.getDataByMentor(defaultMentor, page, month)
                    : endpoints.getAllData(program === "All" ? "" : program, page, month);
                const res = await apiFetch(url);
                const result = await res.json();

                if (result.success) {
                    setData(result.data);
                    setTotalPages(result.meta.totalPages);
                    setTotalRecords(result.meta.total || result.data.length);
                    if (result.meta.programs && result.meta.programs.length > 0) {
                        setProgramsList(result.meta.programs);
                    }
                    if (result.meta.months && result.meta.months.length > 0) {
                        setMonthsList(result.meta.months);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, program, month, defaultMentor]);

    const getPerformanceColor = (persen: number) => {
        if (persen >= 80) return { bg: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700", label: "Baik" };
        if (persen >= 60) return { bg: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-50 text-amber-700", label: "Cukup" };
        return { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-50 text-red-700", label: "Kurang" };
    };

    return (
        <div className="space-y-4">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[#191919] font-[var(--font-heading)]">
                        {defaultProgram ? `Mentee ${defaultProgram}` : "Semua Mentee"}
                    </h2>
                    {!loading && (
                        <Badge variant="secondary" className="text-[10px] font-normal bg-[#f3edff] text-[#8a3dff] border-0">
                            {totalRecords} data
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Month Filter - always shown */}
                    <Select value={month} onValueChange={(val) => { setMonth(val); setPage(1); }}>
                        <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-[#e8e0f0] hover:border-[#8a3dff] transition-colors">
                            <SelectValue placeholder="Filter Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="h-3 w-3 text-[#8a3dff]" />
                                    Semua Bulan
                                </span>
                            </SelectItem>
                            {(monthsList.length > 0 ? monthsList : monthNames).map((m) => (
                                <SelectItem key={m} value={m}>
                                    <span className="flex items-center gap-2">
                                        <CalendarDays className="h-3 w-3 text-[#8a3dff]" />
                                        {m}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Program Filter - shown when hideFilter is false */}
                    {!hideFilter && (
                        <Select value={program} onValueChange={(val) => { setProgram(val); setPage(1); }}>
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-white border-[#e8e0f0] hover:border-[#8a3dff] transition-colors">
                                <SelectValue placeholder="Filter Program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-[#8a3dff]" />
                                        Semua Program
                                    </span>
                                </SelectItem>
                                {programsList.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        <span className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3 text-[#8a3dff]" />
                                            {p}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border border-[#e8e0f0] shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#f5f3f7]/50 hover:bg-[#f5f3f7]/50">
                            <TableHead className="w-[250px] text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                                Informasi Mentee
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                                Program
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                                Periode
                            </TableHead>
                            <TableHead className="w-[200px] text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                                Tingkat Kehadiran
                            </TableHead>
                            <TableHead className="text-right text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-wider">
                                Detail (H / I / A)
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
                                        <div className="bg-[#f3edff] p-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-[#8a3dff]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-[#191919]">Memuat data...</p>
                                            <p className="text-xs text-[#6b6b6b] mt-0.5">Mengambil data mentee terbaru dari database</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                                        <div className="bg-[#f5f3f7] p-3">
                                            <Users className="h-5 w-5 text-[#999]" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-[#191919]">Data Tidak Ditemukan</p>
                                            <p className="text-xs text-[#6b6b6b] mt-0.5">
                                                Tidak ada data mentee untuk filter yang dipilih.
                                                {" Coba ubah filter bulan"}{!hideFilter && " atau program"}.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => {
                                const perf = getPerformanceColor(item.summary.persen);
                                return (
                                    <TableRow
                                        key={item._id}
                                        className="group hover:bg-[#f3edff]/30 transition-colors duration-150"
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-[#f3edff] flex items-center justify-center text-[10px] font-bold text-[#8a3dff] shrink-0">
                                                    {item.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-xs text-[#191919] truncate">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[10px] text-[#999] truncate max-w-[180px]">
                                                        {item.institusi}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="font-normal text-[10px] px-2 py-0.5 bg-[#f5f3f7] text-[#6b6b6b] border-0"
                                            >
                                                {item.programIL}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-medium text-[#6b6b6b]">
                                                {item.month}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex-1 h-1.5 bg-[#f5f3f7] overflow-hidden">
                                                    <div
                                                        className={`h-full ${perf.bg} transition-all duration-700 ease-out`}
                                                        style={{ width: `${item.summary.persen}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-bold w-10 text-right ${perf.text}`}>
                                                    {item.summary.persen}%
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-0.5 text-[11px] font-mono">
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold">
                                                    {item.summary.hadir}
                                                </span>
                                                <span className="text-[#ccc] mx-0.5">/</span>
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-[#f3edff] text-[#8a3dff] font-bold">
                                                    {item.summary.izin}
                                                </span>
                                                <span className="text-[#ccc] mx-0.5">/</span>
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 bg-red-50 text-red-700 font-bold">
                                                    {item.summary.alpha}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {!loading && data.length > 0 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-[#999]">
                        Menampilkan halaman <span className="font-semibold text-[#191919]">{page}</span> dari{" "}
                        <span className="font-semibold text-[#191919]">{totalPages}</span> halaman
                    </p>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={`h-8 text-xs ${page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-[#f3edff] hover:text-[#8a3dff]"}`}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <div className="flex items-center px-3 text-xs font-medium text-[#191919] bg-[#f5f3f7] h-8 min-w-[60px] justify-center">
                                    {page} / {totalPages}
                                </div>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className={`h-8 text-xs ${page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-[#f3edff] hover:text-[#8a3dff]"}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
