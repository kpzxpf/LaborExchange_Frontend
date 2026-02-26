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
                    "bg-card text-card-foreground rounded-xl shadow-md border border-border overflow-hidden",
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
        <div ref={ref} className={cn("px-6 py-4 border-b border-border", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn("text-xl font-semibold text-card-foreground", className)} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />
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
        <div ref={ref} className={cn("px-6 py-4 bg-muted border-t border-border", className)} {...props} />
    )
);
CardFooter.displayName = "CardFooter";

export default Card;