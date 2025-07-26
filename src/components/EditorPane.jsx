import React from "react";
import Editor from "@monaco-editor/react";
import "./EditorPane.css";

export default function EditorPane({ value, onCodeChange, readOnly = false }) {
  return (
    <div className="editor-pane">
      <Editor
        height="100%"
        language="python"
        theme="vs-dark"
        value={value}
        onChange={(value) => {
          if (!readOnly) onCodeChange?.(value || "");
        }}
        options={{
          readOnly,
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
