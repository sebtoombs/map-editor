import create from "zustand";

import { createEditorSlice, EditorSlice } from "./editor-slice";
import { createMapSlice, MapSlice } from "./map-slice";

export const initialMapWidth = 30;
export const initialMapHeight = 30;
export const initialTileWidth = 32;
export const initialTileHeight = 32;
export const initialScale = 1;

export type StoreState = EditorSlice & MapSlice;

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
