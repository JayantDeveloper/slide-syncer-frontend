import { useEffect, useRef } from "react";
import { BACKEND_BASE_URL } from "../config";

/**
 * Opens a WebSocket connection for the given session, joins it, and dispatches
 * incoming messages to the provided handler.
 *
 * @param {string} sessionCode
 * @param {(data: object) => void} onMessage  Called with the parsed message object
 */
export function useSessionWebSocket(sessionCode, onMessage) {
  const wsRef = useRef(null);
  // Keep a stable ref to the latest handler so the effect doesn't re-run on
  // every render when the consumer passes an inline function.
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!sessionCode) return;

    const wsUrl = BACKEND_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "join", sessionCode }));
    ws.onmessage = (event) => {
      try {
        onMessageRef.current(JSON.parse(event.data));
      } catch (e) {
        console.error("WS parse error", e);
      }
    };
    ws.onerror = (e) => console.error("⚠️ WebSocket error:", e);
    ws.onclose = () => console.log("❌ WebSocket connection closed");

    return () => { try { ws.close(); } catch {} };
  }, [sessionCode]);

  return wsRef;
}
