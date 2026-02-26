import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LaborExchange - Connect Talent with Opportunity",
    description: "Find your dream job or discover the perfect candidate",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            {/* Prevent FOUC: apply saved theme before React hydrates */}
            <script dangerouslySetInnerHTML={{
                __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`
            }}/>
        </head>
        <body className={inter.className}>
        <ThemeProvider>
            <AuthProvider>
                <Header />
                <main className="min-h-screen">{children}</main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#363636",
                            color: "#fff",
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: "#10B981",
                                secondary: "#fff",
                            },
                        },
                        error: {
                            duration: 4000,
                            iconTheme: {
                                primary: "#EF4444",
                                secondary: "#fff",
                            },
                        },
                    }}
                />
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
