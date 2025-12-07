"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useTxChecker } from "@/hooks/useTxChecker";

const cardStyle: CSSProperties = {
  background: "#0f1729",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #1e293b",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#0b1220",
  borderRadius: "10px",
  border: "1px solid #1f2937",
  color: "#e2e8f0",
  outline: "none",
  marginBottom: "12px",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #2563eb, #22d3ee)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

export default function VerifierPage() {
  const [txId, setTxId] = useState("");
  const { result, error, isChecking, checkTransaction } = useTxChecker();

  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (error.message.toLowerCase().includes("not found")) {
      return "ID giao dich khong ton tai hoac chua duoc index";
    }
    return error.message;
  }, [error]);

  const handleCheck = async () => {
    await checkTransaction(txId);
  };

  const formatTs = (ts?: number) => {
    if (!ts) return "-";
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <main
      style={{ minHeight: "100vh", background: "#0b1020", color: "#e2e8f0" }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800 }}>
            Ticket Transaction Verifier
          </h1>
          <p style={{ color: "#94a3b8", marginTop: "6px" }}>
            Enter the transaction digest to check if the transaction exists and
            the ticket status. You can run this tab separately using the script
            `npm run dev:verifier` (port 3001).
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              Check Transaction
            </h3>
            <input
              style={inputStyle}
              placeholder="Enter transaction digest"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              spellCheck={false}
            />
            <button
              style={buttonStyle}
              onClick={handleCheck}
              disabled={isChecking}
            >
              {isChecking ? "EChecking..." : "Check transaction"}
            </button>
            {errorMessage && (
              <div
                style={{
                  color: "#fca5a5",
                  marginTop: "12px",
                  fontSize: "13px",
                }}
              >
                {errorMessage}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              Ket qua
            </h3>
            {!result && !isChecking ? (
              <div style={{ color: "#94a3b8", fontSize: "13px" }}>
                no results yet
              </div>
            ) : null}

            {result && (
              <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ color: "#94a3b8" }}>Digest</div>
                  <div style={{ wordBreak: "break-all" }}>{result.digest}</div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <InfoRow
                    label="Trang thai"
                    value={result.status}
                    highlight={result.status === "success"}
                  />
                  <InfoRow
                    label="Checkpoint"
                    value={result.checkpoint ?? "-"}
                  />
                  <InfoRow
                    label="Timestamp"
                    value={formatTs(result.timestampMs)}
                  />
                  <InfoRow
                    label="Ticket id"
                    value={result.ticketId ?? "DOn't create ticket"}
                  />
                </div>

                {result.ticket && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "12px",
                      borderRadius: "12px",
                      background: "#0b1220",
                      border: "1px solid #1f2937",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "8px" }}>
                      Thong tin ve
                    </div>
                    <InfoRow label="Owner" value={result.ticket.owner} />
                    <InfoRow
                      label="Event"
                      value={String(result.ticket.eventId)}
                    />
                    <InfoRow
                      label="Price"
                      value={String(result.ticket.price)}
                    />
                    <InfoRow
                      label="Used"
                      value={result.ticket.used ? "Used" : "Not used"}
                    />
                  </div>
                )}

                {result.ticketId && !result.ticket && (
                  <div style={{ marginTop: "12px", color: "#fbbf24" }}>
                    found ticket but no content from node
                  </div>
                )}
              </div>
            )}

            {isChecking && (
              <div style={{ color: "#94a3b8", marginTop: "10px" }}>
                Calling RPC ...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div style={{ color: "#94a3b8" }}>{label}</div>
      <div
        style={{
          wordBreak: "break-all",
          color: highlight ? "#34d399" : "#e2e8f0",
          fontWeight: highlight ? 700 : 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}
