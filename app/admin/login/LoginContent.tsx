"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, KeyRound, Database, ArrowRight, AlertCircle } from "lucide-react";
import { endpoints, apiFetch } from "@/lib/api";

export default function LoginContent() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await apiFetch(endpoints.login, {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push("/admin/dashboard");
            } else {
                setError(data.message || "Login gagal.");
                setLoading(false);
            }
        } catch {
            setError("Terjadi kesalahan koneksi ke server.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-zinc-950 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 blur-[120px] dark:bg-blue-900/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 blur-[120px] dark:bg-indigo-900/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-100/20 blur-[100px] dark:bg-violet-900/5 rounded-full"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_600px_400px_at_50%_50%,black_20%,transparent_100%)] opacity-30 dark:opacity-10"></div>
            </div>

            <div className="flex flex-col items-center gap-8 z-10 w-full max-w-sm">
                {/* Logo & Branding */}
                <div className="flex flex-col items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 shadow-xl shadow-blue-500/25 ring-1 ring-white/20">
                        <Database className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                            Admin Panel
                        </h1>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-wide">
                            Sistem Manajemen Absensi Mentee
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="w-full border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/95 backdrop-blur-sm dark:bg-zinc-900/95">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-base font-semibold text-center">
                            Masuk ke Dashboard
                        </CardTitle>
                        <CardDescription className="text-center text-xs leading-relaxed">
                            Silakan masuk dengan kredensial administrator Anda untuk mengakses panel manajemen data absensi.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3">
                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-zinc-400" />
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                    className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm placeholder:text-zinc-400 focus-visible:ring-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                                    <KeyRound className="h-3 w-3 text-zinc-400" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Masukkan password Anda"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="h-10 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-sm placeholder:text-zinc-400 focus-visible:ring-blue-500/50"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 pb-6 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                        Memverifikasi...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Masuk ke Dashboard
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </span>
                                )}
                            </Button>
                            <div className="flex items-center gap-2 w-full">
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">Akses Terbatas</span>
                                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800"></div>
                            </div>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-600">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Area Khusus Personel Berwenang</span>
                    </div>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-700">
                        &copy; 2026 Admin Panel &middot; Absensi Management System
                    </p>
                </div>
            </div>
        </div>
    );
}
