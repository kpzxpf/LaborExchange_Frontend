"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { tokenService } from "@/lib/tokenService";
import { notificationService } from "@/services/api";
import { toast } from "sonner";

export interface AppNotification {
    id: string;
    type: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    markAllRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    markAllRead: () => {},
    clearAll: () => {},
});

const SSE_URL = "http://localhost:8080/api/notifications/stream";

const TYPE_LABELS: Record<string, string> = {
    NEW_APPLICATION: "Новый отклик",
    ACCEPTED_APPLICATION: "Заявка принята",
    REJECTED_APPLICATION: "Заявка отклонена",
    WITHDRAWN_APPLICATION: "Заявка отозвана",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const esRef = useRef<EventSource | null>(null);
    const loadedHistoryRef = useRef(false);

    // Load persisted notifications from backend (last 10 days)
    const loadHistory = useCallback(async () => {
        try {
            const data = await notificationService.getMyNotifications();
            if (!Array.isArray(data)) return;
            const historical: AppNotification[] = data.map((n: {
                id: number; type: string; message: string; read: boolean; createdAt: string;
            }) => ({
                id: `db-${n.id}`,
                type: n.type,
                message: n.message,
                timestamp: new Date(n.createdAt),
                read: n.read,
            }));
            setNotifications(historical);
        } catch {
            // non-critical — SSE real-time still works
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            esRef.current?.close();
            esRef.current = null;
            loadedHistoryRef.current = false;
            setNotifications([]);
            return;
        }

        // Load history once on login
        if (!loadedHistoryRef.current) {
            loadedHistoryRef.current = true;
            loadHistory();
        }

        const token = tokenService.getToken();
        if (!token) return;

        const es = new EventSource(`${SSE_URL}?token=${encodeURIComponent(token)}`);
        esRef.current = es;

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as { type: string; message: string };
                const notification: AppNotification = {
                    id: crypto.randomUUID(),
                    type: data.type,
                    message: data.message,
                    timestamp: new Date(),
                    read: false,
                };
                setNotifications((prev) => [notification, ...prev].slice(0, 100));
                toast.info(data.message, { description: TYPE_LABELS[data.type] ?? data.type });
            } catch {
                // ignore malformed events
            }
        };

        es.onerror = () => {
            // EventSource auto-reconnects; no action needed
        };

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [isAuthenticated, loadHistory]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        notificationService.markAllRead().catch(() => {});
    }, []);

    const clearAll = () => setNotifications([]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
