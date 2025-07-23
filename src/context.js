import React, { createContext, useState } from "react";

// Shared code editor state
export const CodeContext = createContext();

// Shared terminal instance
export const TerminalContext = createContext();

export function AppProvider({ children }) {
  const [code, setCode] = useState(`# Python Example\nprint("Hello, world!")`);
  const [terminal, setTerminal] = useState(null);

  return (
    <CodeContext.Provider value={{ code, setCode }}>
      <TerminalContext.Provider value={{ terminal, setTerminal }}>
        {children}
      </TerminalContext.Provider>
    </CodeContext.Provider>
  );
}
