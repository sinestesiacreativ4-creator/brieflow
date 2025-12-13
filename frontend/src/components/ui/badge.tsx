import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "pending" | "review" | "approved" | "production" | "delivered" | "completed" | "default";
}

const variantClasses = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    review: "bg-blue-100 text-blue-700 border-blue-200",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    production: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-teal-100 text-teal-700 border-teal-200",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    default: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
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
