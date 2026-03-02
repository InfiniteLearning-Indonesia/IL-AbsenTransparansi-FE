"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User, KeyRound, Database, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { endpoints, apiFetch } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
    }),
};

export default function LoginContent() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
        <div className="flex min-h-screen items-center justify-center bg-[#FFFBFF] p-4 font-[var(--font-sans)] relative overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(138,61,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(138,61,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8a3dff]/5 blur-[120px] translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ffcd29]/8 blur-[120px] -translate-x-1/3 translate-y-1/3" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                className="flex flex-col items-center gap-8 z-10 w-full max-w-sm"
            >
                {/* Logo & Branding */}
                <motion.div variants={fadeUp} custom={0} className="flex flex-col items-center gap-3">
                    <div className="bg-[#8a3dff] p-4 shadow-xl shadow-[#8a3dff]/20">
                        <Database className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-xl font-bold text-[#191919] tracking-tight font-[var(--font-heading)]">
                            Admin <span className="accent-underline">Panel</span>
                        </h1>
                        <p className="text-xs text-[#6b6b6b] mt-0.5 tracking-wide">
                            Sistem Manajemen Absensi Mentee
                        </p>
                    </div>
                </motion.div>

                {/* Login Card */}
                <motion.div variants={fadeUp} custom={1} className="w-full">
                    <Card className="w-full border-[#e8e0f0] shadow-sm bg-white card-hover">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-base font-semibold text-center font-[var(--font-heading)]">
                                Masuk ke Dashboard
                            </CardTitle>
                            <CardDescription className="text-center text-xs leading-relaxed text-[#6b6b6b]">
                                Silakan masuk dengan kredensial administrator Anda untuk mengakses panel manajemen data absensi.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3">
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        <p className="text-xs text-red-600">{error}</p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-xs font-medium text-[#191919] flex items-center gap-1.5">
                                        <User className="h-3 w-3 text-[#8a3dff]" />
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
                                        className="h-10 bg-[#f5f3f7]/50 border-[#e8e0f0] text-sm placeholder:text-[#999] focus-visible:ring-[#8a3dff]/30 focus-visible:border-[#8a3dff]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-medium text-[#191919] flex items-center gap-1.5">
                                        <KeyRound className="h-3 w-3 text-[#8a3dff]" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan password Anda"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoComplete="current-password"
                                            className="h-10 pr-10 bg-[#f5f3f7]/50 border-[#e8e0f0] text-sm placeholder:text-[#999] focus-visible:ring-[#8a3dff]/30 focus-visible:border-[#8a3dff]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#191919] transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4 pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-10 text-sm font-medium bg-[#8a3dff] hover:bg-[#6b1fe0] text-white shadow-md shadow-[#8a3dff]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#8a3dff]/30"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                            Memverifikasi...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Login ke Dashboard
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </span>
                                    )}
                                </Button>
                                <div className="flex items-center gap-2 w-full">
                                    <div className="flex-1 h-px bg-[#e8e0f0]"></div>
                                    <span className="text-[10px] text-[#999] shrink-0">Kembali ke Home</span>
                                    <div className="flex-1 h-px bg-[#e8e0f0]"></div>
                                </div>
                                <Link href="/">
                                    <div className="text-sm text-[#8a3dff] font-medium border-b-2 border-[#8a3dff] pb-0.5 hover:text-[#6b1fe0] hover:border-[#6b1fe0] transition-colors">
                                        Home
                                    </div>
                                </Link>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>

                {/* Footer */}
                <motion.div variants={fadeUp} custom={2} className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#999]">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Mentor-Only Area</span>
                    </div>
                    <p className="text-[10px] text-[#ccc]">
                        &copy; 2026 Infinite Learning Indonesia &middot; Absensi Management System
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
