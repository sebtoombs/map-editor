import create from "zustand";
import { StoreState } from "../types";

import { createEditorSlice } from "./editor-slice";
import { createMapSlice } from "./map-slice";

// @ts-ignore
const logger = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>;
  // @ts-ignore
  const loggedSet: typeof set = (...a) => {
    set(...a);
    console.log(...(name ? [`${name}:`] : []), get());
  };
  store.setState = loggedSet;

  return f(loggedSet, get, store);
};

export const useStore = create<StoreState>(
  // @ts-ignore
  logger((...a) => ({
    // @ts-ignore
    ...createMapSlice(...a),
    // @ts-ignore
    ...createEditorSlice(...a),
  }))
);
