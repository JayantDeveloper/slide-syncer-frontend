import React, { useContext, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { CodeContext } from "../context";
import "./EditorPane.css";

export default function EditorPane({ onCodeChange }) {
  const { code, setCode } = useContext(CodeContext);

  useEffect(() => {
    if (onCodeChange) {
      onCodeChange(code);
    }
  }, [code, onCodeChange]);

  return (
    <div className="editor-pane">
      <Editor
        height="100%"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 20,
          fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        }}
      />
    </div>
  );
}
