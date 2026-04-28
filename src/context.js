import React, { createContext, useState } from "react";

export const TerminalContext = createContext();

export function AppProvider({ children }) {
  const [terminal, setTerminal] = useState(null);

  return (
    <TerminalContext.Provider value={{ terminal, setTerminal }}>
      {children}
    </TerminalContext.Provider>
  );
}
