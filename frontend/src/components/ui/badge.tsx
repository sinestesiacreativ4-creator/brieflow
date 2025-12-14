import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "pending" | "review" | "approved" | "production" | "delivered" | "completed" | "default";
}

const variantClasses = {
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    review: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    production: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    delivered: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    completed: "bg-white/10 text-white/60 border-white/20",
    default: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border tracking-wide",
                variantClasses[variant],
                className
            )}
            {...props}
        />
    );
}

export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
        BRIEF_PENDING: { label: "Brief Pendiente", variant: "pending" },
        BRIEF_IN_REVIEW: { label: "En Revisión", variant: "review" },
        BRIEF_APPROVED: { label: "Aprobado", variant: "approved" },
        IN_PRODUCTION: { label: "En Producción", variant: "production" },
        IN_REVIEW: { label: "En Revisión", variant: "review" },
        DELIVERED: { label: "Entregado", variant: "delivered" },
        COMPLETED: { label: "Completado", variant: "completed" },
    };

    const config = statusConfig[status] || { label: status, variant: "default" };

    return <Badge variant={config.variant}>{config.label}</Badge>;
}
