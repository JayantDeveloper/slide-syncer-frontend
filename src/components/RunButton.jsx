import React, { useContext, useEffect, useCallback } from "react";
import { TerminalContext } from "../context";
import "./RunButton.css";
import { BACKEND_BASE_URL } from "../config";

const DEFAULT_LANGUAGE = "python";

export default function RunButton({ code, onOutput }) {
  const { terminal } = useContext(TerminalContext);

  const safeScroll = useCallback(() => {
    if (!terminal) return;
    try {
      setTimeout(() => {
        terminal.scrollToBottom();
        terminal.refresh(0, terminal.rows - 1);
      }, 0);
    } catch (e) {
      console.warn("Scroll failed:", e);
    }
  }, [terminal]);

  useEffect(() => {
    if (terminal) {
      terminal.writeln('Terminal ready. Click "Run" to execute.');
      safeScroll();
    }
  }, [terminal, safeScroll]);

  const writeLinesToTerminal = (lines) => {
    if (!terminal) return;
    lines.forEach((line) => terminal.writeln(line));
    safeScroll();
  };

  const runCode = async () => {
    if (!terminal) return;

    if (!code || code.trim() === "") {
      terminal.writeln("No code to run.");
      safeScroll();
      return;
    }

    terminal.reset(); // Full clear
    terminal.writeln(">>> Running...");
    safeScroll();

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: DEFAULT_LANGUAGE }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const baseOutput = data.output || "No output.";
      const fullOutput = `${baseOutput.trim()}\n✔ Done`;
      const lines = fullOutput.split("\n");

      terminal.reset();
      writeLinesToTerminal([...lines.slice(0, -1), "\x1b[32m✔ Done\x1b[0m"]);

      if (onOutput) {
        onOutput(fullOutput);
      }
    } catch (err) {
      terminal.writeln("Error: " + err.message);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        terminal.writeln(`Make sure the backend server is up at ${BACKEND_BASE_URL}`);
      }
      safeScroll();
    }
  };

  return (
    <button className="run-button" onClick={runCode} disabled={!terminal}>
      Run
    </button>
  );
}
