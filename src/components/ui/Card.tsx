"use client";

import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
    hover?: boolean;
    children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover = false, children, ...props }, ref) => {
        const hoverAnimation = hover
            ? {
                whileHover: { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" },
                transition: { duration: 0.2 },
            }
            : {};

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden",
                    "transition-all duration-200",
                    className
                )}
                {...hoverAnimation}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("px-6 py-4 border-b border-gray-200", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-xl font-semibold text-gray-900", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-gray-600 mt-1", className)} {...props} />
    )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("px-6 py-4 bg-gray-50 border-t border-gray-200", className)} {...props} />
    )
);
CardFooter.displayName = "CardFooter";

export default Card;