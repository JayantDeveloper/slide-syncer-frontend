import React, { useEffect, useRef, useContext } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { TerminalContext } from "../context";
import "xterm/css/xterm.css";
import "./TerminalPane.css";

export default function TerminalPane({ onOutputChange }) {
  const containerRef = useRef(null);
  const { setTerminal } = useContext(TerminalContext);

  useEffect(() => {
    if (containerRef.current) {
      const term = new Terminal({
        fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        fontSize: 14,
        cursorStyle: "bar",
        cursorBlink: false,
        disableStdin: true,
        theme: {
          background: "#1e1e1e",
          cursor: "transparent"
        }
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(containerRef.current);

      try {
        requestAnimationFrame(() => fitAddon.fit());
      } catch (e) {
        console.warn("Fit error:", e);
      }

      setTerminal(term);

      term.writeIntercept = term.writeln;
      term.writeln = (text) => {
        term.writeIntercept(text);
        if (onOutputChange) onOutputChange(text); 
      };

      // Debounced resize handler
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          try {
            requestAnimationFrame(() => fitAddon.fit());
          } catch (e) {
            console.warn("Resize fit error:", e);
          }
        }, 100);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(resizeTimeout);
        term.dispose();
      };
    }
  }, [setTerminal, onOutputChange]);

  return <div className="terminal-pane" ref={containerRef} />;
}
