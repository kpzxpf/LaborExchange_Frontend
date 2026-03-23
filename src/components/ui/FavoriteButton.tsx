"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { favoriteService, FavoriteItemType } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FavoriteButtonProps {
    itemId: number;
    itemType: FavoriteItemType;
    className?: string;
}

export default function FavoriteButton({ itemId, itemType, className }: FavoriteButtonProps) {
    const { user } = useAuth();
    const [isFav, setIsFav] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        favoriteService.isFavorite(itemId, itemType)
            .then(setIsFav)
            .catch(() => {});
    }, [itemId, itemType, user]);

    if (!user) return null;

    const toggle = async () => {
        setLoading(true);
        try {
            if (isFav) {
                await favoriteService.remove(itemId, itemType);
                setIsFav(false);
                toast.success("Удалено из избранного");
            } else {
                await favoriteService.add(itemId, itemType);
                setIsFav(true);
                toast.success("Добавлено в избранное");
            }
        } catch {
            toast.error("Не удалось обновить избранное");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`p-2 rounded-xl transition-all duration-200 ${className ?? ""}`}
            style={{
                background: isFav ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.05)",
                color: isFav ? "rgb(239,68,68)" : "rgb(var(--text-3))",
                border: isFav ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.08)",
            }}
            title={isFav ? "Удалить из избранного" : "Добавить в избранное"}
        >
            <Heart
                className="h-5 w-5 transition-transform duration-200"
                fill={isFav ? "currentColor" : "none"}
                style={{ transform: loading ? "scale(0.85)" : "scale(1)" }}
            />
        </button>
    );
}
