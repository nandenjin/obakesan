import { StoreState } from "pinia";
import { useConfigStore } from "./config";
import { useDmxStore } from "./dmx";
import { useStatusStore } from "./status";

export type SS = {
  config: StoreState<typeof useConfigStore>;
  dmx: StoreState<typeof useDmxStore>;
  status: StoreState<typeof useStatusStore>;
};
