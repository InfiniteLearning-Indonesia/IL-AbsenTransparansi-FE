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
import { Loader2, Search, Users, Building2 } from "lucide-react";
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
    hideFilter?: boolean;
};

export default function DataViewer({ defaultProgram, hideFilter }: DataViewerProps) {
    const [data, setData] = useState<MenteeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [program, setProgram] = useState(defaultProgram || "All");
    const [programsList, setProgramsList] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(endpoints.getAllData(program === "All" ? "" : program, page));
                const result = await res.json();

                if (result.success) {
                    setData(result.data);
                    setTotalPages(result.meta.totalPages);
                    setTotalRecords(result.meta.total || result.data.length);
                    if (result.meta.programs && result.meta.programs.length > 0) {
                        setProgramsList(result.meta.programs);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, program]);

    const getPerformanceColor = (persen: number) => {
        if (persen >= 80) return { bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400", label: "Baik" };
        if (persen >= 60) return { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400", label: "Cukup" };
        return { bg: "bg-red-500", text: "text-red-700 dark:text-red-400", badge: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400", label: "Kurang" };
    };

    return (
        <div className="space-y-4">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        {defaultProgram ? `Mentee ${defaultProgram}` : "Semua Mentee"}
                    </h2>
                    {!loading && (
                        <Badge variant="secondary" className="text-[10px] font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                            {totalRecords} data
                        </Badge>
                    )}
                </div>

                {!hideFilter && (
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400" />
                        </div>
                        <Select value={program} onValueChange={(val) => { setProgram(val); setPage(1); }}>
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700">
                                <SelectValue placeholder="Filter Program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-zinc-400" />
                                        Semua Program
                                    </span>
                                </SelectItem>
                                {programsList.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        <span className="flex items-center gap-2">
                                            <Building2 className="h-3 w-3 text-zinc-400" />
                                            {p}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="rounded-lg border border-zinc-200/80 shadow-sm overflow-hidden bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-50/80">
                            <TableHead className="w-[250px] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Informasi Mentee
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Program
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Periode
                            </TableHead>
                            <TableHead className="w-[200px] text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Tingkat Kehadiran
                            </TableHead>
                            <TableHead className="text-right text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Detail (H / I / A)
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground py-8">
                                        <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Memuat data...</p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Mengambil data mentee terbaru dari database</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                                        <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-3">
                                            <Users className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Data Tidak Ditemukan</p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                                Tidak ada data mentee untuk filter yang dipilih.
                                                {!hideFilter && " Coba ubah filter program."}
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
                                        className="group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors duration-150"
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 shrink-0">
                                                    {item.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]">
                                                        {item.institusi}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="font-normal text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                                            >
                                                {item.programIL}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                {item.month}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${perf.bg} transition-all duration-700 ease-out`}
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
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold">
                                                    {item.summary.hadir}
                                                </span>
                                                <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">/</span>
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold">
                                                    {item.summary.izin}
                                                </span>
                                                <span className="text-zinc-300 dark:text-zinc-600 mx-0.5">/</span>
                                                <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold">
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
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        Menampilkan halaman <span className="font-semibold text-zinc-600 dark:text-zinc-400">{page}</span> dari{" "}
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">{totalPages}</span> halaman
                    </p>
                    <Pagination className="w-auto mx-0">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={`h-8 text-xs ${page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                />
                            </PaginationItem>
                            <PaginationItem>
                                <div className="flex items-center px-3 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 rounded-md h-8 min-w-[60px] justify-center">
                                    {page} / {totalPages}
                                </div>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className={`h-8 text-xs ${page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
