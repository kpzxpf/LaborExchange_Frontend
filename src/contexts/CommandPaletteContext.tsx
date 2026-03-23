"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CommandPaletteCtx {
    open: boolean;
    setOpen: (v: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteCtx>({
    open: false,
    setOpen: () => {},
});

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <CommandPaletteContext.Provider value={{ open, setOpen }}>
            {children}
        </CommandPaletteContext.Provider>
    );
}

export const useCommandPalette = () => useContext(CommandPaletteContext);
