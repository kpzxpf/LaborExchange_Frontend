"use client";

import { forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 focus:ring-indigo-500/50 shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)]",
            secondary:
                "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 focus:ring-indigo-500/30",
            outline:
                "border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 focus:ring-indigo-500/30",
            ghost:
                "text-[rgb(var(--text-2))] hover:bg-white/5 hover:text-[rgb(var(--text-1))] focus:ring-indigo-500/20",
            danger:
                "bg-red-600/90 text-white hover:bg-red-600 focus:ring-red-500/50 shadow-[0_4px_12px_rgba(239,68,68,0.25)]",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-5 py-2.5 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02, y: disabled || isLoading ? 0 : -1 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export default Button;
