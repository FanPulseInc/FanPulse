export function getCurrentUserId(): string | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const decoded = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        return (
            decoded.sub ??
            decoded.nameid ??
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
            decoded.userId ??
            decoded.id ??
            null
        );
    } catch {
        return null;
    }
}

export function isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
}
