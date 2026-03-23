import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CommandPaletteProvider } from "@/contexts/CommandPaletteContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { CompareProvider } from "@/contexts/CompareContext";
import Header from "@/components/layout/Header";
import PageTransition from "@/components/layout/PageTransition";
import CommandPalette from "@/components/ui/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
    title: "LaborExchange — Карьера нового поколения",
    description: "Умная платформа для соискателей и работодателей. Найдите работу мечты или идеального кандидата.",
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    themeColor: '#3b82f6',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" className="dark" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{
                __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`
            }}/>
        </head>
        <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider>
            <AuthProvider>
                <CompareProvider>
                <NotificationProvider>
                    <ChatProvider>
                    <CommandPaletteProvider>
                        <CommandPalette />
                        <Header />
                        <main className="min-h-screen">
                            <PageTransition>{children}</PageTransition>
                        </main>
                    </CommandPaletteProvider>
                    </ChatProvider>
                </NotificationProvider>
                </CompareProvider>
                <Toaster
                    position="top-right"
                    richColors
                    theme="system"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            fontFamily: "var(--font-geist-sans)",
                            fontSize: "14px",
                            borderRadius: "12px",
                        },
                    }}
                />
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
