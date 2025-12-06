"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { WalletConnect } from "@/components/Wallet-connect";
import { useContract } from "@/hooks/useContract";
import { useCurrentAccount } from "@iota/dapp-kit";

const cardStyle = {
  background: "#0f1729",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #1e293b",
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

export default function Home() {
  const account = useCurrentAccount();
  const { actions, boxId, boxData, tickets, state } = useContract();

  const [eventId, setEventId] = useState("1");
  const [total, setTotal] = useState("100");
  const [price, setPrice] = useState("10");
  const [boxInput, setBoxInput] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [activity, setActivity] = useState<string[]>([]);

  const appendActivity = (msg: string) => {
    setActivity((prev) => [msg, ...prev].slice(0, 6));
  };

  const handleCreate = async () => {
    const digest = await actions.createBox(
      Number(eventId),
      Number(total),
      Number(price)
    );
    if (digest) appendActivity(`Create box tx: ${digest}`);
  };

  const handleBuy = async () => {
    const target = boxInput || boxId;
    if (!target) {
      appendActivity("Buy failed: box id required");
      return;
    }
    const digest = await actions.buyTicket(target);
    if (digest) appendActivity(`Buy tx: ${digest}`);
  };

  const handleUse = async () => {
    const target = ticketInput || tickets[0];
    if (!target) {
      appendActivity("Use failed: ticket id required");
      return;
    }
    const digest = await actions.useTicket(target);
    if (digest) appendActivity(`Use tx: ${digest}`);
  };

  const connected = !!account;

  return (
    <main
      style={{ minHeight: "100vh", background: "#0b1020", color: "#e2e8f0" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "12px",
          }}
        >
          <WalletConnect />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h2 style={{ fontSize: "22px", fontWeight: 700 }}>Ticket Box</h2>
              <span style={{ fontSize: "12px", color: "#93c5fd" }}>
                {connected
                  ? `Connected ${account?.address.slice(
                      0,
                      6
                    )}...${account?.address.slice(-4)}`
                  : "Not connected"}
              </span>
            </div>
            <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
              Create a box, sell tickets, and mark them used. Wire your wallet
              SDK + chain client inside the contract hook.
            </p>

            <label
              style={{
                display: "block",
                fontSize: "14px",
                marginBottom: "6px",
              }}
            >
              Event ID
            </label>
            <input
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={inputStyle}
              type="number"
            />

            <label
              style={{
                display: "block",
                fontSize: "14px",
                marginTop: "12px",
                marginBottom: "6px",
              }}
            >
              Total supply
            </label>
            <input
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              style={inputStyle}
              type="number"
            />

            <label
              style={{
                display: "block",
                fontSize: "14px",
                marginTop: "12px",
                marginBottom: "6px",
              }}
            >
              Price (units)
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
              type="number"
            />

            <button
              style={primaryButton}
              onClick={handleCreate}
              disabled={!connected || state.isPending || state.isLoading}
            >
              {state.isLoading ? "Processing..." : "Create Box"}
            </button>

            {boxId && (
              <div
                style={{
                  marginTop: "14px",
                  fontSize: "12px",
                  color: "#93c5fd",
                  wordBreak: "break-all",
                }}
              >
                Box ID: {boxId}
              </div>
            )}

            {boxData && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "#cbd5e1",
                }}
              >
                <div>Event: {boxData.eventId}</div>
                <div>
                  Supply: {boxData.sold} / {boxData.total}
                </div>
                <div>Price: {boxData.price}</div>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Buy Ticket
              </h3>
              <input
                placeholder="TicketBox object id"
                value={boxInput}
                onChange={(e) => setBoxInput(e.target.value)}
                style={inputStyle}
              />
              <button
                style={secondaryButton}
                onClick={handleBuy}
                disabled={!connected || state.isPending || state.isLoading}
              >
                Buy Ticket
              </button>
            </div>

            <div style={{ marginTop: "22px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                My Tickets
              </h3>
              {tickets.length === 0 ? (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    padding: "10px",
                    background: "#111827",
                    borderRadius: "10px",
                  }}
                >
                  No tickets yet
                </div>
              ) : (
                <ul
                  style={{
                    fontSize: "13px",
                    color: "#cbd5e1",
                    padding: "10px",
                    background: "#111827",
                    borderRadius: "10px",
                    listStyle: "none",
                    margin: 0,
                  }}
                >
                  {tickets.map((t) => (
                    <li
                      key={t}
                      style={{ wordBreak: "break-all", marginBottom: "6px" }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <input
                placeholder="Ticket object id"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                style={{ ...inputStyle, marginTop: "10px" }}
              />
              <button
                style={secondaryButton}
                onClick={handleUse}
                disabled={!connected || state.isPending || state.isLoading}
              >
                Mark as Used
              </button>
            </div>

            <div style={{ marginTop: "22px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                Activity
              </h3>
              <div
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                  background: "#0f1729",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  padding: "10px",
                  minHeight: "80px",
                }}
              >
                {state.hash && (
                  <div style={{ marginBottom: "6px", wordBreak: "break-all" }}>
                    Last tx: {state.hash}
                  </div>
                )}
                {state.error && (
                  <div style={{ color: "#f87171" }}>
                    Error: {state.error.message}
                  </div>
                )}
                {activity.length === 0 && !state.hash ? (
                  <div style={{ color: "#94a3b8" }}>No activity yet</div>
                ) : null}
                {activity.map((a, idx) => (
                  <div key={idx} style={{ wordBreak: "break-all" }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#0b1220",
  borderRadius: "10px",
  border: "1px solid #1f2937",
  color: "#e2e8f0",
  outline: "none",
  marginBottom: "6px",
};

const primaryButton: CSSProperties = {
  width: "100%",
  marginTop: "14px",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #4f46e5, #22d3ee)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton: CSSProperties = {
  width: "100%",
  marginTop: "10px",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #2563eb, #22d3ee)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
