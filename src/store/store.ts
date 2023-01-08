import create from "zustand";
import { StoreState } from "../types";

import { createEditorSlice } from "./editor-slice";
import { createMapSlice } from "./map-slice";

const logger = (f, name) => (set, get, store) => {
  type T = ReturnType<typeof f>;
  const loggedSet: typeof set = (...a) => {
    set(...a);
    console.log(...(name ? [`${name}:`] : []), get());
  };
  store.setState = loggedSet;

  return f(loggedSet, get, store);
};

export const useStore = create<StoreState>(
  logger((...a) => ({
    ...createMapSlice(...a),
    ...createEditorSlice(...a),
  }))
);
