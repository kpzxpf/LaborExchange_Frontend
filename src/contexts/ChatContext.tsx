"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageDto } from "@/services/api";
import { tokenService } from "@/lib/tokenService";

interface ChatContextType {
    subscribe: (conversationId: number, onMessage: (msg: MessageDto) => void) => () => void;
    isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const clientRef = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const subscribersRef = useRef<Map<number, ((msg: MessageDto) => void)[]>>(new Map());

    useEffect(() => {
        if (!isAuthenticated) return;

        const token = tokenService.getToken();
        const client = new Client({
            webSocketFactory: () => new SockJS(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/ws-chat`),
            connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
            },
            onDisconnect: () => {
                setIsConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [isAuthenticated]);

    const subscribe = useCallback((conversationId: number, onMessage: (msg: MessageDto) => void) => {
        const client = clientRef.current;
        if (!client || !client.connected) {
            // Queue for when connected
            const existing = subscribersRef.current.get(conversationId) ?? [];
            subscribersRef.current.set(conversationId, [...existing, onMessage]);
            return () => {};
        }

        const subscription = client.subscribe(`/topic/conversation/${conversationId}`, (frame) => {
            try {
                const msg: MessageDto = JSON.parse(frame.body);
                onMessage(msg);
            } catch {
                // ignore parse errors
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <ChatContext.Provider value={{ subscribe, isConnected }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within ChatProvider");
    return ctx;
};
