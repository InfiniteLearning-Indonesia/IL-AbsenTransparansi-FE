export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

export const endpoints = {
    // Public
    checkAttendance: `${API_BASE_URL}/attendance/check`,

    // Auth
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    me: `${API_BASE_URL}/auth/me`,
    updateProfile: `${API_BASE_URL}/auth/update-profile`,
    listUsers: `${API_BASE_URL}/auth/users`,
    createUser: `${API_BASE_URL}/auth/users`,
    deleteUser: (id: string) => `${API_BASE_URL}/auth/users/${id}`,

    // Admin (protected)
    fetchAttendance: (month: string) => `${API_BASE_URL}/admin/fetch/${month}`,
    getAllData: (program: string, page: number) => `${API_BASE_URL}/admin/data?program=${encodeURIComponent(program)}&page=${page}&limit=10`,
    getStats: (program?: string) => `${API_BASE_URL}/admin/stats${program ? `?program=${encodeURIComponent(program)}` : ""}`,
    getDailyHistory: (month?: string, program?: string) => {
        const params = new URLSearchParams();
        if (month) params.set("month", month);
        if (program) params.set("program", program);
        const qs = params.toString();
        return `${API_BASE_URL}/admin/history${qs ? `?${qs}` : ""}`;
    },
};

/**
 * Wrapper for fetch that includes credentials (cookies) automatically.
 * Use this for all API calls to admin/auth endpoints.
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        credentials: "include", // Send httpOnly cookies
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });
    return res;
}
