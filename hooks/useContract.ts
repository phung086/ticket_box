"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
  useIotaClientQuery,
} from "@iota/dapp-kit";
import { Transaction } from "@iota/iota-sdk/transactions";
import { useNetworkVariable } from "@/lib/config";
import type { IotaObjectData } from "@iota/iota-sdk/client";

const MODULE = "ticket";
const METHODS = {
  CREATE_BOX: "create_box",
  BUY_TICKET: "buy_ticket",
  USE_TICKET: "use_ticket",
} as const;

interface TicketBoxData {
  eventId: number;
  total: number;
  sold: number;
  price: number;
}

interface ContractState {
  isLoading: boolean;
  isPending: boolean;
  isConfirmed: boolean;
  hash?: string;
  error: Error | null;
}

interface ContractActions {
  createBox: (
    eventId: number,
    total: number,
    price: number
  ) => Promise<string | undefined>;
  buyTicket: (boxId: string) => Promise<string | undefined>;
  useTicket: (ticketId: string) => Promise<string | undefined>;
  clearLocal: () => void;
}

function parseTicketBox(data: IotaObjectData): TicketBoxData | null {
  if (data.content?.dataType !== "moveObject") return null;
  const fields = data.content.fields as Record<string, unknown>;
  if (!fields) return null;
  try {
    return {
      eventId: Number(fields.event_id ?? fields.eventId ?? 0),
      total: Number(fields.total ?? 0),
      sold: Number(fields.sold ?? 0),
      price: Number(fields.price ?? 0),
    };
  } catch (err) {
    console.error("Failed to parse TicketBox fields", err);
    return null;
  }
}

function findCreatedObjectId(effects: any, typeSuffix: string): string | null {
  const created = effects?.created ?? [];
  for (const c of created) {
    const ty = c.owner?.objType || c.owner?.type || c.reference?.owner;
    const struct = c.owner?.structType || c.reference?.owner?.structType;
    const typeName = c.type || struct || ty || c.reference?.type;
    if (typeof typeName === "string" && typeName.includes(typeSuffix)) {
      return c.reference?.objectId ?? c.reference?.object_id ?? null;
    }
  }
  // Fallback: first created object
  return created[0]?.reference?.objectId ?? null;
}

export const useContract = () => {
  const account = useCurrentAccount();
  const address = account?.address;
  const packageId = useNetworkVariable("packageId");
  const iotaClient = useIotaClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [boxId, setBoxId] = useState<string | null>(() => {
    if (typeof window !== "undefined" && address) {
      return localStorage.getItem(`ticket_box_${address}`);
    }
    return null;
  });

  const [tickets, setTickets] = useState<string[]>(() => {
    if (typeof window !== "undefined" && address) {
      const raw = localStorage.getItem(`tickets_${address}`);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [hash, setHash] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Reload cached ids when account changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!address) {
      setBoxId(null);
      setTickets([]);
      return;
    }
    const cachedBox = localStorage.getItem(`ticket_box_${address}`);
    const cachedTickets = localStorage.getItem(`tickets_${address}`);
    setBoxId(cachedBox);
    if (cachedTickets) {
      try {
        setTickets(JSON.parse(cachedTickets));
      } catch {
        setTickets([]);
      }
    }
  }, [address]);

  const {
    data,
    isPending: isFetching,
    error: queryError,
    refetch,
  } = useIotaClientQuery(
    "getObject",
    { id: boxId!, options: { showContent: true, showOwner: true } },
    { enabled: !!boxId }
  );

  const boxData = useMemo(
    () => (data?.data ? parseTicketBox(data.data) : null),
    [data]
  );

  const persist = (newBoxId: string | null, newTickets: string[]) => {
    if (typeof window === "undefined" || !address) return;
    if (newBoxId) {
      localStorage.setItem(`ticket_box_${address}`, newBoxId);
    }
    localStorage.setItem(`tickets_${address}`, JSON.stringify(newTickets));
  };

  const createBox = async (eventId: number, total: number, price: number) => {
    if (!packageId) return undefined;
    setError(null);
    setHash(undefined);
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${MODULE}::${METHODS.CREATE_BOX}`,
      arguments: [tx.pure.u64(eventId), tx.pure.u64(total), tx.pure.u64(price)],
    });
    let txDigest: string | undefined;

    await new Promise<void>((resolve) => {
      signAndExecute(
        { transaction: tx as never },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            txDigest = digest;
            setIsLoading(true);
            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              });
              const createdId = findCreatedObjectId(effects, "TicketBox");
              if (createdId) {
                setBoxId(createdId);
                persist(createdId, tickets);
                await refetch();
              }
            } catch (err) {
              setError(err as Error);
            } finally {
              setIsLoading(false);
              resolve();
            }
          },
          onError: (err) => {
            setError(err as Error);
            resolve();
          },
        }
      );
    });
    return txDigest;
  };

  const buyTicket = async (targetBoxId: string) => {
    if (!packageId || !targetBoxId) return undefined;
    setError(null);
    setHash(undefined);
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${MODULE}::${METHODS.BUY_TICKET}`,
      arguments: [tx.object(targetBoxId)],
    });
    let txDigest: string | undefined;

    await new Promise<void>((resolve) => {
      signAndExecute(
        { transaction: tx as never },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            txDigest = digest;
            setIsLoading(true);
            try {
              const { effects } = await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              });
              const newTicketId = findCreatedObjectId(effects, "Ticket");
              if (newTicketId) {
                setTickets((prev) => {
                  const updated = [...prev, newTicketId];
                  persist(boxId ?? targetBoxId, updated);
                  return updated;
                });
              }
            } catch (err) {
              setError(err as Error);
            } finally {
              setIsLoading(false);
              resolve();
            }
          },
          onError: (err) => {
            setError(err as Error);
            resolve();
          },
        }
      );
    });
    return txDigest;
  };

  const useTicket = async (ticketId: string) => {
    if (!packageId || !ticketId) return undefined;
    setError(null);
    setHash(undefined);
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::${MODULE}::${METHODS.USE_TICKET}`,
      arguments: [tx.object(ticketId)],
    });
    let txDigest: string | undefined;

    await new Promise<void>((resolve) => {
      signAndExecute(
        { transaction: tx as never },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest);
            txDigest = digest;
            setIsLoading(true);
            try {
              await iotaClient.waitForTransaction({
                digest,
                options: { showEffects: true },
              });
            } catch (err) {
              setError(err as Error);
            } finally {
              setIsLoading(false);
              resolve();
            }
          },
          onError: (err) => {
            setError(err as Error);
            resolve();
          },
        }
      );
    });
    return txDigest;
  };

  const clearLocal = () => {
    setBoxId(null);
    setTickets([]);
    if (typeof window !== "undefined" && address) {
      localStorage.removeItem(`ticket_box_${address}`);
      localStorage.removeItem(`tickets_${address}`);
    }
  };

  const state: ContractState = {
    isLoading,
    isPending,
    isConfirmed: !!hash && !isLoading && !isPending,
    hash,
    error: error || (queryError as Error | null) || null,
  };

  const actions: ContractActions = {
    createBox,
    buyTicket,
    useTicket,
    clearLocal,
  };

  return {
    boxId,
    boxData,
    tickets,
    actions,
    state,
    isFetching,
  };
};
