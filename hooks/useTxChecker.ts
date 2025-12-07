"use client";

import { useCallback, useState } from "react";
import { useIotaClient } from "@iota/dapp-kit";
import type { IotaObjectData } from "@iota/iota-sdk/client";

const TICKET_TYPE_SUFFIX = "::ticket::Ticket";

interface TicketSnapshot {
  id: string;
  owner: string;
  eventId: number;
  price: number;
  used: boolean;
  version?: string | number;
}

interface TxCheckResult {
  digest: string;
  status: string;
  checkpoint?: string | null;
  timestampMs?: number;
  ticketId?: string | null;
  ticket?: TicketSnapshot | null;
}

function extractTicketIdFromObjectChanges(changes: unknown): string | null {
  if (!Array.isArray(changes)) return null;
  for (const change of changes) {
    const typed = change as Record<string, unknown>;
    const objectType = typed.objectType || typed.type;
    if (
      typeof objectType === "string" &&
      objectType.includes(TICKET_TYPE_SUFFIX)
    ) {
      const objId = typed.objectId || typed.object_id;
      if (typeof objId === "string") return objId;
    }
  }
  return null;
}

function extractTicketIdFromEffects(effects: unknown): string | null {
  const created = (effects as any)?.created;
  if (!Array.isArray(created)) return null;
  for (const entry of created) {
    const typeName =
      entry?.owner?.structType ||
      entry?.reference?.owner?.structType ||
      entry?.type ||
      entry?.reference?.type ||
      entry?.reference?.objectType;
    if (typeof typeName === "string" && typeName.includes(TICKET_TYPE_SUFFIX)) {
      const objId = entry?.reference?.objectId || entry?.reference?.object_id;
      if (typeof objId === "string") return objId;
    }
  }
  const fallback = created[0]?.reference?.objectId;
  return typeof fallback === "string" ? fallback : null;
}

function parseTicket(
  data: IotaObjectData | undefined,
  ticketId: string
): TicketSnapshot | null {
  if (!data || data.content?.dataType !== "moveObject") return null;
  const fields = data.content.fields as Record<string, unknown>;
  if (!fields) return null;
  return {
    id: ticketId,
    owner: String(fields.owner ?? ""),
    eventId: Number(fields.event_id ?? fields.eventId ?? 0),
    price: Number(fields.price ?? 0),
    used: Boolean(fields.used),
    version: (data as any).version,
  };
}

export function useTxChecker() {
  const iotaClient = useIotaClient();
  const [result, setResult] = useState<TxCheckResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkTransaction = useCallback(
    async (digestInput: string) => {
      const trimmed = digestInput.trim();
      if (!trimmed) {
        setError(new Error("Transaction id is required"));
        setResult(null);
        return;
      }

      setIsChecking(true);
      setError(null);
      setResult(null);

      try {
        const tx = await iotaClient.getTransactionBlock({
          digest: trimmed,
          options: {
            showEffects: true,
            showEvents: true,
            showInput: true,
            showBalanceChanges: true,
            showObjectChanges: true,
          },
        });

        const ticketId =
          extractTicketIdFromObjectChanges((tx as any).objectChanges) ||
          extractTicketIdFromEffects((tx as any).effects);

        let ticket: TicketSnapshot | null = null;
        if (ticketId) {
          const ticketObj = await iotaClient.getObject({
            id: ticketId,
            options: { showContent: true, showOwner: true },
          });
          ticket = parseTicket(
            ticketObj.data as IotaObjectData | undefined,
            ticketId
          );
        }

        setResult({
          digest: (tx as any).digest ?? trimmed,
          status: (tx as any).effects?.status?.status ?? "unknown",
          checkpoint: (tx as any).checkpoint ?? null,
          timestampMs: (tx as any).timestampMs
            ? Number((tx as any).timestampMs)
            : undefined,
          ticketId: ticketId ?? null,
          ticket,
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsChecking(false);
      }
    },
    [iotaClient]
  );

  return { result, error, isChecking, checkTransaction };
}
