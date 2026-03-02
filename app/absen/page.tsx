import { Suspense } from "react";
import AbsenContent from "./AbsenContent";

export default function AbsenPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#FFFBFF]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin border-4 border-[#e4d6ff] border-t-[#8a3dff]" />
                        <p className="text-sm text-[#6b6b6b] font-medium">Memuat halaman...</p>
                    </div>
                </div>
            }
        >
            <AbsenContent />
        </Suspense>
    );
}
