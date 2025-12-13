import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900",
                    "placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                    "transition-all duration-200 resize-none",
                    error && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
