import { defineStore } from "pinia";
import { reactive } from "vue";

export enum StatusReason {
  FAILED_TO_CONNECT = "failed_to_connect",
}

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export const useStatusStore = defineStore("status", () => {
  const input = reactive<{
    connection: ConnectionStatus;
    reasons: Set<StatusReason>;
  }>({
    connection: "idle",
    reasons: new Set(),
  });

  return {
    input,
  };
});
