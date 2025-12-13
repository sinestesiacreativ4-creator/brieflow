import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
    return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
    const now = new Date();
    const target = new Date(date);
    const diff = now.getTime() - target.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Ahora mismo";
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days} días`;

    return formatDate(date);
}

export function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
        BRIEF_PENDING: "Brief Pendiente",
        BRIEF_IN_REVIEW: "Brief en Revisión",
        BRIEF_APPROVED: "Brief Aprobado",
        IN_PRODUCTION: "En Producción",
        IN_REVIEW: "En Revisión",
        DELIVERED: "Entregado",
        COMPLETED: "Completado",
    };
    return labels[status] || status;
}

export function getStatusBadgeClass(status: string) {
    const classes: Record<string, string> = {
        BRIEF_PENDING: "badge-pending",
        BRIEF_IN_REVIEW: "badge-review",
        BRIEF_APPROVED: "badge-approved",
        IN_PRODUCTION: "badge-production",
        IN_REVIEW: "badge-review",
        DELIVERED: "badge-delivered",
        COMPLETED: "badge-completed",
    };
    return classes[status] || "badge-pending";
}

export function getProjectTypeLabel(type: string) {
    const labels: Record<string, string> = {
        BRANDING: "Branding",
        WEB_DESIGN: "Diseño Web",
        ADVERTISING_CAMPAIGN: "Campaña Publicitaria",
        VIDEO_PRODUCTION: "Producción de Video",
        PACKAGING: "Packaging",
        SOCIAL_MEDIA: "Redes Sociales",
        OTHER: "Otro",
    };
    return labels[type] || type;
}

export function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
