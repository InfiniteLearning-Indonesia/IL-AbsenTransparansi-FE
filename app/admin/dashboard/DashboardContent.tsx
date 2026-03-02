"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
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
import { endpoints, apiFetch } from "@/lib/api";
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    Bell,
    Database,
    Globe,
    Smartphone,
    BrainCircuit,
    Calendar,
    Clock,
    ChevronRight,
    UserCheck,
    UserX,
    History,
    Settings,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Save,
    Shield,
    UserCog,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DataViewer from "./DataViewer";
import { SyncResult } from "./types";
import { useRouter } from "next/navigation";

const MONTHS = [
    { value: "Feb", label: "Februari" },
    { value: "Mar", label: "Maret" },
    { value: "Apr", label: "April" },
    { value: "May", label: "Mei" },
    { value: "Jun", label: "Juni" },
];

type TabId = "all" | "sync" | "web" | "mobile" | "ai" | "history" | "settings" | `mentor_${string}`;

const STATIC_TAB_META: Record<string, { title: string; subtitle: string }> = {
    all: {
        title: "Mentee Overview",
        subtitle: "Ringkasan data kehadiran seluruh mentee di semua program",
    },
    sync: {
        title: "Sinkronisasi Data",
        subtitle: "Tarik data kehadiran terbaru dari Airtable ke database lokal",
    },
    web: {
        title: "Web Development",
        subtitle: "Data kehadiran mentee program Web Development & UI/UX Design",
    },
    mobile: {
        title: "Mobile Development",
        subtitle: "Data kehadiran mentee program Mobile Development with Flutter & UI/UX Design",
    },
    ai: {
        title: "AI Development",
        subtitle: "Data kehadiran mentee program AI Development",
    },
    history: {
        title: "Riwayat Kehadiran",
        subtitle: "Histori kehadiran harian mentee sepanjang bulan berjalan",
    },
    settings: {
        title: "Pengaturan Akun",
        subtitle: "Kelola akun dan preferensi administrator",
    },
};

function getTabMeta(tabId: TabId): { title: string; subtitle: string } {
    if (STATIC_TAB_META[tabId]) return STATIC_TAB_META[tabId];
    if (tabId.startsWith("mentor_")) {
        const mentorName = tabId.replace("mentor_", "");
        return {
            title: `${mentorName}'s Mentees`,
            subtitle: `Data kehadiran mentee yang dibimbing oleh Kak ${mentorName}`,
        };
    }
    return { title: "", subtitle: "" };
}

type TodayStats = {
    date: string;
    month: string;
    totalMenteeBulanIni: number;
    hadir: number;
    izin: number;
    alpha: number;
};

type StatsData = {
    totalMentee: number;
    programs: string[];
    programCounts: Record<string, number>;
    lastSync: string | null;
    today: TodayStats;
};

