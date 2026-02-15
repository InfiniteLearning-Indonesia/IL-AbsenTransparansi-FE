import { Suspense } from "react";
import AbsenContent from "./AbsenContent";

export default function AbsenPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-900 dark:border-t-blue-400" />
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Memuat halaman...</p>
                    </div>
                </div>
            }
        >
            <AbsenContent />
        </Suspense>
    );
}
