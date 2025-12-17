import { defineStore } from "pinia";
import { reactive } from "vue";

export enum StatusReason {
  FAILED_TO_CONNECT = "failed_to_connect",
  INVALID_CONFIG = "invalid_config",
  DISABLED = "disabled",
}

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export const useStatusStore = defineStore("status", () => {
  const input = reactive<{
    connection: ConnectionStatus;
    reasons: StatusReason[];
  }>({
    connection: "idle",
    reasons: [],
  });

  const output = reactive<{
    connection: ConnectionStatus;
    reasons: StatusReason[];
  }>({
    connection: "idle",
    reasons: [],
  });

  return {
    input,
    output,
  };
});