export default function DashboardContent() {
    const [activeTab, setActiveTab] = useState<TabId>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("Feb");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ _id: string; username: string; name: string; role: string } | null>(null);
    const [mentorList, setMentorList] = useState<string[]>([]);
    const router = useRouter();

    // Auth check on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await apiFetch(endpoints.me);
                const data = await res.json();
                if (data.success) {
                    setCurrentUser(data.user);
                } else {
                    router.push("/admin/login");
                }
            } catch {
                router.push("/admin/login");
            }
        };
        checkAuth();
    }, [router]);

    // Fetch mentor list on mount
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await apiFetch(endpoints.getMentorList);
                const data = await res.json();
                if (data.success) {
                    setMentorList(data.mentors);
                }
            } catch (err) {
                console.error("Failed to fetch mentor list", err);
            }
        };
        fetchMentors();
    }, []);

    const handleLogout = async () => {
        try {
            await apiFetch(endpoints.logout, { method: "POST" });
        } catch { /* ignore */ }
        router.push("/admin/login");
    };

    // Fetch global stats (all programs) — only on mount and after sync
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await apiFetch(endpoints.getStats());
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const formatLastSync = (dateStr: string | null) => {
        if (!dateStr) return { date: "Belum pernah sync", time: "" };
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            time: d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    };

    const lastSync = formatLastSync(stats?.lastSync || null);

    const handleSync = async () => {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await apiFetch(endpoints.fetchAttendance(selectedMonth), {
                method: "POST",
            });
            const data = await res.json();

            if (data.success) {
                setResult(data);
                // Re-fetch stats after successful sync
                fetchStats();
            } else {
                setError(data.message || "Gagal melakukan sinkronisasi.");
            }
        } catch {
            setError("Terjadi kesalahan koneksi ke server.");
        } finally {
            setLoading(false);
        }
    };

    // Build mentor nav items dynamically
    const isSuperAdmin = currentUser?.role === "superadmin";
    const mentorNavItems: { id: TabId; icon: React.ElementType; label: string; section?: string }[] = [];

    if (isSuperAdmin) {
        // Super admin sees all mentors
        mentorList.forEach((mentor, idx) => {
            mentorNavItems.push({
                id: `mentor_${mentor}` as TabId,
                icon: UserCog,
                label: `${mentor}'s Mentees`,
                ...(idx === 0 ? { section: "Personal" } : {}),
            });
        });
    } else if (currentUser) {
        // Regular admin sees only their own mentees
        // Match current user's username against mentor list (case-insensitive)
        const myMentorName = mentorList.find(
            (m) => m.toLowerCase() === currentUser.username.toLowerCase()
        );
        if (myMentorName) {
            mentorNavItems.push({
                id: `mentor_${myMentorName}` as TabId,
                icon: UserCog,
                label: `${myMentorName}'s Mentees`,
                section: "Personal",
            });
        }
    }

    const navItems: { id: TabId; icon: React.ElementType; label: string; section?: string }[] = [
        { id: "all", icon: LayoutDashboard, label: "All Mentee Data", section: "Menu Utama" },
        { id: "sync", icon: RefreshCw, label: "Sync Airtable" },
        { id: "web", icon: Globe, label: "Web Development", section: "Program" },
        { id: "mobile", icon: Smartphone, label: "Mobile Development" },
        { id: "ai", icon: BrainCircuit, label: "AI Development" },
        ...mentorNavItems,
        { id: "history", icon: History, label: "Riwayat Kehadiran", section: "Utilitas" },
        { id: "settings", icon: Settings, label: "Pengaturan Akun" },
    ];

    const SidebarContent = () => (
        <>
            <div className="flex h-16 shrink-0 items-center border-b border-[#e8e0f0] px-6">
                <div className="flex items-center gap-2.5 font-bold text-lg text-[#191919] font-[var(--font-heading)]">
                    <div className="bg-[#8a3dff] p-1.5 shadow-md shadow-[#8a3dff]/20">
                        <Database className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="leading-tight">Admin Panel</span>
                        <span className="text-[10px] font-normal text-[#6b6b6b] tracking-wide">Absensi Management</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto py-4 px-3">
                <nav className="space-y-1">
                    {navItems.map((item, idx) => (
                        <div key={item.id}>
                            {item.section && (
                                <div className={`px-3 mb-2 ${idx > 0 ? "mt-6" : ""} text-[10px] font-bold uppercase tracking-[0.15em] text-[#999]`}>
                                    {item.section}
                                </div>
                            )}
                            <Button
                                variant={activeTab === item.id ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 px-3 h-9 text-[13px] font-medium transition-all duration-200 ${activeTab === item.id
                                    ? "bg-[#f3edff] text-[#8a3dff] shadow-sm border border-[#e4d6ff]"
                                    : "text-[#6b6b6b] hover:text-[#191919] hover:bg-[#f5f3f7]"
                                    }`}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <item.icon className={`h-4 w-4 shrink-0 ${activeTab === item.id ? "text-[#8a3dff]" : "text-[#999]"}`} />
                                <span className="truncate">{item.label}</span>
                                {activeTab === item.id && (
                                    <ChevronRight className="h-3 w-3 ml-auto text-[#8a3dff]" />
                                )}
                            </Button>
                        </div>
                    ))}
                </nav>
            </div>

            <div className="border-t border-[#e8e0f0] p-3 space-y-2">
                <div className="flex items-center gap-3 p-3 bg-[#f5f3f7] border border-[#e8e0f0]">
                    <div className="h-8 w-8 bg-[#8a3dff] flex items-center justify-center text-white text-sm font-bold shadow shrink-0">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#191919] truncate">{currentUser?.name || "Admin"}</p>
                        <p className="text-[10px] text-[#6b6b6b] truncate flex items-center gap-1">
                            {currentUser?.role === "superadmin" && <Shield className="h-2.5 w-2.5" />}
                            {currentUser?.role === "superadmin" ? "Super Admin" : "Admin"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-3 h-9 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Keluar dari Sistem
                </Button>
            </div>
        </>
    );

    // Reusable stat cards component for program-specific tabs
    // Fetches its own stats filtered by program keyword
    const ProgramStatCards = ({ programKeyword }: { programKeyword: string }) => {
        const [progStats, setProgStats] = useState<StatsData | null>(null);
        const [progLoading, setProgLoading] = useState(true);

        useEffect(() => {
            const load = async () => {
                setProgLoading(true);
                try {
                    const res = await apiFetch(endpoints.getStats(programKeyword));
                    const data = await res.json();
                    if (data.success) {
                        setProgStats(data.stats);
                    }
                } catch (err) {
                    console.error("Failed to fetch program stats", err);
                } finally {
                    setProgLoading(false);
                }
            };
            load();
        }, [programKeyword]);

        const today = progStats?.today;
        const isLoading = progLoading;

        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-[#f3edff] p-2">
                                <Users className="h-4 w-4 text-[#8a3dff]" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-[#f3edff] text-[#8a3dff] border-0">
                                Total
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.totalMenteeBulanIni ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Total mentee terdaftar bulan ini
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-emerald-50 p-2">
                                <UserCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-0">
                                Hadir
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.hadir ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Mentee hadir hari ini (tgl {today?.date ?? "..."})
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-red-50 p-2">
                                <UserX className="h-4 w-4 text-red-600" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-0">
                                Alpha
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.alpha ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Mentee alpha hari ini (tgl {today?.date ?? "..."})
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Reusable stat cards component for mentor-specific tabs
    const MentorStatCards = ({ mentorName }: { mentorName: string }) => {
        const [mStats, setMStats] = useState<StatsData | null>(null);
        const [mLoading, setMLoading] = useState(true);

        useEffect(() => {
            const load = async () => {
                setMLoading(true);
                try {
                    const res = await apiFetch(endpoints.getStatsByMentor(mentorName));
                    const data = await res.json();
                    if (data.success) {
                        setMStats(data.stats);
                    }
                } catch (err) {
                    console.error("Failed to fetch mentor stats", err);
                } finally {
                    setMLoading(false);
                }
            };
            load();
        }, [mentorName]);

        const today = mStats?.today;
        const isLoading = mLoading;

        return (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-[#f3edff] p-2">
                                <Users className="h-4 w-4 text-[#8a3dff]" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-[#f3edff] text-[#8a3dff] border-0">
                                Total
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.totalMenteeBulanIni ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Total mentee terdaftar bulan ini
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-emerald-50 p-2">
                                <UserCheck className="h-4 w-4 text-emerald-600" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-0">
                                Hadir
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.hadir ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Mentee hadir hari ini (tgl {today?.date ?? "..."})
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-red-50 p-2">
                                <UserX className="h-4 w-4 text-red-600" />
                            </div>
                            <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-0">
                                Alpha
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-[#191919] tracking-tight">
                            {isLoading ? "..." : today?.alpha ?? 0}
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                            Mentee alpha hari ini (tgl {today?.date ?? "..."})
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="flex h-screen w-full bg-[#FFFBFF] font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden w-[260px] flex-col border-r border-[#e8e0f0] bg-white lg:flex">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="fixed left-0 top-0 h-full w-[280px] flex flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 items-center justify-between border-b border-[#e8e0f0] bg-white/80 backdrop-blur-md px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="font-semibold text-sm text-[#191919] leading-tight font-[var(--font-heading)]">
                                {getTabMeta(activeTab).title}
                            </h2>
                            <p className="text-[11px] text-[#6b6b6b] hidden sm:block">
                                {getTabMeta(activeTab).subtitle}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-[#999] hover:text-[#191919]">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5  bg-red-500 ring-2 ring-white"></span>
                        </Button>
                        <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-[#f5f3f7]">
                            <div className="h-6 w-6 bg-[#8a3dff] flex items-center justify-center text-white font-bold text-[10px]">
                                AD
                            </div>
                            <span className="text-xs font-medium text-[#6b6b6b]">Admin</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-6xl p-6 space-y-6">

                        {/* ===== ALL MENTEE TAB ===== */}
                        {activeTab === "all" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* 4 Stat Cards */}
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                                    <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-emerald-50 p-2">
                                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-0">
                                                    Hadir
                                                </Badge>
                                            </div>
                                            <div className="text-2xl font-bold text-[#191919] tracking-tight">
                                                {statsLoading ? "..." : stats?.today?.hadir ?? 0}
                                            </div>
                                            <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                                                Mentee hadir hari ini — tgl {stats?.today?.date ?? "..."} {stats?.today?.month ?? ""}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-red-50 p-2">
                                                    <UserX className="h-4 w-4 text-red-600" />
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-red-50 text-red-600 border-0">
                                                    Alpha
                                                </Badge>
                                            </div>
                                            <div className="text-2xl font-bold text-[#191919] tracking-tight">
                                                {statsLoading ? "..." : stats?.today?.alpha ?? 0}
                                            </div>
                                            <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                                                Mentee alpha — tgl {stats?.today?.date ?? "..."} {stats?.today?.month ?? ""}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow card-hover">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-[#f3edff] p-2">
                                                    <Users className="h-4 w-4 text-[#8a3dff]" />
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-[#f3edff] text-[#8a3dff] border-0">
                                                    Total
                                                </Badge>
                                            </div>
                                            <div className="text-2xl font-bold text-[#191919] tracking-tight">
                                                {statsLoading ? "..." : stats?.today?.totalMenteeBulanIni ?? 0}
                                            </div>
                                            <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                                                Total mentee bulan {stats?.today?.month ?? "..."} (semua program)
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-[#e8e0f0] shadow-sm hover:shadow-md transition-shadow cursor-pointer group card-hover" onClick={() => setActiveTab("sync")}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="bg-[#f3edff] p-2">
                                                    <Clock className="h-4 w-4 text-[#8a3dff]" />
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-[#f3edff] text-[#8a3dff] border-0 group-hover:bg-[#e4d6ff] transition-colors">
                                                    Sync &rarr;
                                                </Badge>
                                            </div>
                                            <div className="text-lg font-bold text-[#191919] tracking-tight leading-tight">
                                                {statsLoading ? "..." : lastSync.time || "N/A"}
                                            </div>
                                            <p className="text-[11px] text-[#6b6b6b] mt-0.5 truncate">
                                                {statsLoading ? "Memuat..." : lastSync.date}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Main Data Table */}
                                <Card className="border-[#e8e0f0] shadow-sm">
                                    <CardHeader className="pb-3 border-b border-[#e8e0f0]">
                                        <div>
                                            <CardTitle className="text-base font-[var(--font-heading)]">Seluruh Data Mentee</CardTitle>
                                            <CardDescription className="text-xs mt-0.5">
                                                Daftar lengkap mentee beserta ringkasan kehadiran dari semua program.
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        <DataViewer hideFilter />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ===== SYNC TAB ===== */}
                        {activeTab === "sync" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Sync Info Banner */}
                                <div className="border border-[#e4d6ff] bg-[#f3edff] p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#8a3dff] p-3 shadow-lg shadow-[#8a3dff]/20 shrink-0">
                                            <RefreshCw className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-[#191919] mb-1">
                                                Sinkronisasi Data Airtable
                                            </h3>
                                            <p className="text-sm text-[#6b6b6b] leading-relaxed">
                                                Proses ini akan mengambil data kehadiran mentee dari Airtable dan menyimpannya ke database MongoDB yang terhubung ke backend.
                                                Data yang sudah ada akan diperbarui, dan data baru akan ditambahkan secara otomatis.
                                                <strong className="text-[#191919]"> Sinkronisasi hanya berjalan saat tombol ditekan.</strong>
                                                <strong className="text-[#191919]"> Lakukan sync tiap jam 13.00 WIB jika sesi pagi dan tiap 22.00 WIB jika sesi malam.</strong>
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-[#6b6b6b]">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Terakhir sync: {lastSync.date}
                                                </span>
                                                {lastSync.time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Pukul {lastSync.time} WIB
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sync Action Card */}
                                <Card className="border-[#e8e0f0] shadow-sm">
                                    <CardHeader className="border-b border-[#e8e0f0]">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-[#8a3dff]" />
                                            Pilih Periode Bulan
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Tentukan bulan yang ingin di-sinkronisasi. Setiap bulan berisi data kehadiran mentee
                                            dari seluruh program yang terdaftar di Airtable.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-5">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                            <div className="grid w-full max-w-xs gap-2">
                                                <label className="text-xs font-medium text-[#191919]">
                                                    Bulan Target
                                                </label>
                                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                                    <SelectTrigger className="h-10 bg-white border-[#e8e0f0]">
                                                        <SelectValue placeholder="Pilih bulan..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MONTHS.map((m) => (
                                                            <SelectItem key={m.value} value={m.value}>
                                                                <span className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-[#999]" />
                                                                    {m.label} 2026
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                onClick={handleSync}
                                                disabled={loading}
                                                className="h-10 px-6 bg-[#8a3dff] hover:bg-[#6b1fe0] text-white shadow-md shadow-[#8a3dff]/20 transition-all hover:shadow-lg hover:shadow-[#8a3dff]/30"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Menyinkronkan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Mulai Sinkronisasi
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Error */}
                                {error && (
                                    <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle className="font-semibold">Sinkronisasi Gagal</AlertTitle>
                                        <AlertDescription className="text-sm mt-1">
                                            {error}
                                            <span className="block mt-1 text-xs opacity-75">
                                                Pastikan server backend berjalan dan koneksi ke Airtable aktif.
                                            </span>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Success Result */}
                                {result && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Alert className="border-emerald-200 bg-emerald-50/80">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <AlertTitle className="text-emerald-800 font-semibold">
                                                Sinkronisasi Berhasil!
                                            </AlertTitle>
                                            <AlertDescription className="text-emerald-700 text-sm">
                                                {result.message}
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                                            <Card className="border-[#e8e0f0]">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-[#f5f3f7] p-2">
                                                            <Database className="h-4 w-4 text-[#6b6b6b]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] text-[#6b6b6b] font-medium">Total Diambil</p>
                                                            <p className="text-xl font-bold text-[#191919]">{result.stats.totalFetched}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-emerald-100 bg-emerald-50/30">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-emerald-100 p-2">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] text-emerald-600 font-medium">Data Baru</p>
                                                            <p className="text-xl font-bold text-emerald-700">{result.stats.inserted}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="border-[#e4d6ff] bg-[#f3edff]/30">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-[#e4d6ff] p-2">
                                                            <RefreshCw className="h-4 w-4 text-[#8a3dff]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] text-[#8a3dff] font-medium">Diperbarui</p>
                                                            <p className="text-xl font-bold text-blue-700">{result.stats.updated}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {(result.skippedRecords?.length > 0 || result.duplicateRecords?.length > 0) && (
                                            <Card className="border-amber-200/80">
                                                <CardHeader className="pb-3 border-b border-[#ffcd29]/30">
                                                    <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                                                        <AlertCircle className="h-4 w-4" />
                                                        Laporan Masalah
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-amber-600/80">
                                                        Beberapa record memerlukan perhatian lebih lanjut.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    {result.skippedRecords?.length > 0 && (
                                                        <div>
                                                            <h4 className="mb-2 font-semibold text-xs text-amber-600 flex items-center gap-1">
                                                                Record Dilewati
                                                                <Badge variant="secondary" className="ml-1 text-[10px]">{result.skippedRecords.length}</Badge>
                                                            </h4>
                                                            <div className="max-h-40 overflow-auto border border-[#ffcd29]/30 bg-amber-50/50 p-2 text-sm">
                                                                {result.skippedRecords.map((item, i) => (
                                                                    <div key={i} className="flex justify-between py-1.5 px-1 border-b last:border-0 border-[#ffcd29]/30/50">
                                                                        <span className="font-medium text-[#191919] text-xs">{item.name}</span>
                                                                        <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">{item.reason}</Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {result.duplicateRecords?.length > 0 && (
                                                        <div>
                                                            <h4 className="mb-2 font-semibold text-xs text-red-600 flex items-center gap-1">
                                                                Nomor WA Duplikat
                                                                <Badge variant="secondary" className="ml-1 text-[10px]">{result.duplicateRecords.length}</Badge>
                                                            </h4>
                                                            <div className="max-h-40 overflow-auto border border-red-100 bg-red-50/50 p-2 text-sm">
                                                                {result.duplicateRecords.map((item, i) => (
                                                                    <div key={i} className="flex justify-between py-1.5 px-1 border-b last:border-0 border-red-100/50">
                                                                        <span className="font-medium text-[#191919] text-xs">{item.name}</span>
                                                                        <span className="text-[#6b6b6b] text-xs font-mono">{item.whatsapp}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== WEB DEV TAB ===== */}
                        {activeTab === "web" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border border-[#e4d6ff] bg-[#f3edff] to-[#f3edff]/50 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#8a3dff] p-3 shadow-lg shadow-[#8a3dff]/20 shrink-0">
                                            <Globe className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#191919] text-sm">Program Web Development & UI/UX Design</h3>
                                            <p className="text-xs text-[#6b6b6b] mt-1 leading-relaxed">
                                                Menampilkan data kehadiran khusus mentee yang terdaftar di program Web Development & UI/UX Design.
                                                Data difilter secara otomatis berdasarkan program yang dipilih.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ProgramStatCards programKeyword="Web" />
                                <Card className="border-[#e8e0f0] shadow-sm">
                                    <CardContent className="pt-5">
                                        <DataViewer defaultProgram="Web" hideFilter />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ===== MOBILE DEV TAB ===== */}
                        {activeTab === "mobile" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border border-[#e4d6ff] bg-gradient-to-r from-violet-50/80 to-purple-50/50 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#8a3dff] p-3 shadow-lg shadow-[#8a3dff]/20 shrink-0">
                                            <Smartphone className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#191919] text-sm">Program Mobile Development with Flutter & UI/UX Design</h3>
                                            <p className="text-xs text-[#6b6b6b] mt-1 leading-relaxed">
                                                Menampilkan data kehadiran khusus mentee yang terdaftar di program Mobile Development with Flutter & UI/UX Design.
                                                Data difilter secara otomatis berdasarkan program yang dipilih.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ProgramStatCards programKeyword="Mobile" />
                                <Card className="border-[#e8e0f0] shadow-sm">
                                    <CardContent className="pt-5">
                                        <DataViewer defaultProgram="Mobile" hideFilter />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ===== AI DEV TAB ===== */}
                        {activeTab === "ai" && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="border border-[#e4d6ff] bg-[#f3edff] to-[#f3edff]/50 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#8a3dff] p-3 shadow-lg shadow-[#8a3dff]/20 shrink-0">
                                            <BrainCircuit className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[#191919] text-sm">Program AI Development</h3>
                                            <p className="text-xs text-[#6b6b6b] mt-1 leading-relaxed">
                                                Menampilkan data kehadiran khusus mentee yang terdaftar di program AI Development.
                                                Data difilter secara otomatis berdasarkan program yang dipilih.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ProgramStatCards programKeyword="AI" />
                                <Card className="border-[#e8e0f0] shadow-sm">
                                    <CardContent className="pt-5">
                                        <DataViewer defaultProgram="AI" hideFilter />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* ===== MENTOR TABS (PERSONAL) ===== */}
                        {activeTab.startsWith("mentor_") && (() => {
                            const mentorName = activeTab.replace("mentor_", "");
                            return (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="border border-[#ffcd29]/30 bg-gradient-to-r from-[#fffbeb] to-[#fffbeb]/50 p-5">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-[#ffcd29] p-3 shadow-lg shadow-[#ffcd29]/20 shrink-0">
                                                <UserCog className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#191919] text-sm">
                                                    Mentee Kak {mentorName}
                                                </h3>
                                                <p className="text-xs text-[#6b6b6b] mt-1 leading-relaxed">
                                                    Menampilkan data kehadiran khusus mentee yang dibimbing oleh Kak {mentorName}.
                                                    Data difilter secara otomatis berdasarkan nama mentor.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <MentorStatCards mentorName={mentorName} />
                                    <Card className="border-[#e8e0f0] shadow-sm">
                                        <CardContent className="pt-5">
                                            <DataViewer defaultMentor={mentorName} hideFilter />
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })()}

                        {/* ===== HISTORY TAB ===== */}
                        {activeTab === "history" && <HistoryTab />}

                        {/* ===== SETTINGS TAB ===== */}
                        {activeTab === "settings" && <SettingsTab currentUser={currentUser} setCurrentUser={setCurrentUser} />}

                    </div>
                </div>
            </main>
        </div>
    );
}

/* ─────────────── History Tab Component ─────────────── */
function HistoryTab() {
    const [history, setHistory] = useState<{
        day: number; dayLabel: string; hadir: number; izin: number; alpha: number; belumDiisi: number; totalMentee: number;
    }[]>([]);
    const [month, setMonth] = useState("Feb");
    const [totalMentee, setTotalMentee] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(endpoints.getDailyHistory(month));
                const data = await res.json();
                if (data.success) {
                    setHistory(data.history);
                    setTotalMentee(data.totalMentee);
                }
            } catch (err) {
                console.error("History fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [month]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="border border-[#ffcd29]/30 bg-gradient-to-r from-[#fffbeb] to-[#fffbeb]/50 p-5">
                <div className="flex items-start gap-4">
                    <div className="bg-[#ffcd29] p-3 shadow-lg shadow-[#ffcd29]/20 shrink-0">
                        <History className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#191919] text-sm">Riwayat Kehadiran Harian</h3>
                        <p className="text-xs text-[#6b6b6b] mt-1 leading-relaxed">
                            Menampilkan rekap kehadiran per tanggal untuk seluruh hari dalam bulan.
                            Tanggal yang belum memiliki data absensi ditandai dengan kolom &quot;Belum Diisi&quot;.
                        </p>
                    </div>
                </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-[#191919]">Bulan:</label>
                <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="w-40 h-9 bg-white border-[#e8e0f0] text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[{ v: "Feb", l: "Februari" }, { v: "Mar", l: "Maret" }, { v: "Apr", l: "April" }, { v: "May", l: "Mei" }, { v: "Jun", l: "Juni" }].map(m => (
                            <SelectItem key={m.v} value={m.v}>{m.l} 2026</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Badge variant="secondary" className="text-[10px]">{totalMentee} mentee</Badge>
            </div>

            {/* History Table */}
            <Card className="border-[#e8e0f0] shadow-sm">
                <CardContent className="pt-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-[#8a3dff] mr-2" />
                            <span className="text-sm text-[#6b6b6b]">Memuat riwayat...</span>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Calendar className="h-10 w-10 text-[#ccc] mb-3" />
                            <p className="text-sm text-[#6b6b6b]">Belum ada data kehadiran untuk bulan ini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#e8e0f0]">
                                        <th className="text-left py-3 px-3 text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider">Tanggal</th>
                                        <th className="text-center py-3 px-3 text-xs font-semibold text-emerald-600 uppercase tracking-wider">Hadir</th>
                                        <th className="text-center py-3 px-3 text-xs font-semibold text-amber-600 uppercase tracking-wider">Izin</th>
                                        <th className="text-center py-3 px-3 text-xs font-semibold text-red-600 uppercase tracking-wider">Alpha</th>
                                        <th className="text-center py-3 px-3 text-xs font-semibold text-[#999] uppercase tracking-wider">Belum Diisi</th>
                                        <th className="text-center py-3 px-3 text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider">% Hadir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((row) => {
                                        const allDays = row.hadir + row.izin + row.alpha + row.belumDiisi;
                                        const pct = allDays > 0 ? Math.round((row.hadir / allDays) * 100) : 0;
                                        const isEmpty = (row.hadir + row.izin + row.alpha) === 0;
                                        return (
                                            <tr key={row.day} className={`border-b border-[#e8e0f0] transition-colors ${isEmpty ? 'opacity-40' : 'hover:bg-[#f5f3f7]'}`}>
                                                <td className="py-3 px-3 font-medium text-[#191919]">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5 text-[#999]" />
                                                        {row.dayLabel}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold text-xs min-w-[40px]">{row.hadir}</Badge>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <Badge className="bg-amber-100 text-amber-700 border-0 font-bold text-xs min-w-[40px]">{row.izin}</Badge>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <Badge className="bg-red-100 text-red-700 border-0 font-bold text-xs min-w-[40px]">{row.alpha}</Badge>
                                                </td>
                                                <td className="text-center py-3 px-3">
                                                    <Badge className="bg-[#f5f3f7] text-[#6b6b6b] border-0 font-medium text-xs min-w-[40px]">{row.belumDiisi}</Badge>
                                                </td>

                                                <td className="text-center py-3 px-3">
                                                    {isEmpty ? (
                                                        <span className="text-xs text-[#999] italic">—</span>
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-1.5  bg-zinc-200 overflow-hidden">
                                                                <div
                                                                    className={`h-full  transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className={`text-xs font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                {pct}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Settings Tab Component ───
function SettingsTab({ currentUser, setCurrentUser }: { currentUser: { _id: string; username: string; name: string; role: string } | null; setCurrentUser: (u: { _id: string; username: string; name: string; role: string } | null) => void }) {
    const [name, setName] = useState(currentUser?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // User management
    const [users, setUsers] = useState<{ _id: string; username: string; name: string; role: string; createdAt: string }[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [addLoading, setAddLoading] = useState(false);
    const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showNewUserPw, setShowNewUserPw] = useState(false);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        try {
            const res = await apiFetch(endpoints.listUsers);
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch { /* ignore */ }
        setUsersLoading(false);
    }, []);

    useEffect(() => {
        (async () => {
            setUsersLoading(true);
            try {
                const res = await apiFetch(endpoints.listUsers);
                const data = await res.json();
                if (data.success) setUsers(data.users);
            } catch { /* ignore */ }
            setUsersLoading(false);
        })();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg(null);

        try {
            const body: Record<string, string> = {};
            if (name && name !== currentUser?.name) body.name = name;
            if (newPassword) {
                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }

            if (Object.keys(body).length === 0) {
                setProfileMsg({ type: "error", text: "Tidak ada perubahan." });
                setProfileLoading(false);
                return;
            }

            const res = await apiFetch(endpoints.updateProfile, {
                method: "PUT",
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (data.success) {
                setProfileMsg({ type: "success", text: data.message });
                if (data.user) setCurrentUser(data.user);
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setProfileMsg({ type: "error", text: data.message });
            }
        } catch {
            setProfileMsg({ type: "error", text: "Gagal memperbarui profil." });
        }
        setProfileLoading(false);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddLoading(true);
        setAddMsg(null);

        try {
            const res = await apiFetch(endpoints.createUser, {
                method: "POST",
                body: JSON.stringify({ username: newUsername, password: newUserPassword, name: newUserName }),
            });
            const data = await res.json();

            if (data.success) {
                setAddMsg({ type: "success", text: data.message });
                setNewUsername("");
                setNewUserPassword("");
                setNewUserName("");
                setShowAddUser(false);
                loadUsers();
            } else {
                setAddMsg({ type: "error", text: data.message });
            }
        } catch {
            setAddMsg({ type: "error", text: "Gagal menambah akun." });
        }
        setAddLoading(false);
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!confirm(`Hapus akun "${username}"? Tindakan ini tidak dapat dibatalkan.`)) return;

        try {
            const res = await apiFetch(endpoints.deleteUser(id), { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                loadUsers();
            } else {
                alert(data.message);
            }
        } catch {
            alert("Gagal menghapus akun.");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="border border-[#e8e0f0] bg-gradient-to-r from-zinc-50 to-zinc-100/50 p-5">
                <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-zinc-600 to-zinc-800 p-3 shadow-lg shrink-0">
                        <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#191919] text-sm">Pengaturan Akun</h3>
                        <p className="text-xs text-[#6b6b6b] mt-1">
                            Kelola informasi akun, ubah password, dan kelola akun administrator lainnya.
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Section */}
            <Card className="border-[#e8e0f0] shadow-sm">
                <CardHeader className="border-b border-[#e8e0f0]">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#8a3dff]" />
                        Profil Saya
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Perbarui nama tampilan dan password Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#191919]">Username</label>
                            <Input value={currentUser?.username || ""} disabled className="h-9 text-sm bg-[#f5f3f7]" />
                            <p className="text-[10px] text-[#999]">Username tidak dapat diubah.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#191919]">Nama Tampilan</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" placeholder="Nama admin" />
                        </div>
                        <div className="border-t border-[#e8e0f0] pt-4 space-y-3">
                            <p className="text-xs font-semibold text-[#191919]">Ubah Password</p>
                            <div className="relative">
                                <Input
                                    type={showCurrentPw ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="h-9 text-sm pr-9"
                                    placeholder="Password saat ini"
                                />
                                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-2.5 top-2 text-[#999] hover:text-[#6b6b6b]">
                                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showNewPw ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="h-9 text-sm pr-9"
                                    placeholder="Password baru (min. 6 karakter)"
                                />
                                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-2.5 top-2 text-[#999] hover:text-[#6b6b6b]">
                                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {profileMsg && (
                            <div className={`p-3 text-xs font-medium flex items-center gap-2 ${profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {profileMsg.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                {profileMsg.text}
                            </div>
                        )}

                        <Button type="submit" disabled={profileLoading} className="h-9 text-xs font-semibold bg-[#8a3dff] text-white shadow-sm">
                            {profileLoading ? (
                                <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="h-3.5 w-3.5" /> Simpan Perubahan</span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* User Management Section */}
            <Card className="border-[#e8e0f0] shadow-sm">
                <CardHeader className="border-b border-[#e8e0f0]">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Shield className="h-4 w-4 text-[#8a3dff]" />
                                Kelola Akun Administrator
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Tambah atau hapus akun admin yang dapat mengakses dashboard.
                            </CardDescription>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => { setShowAddUser(!showAddUser); setAddMsg(null); }}
                            className="h-8 text-xs font-semibold bg-[#8a3dff] text-white shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Akun
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {/* Add User Form */}
                    {showAddUser && (
                        <form onSubmit={handleAddUser} className="mb-5 p-4 border border-dashed border-[#e4d6ff] bg-[#f3edff]/30 space-y-3">
                            <p className="text-xs font-semibold text-[#5a1dbf]">Tambah Akun Baru</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Input value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Nama" required className="h-9 text-sm" />
                                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Username" required className="h-9 text-sm" />
                                <div className="relative">
                                    <Input type={showNewUserPw ? "text" : "password"} value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Password (min 6)" required className="h-9 text-sm pr-9" />
                                    <button type="button" onClick={() => setShowNewUserPw(!showNewUserPw)} className="absolute right-2.5 top-2 text-[#999] hover:text-[#6b6b6b] transition-colors">
                                        {showNewUserPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {addMsg && (
                                <div className={`p-2.5 text-xs font-medium ${addMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                    {addMsg.text}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={addLoading} size="sm" className="h-8 text-xs font-semibold bg-[#8a3dff] text-white">
                                    {addLoading ? "Membuat..." : "Buat Akun"}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowAddUser(false)}>
                                    Batal
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Users List */}
                    {usersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div key={u._id} className="flex items-center gap-3 p-3 border border-[#e8e0f0] hover:bg-[#f5f3f7]/80 transition-colors">
                                    <div className="h-9 w-9 bg-[#8a3dff] flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-[#191919] truncate">{u.name}</p>
                                            {u.role === "superadmin" && (
                                                <Badge className="bg-amber-100 text-amber-700 border-0 text-[9px] px-1.5 py-0">Super Admin</Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#999] truncate">@{u.username} &middot; Dibuat {new Date(u.createdAt).toLocaleDateString("id-ID")}</p>
                                    </div>
                                    {u.role !== "superadmin" && u._id !== currentUser?._id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                            onClick={() => handleDeleteUser(u._id, u.username)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
