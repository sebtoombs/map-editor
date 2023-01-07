import { StateCreator } from "zustand";
import produce from "immer";
import { StoreState } from "./store";
import {
  TileMapLayer,
  TileSet,
  newTileMapLayer,
  newTileSet,
} from "./map-slice";
import { getImageDimensions } from "../utils/file";

export type MapDimensions = {
  mapWidth: number;
  mapHeight: number;
};

export type TileDimensions = {
  tileWidth: number;
  tileHeight: number;
};

export type EditorDimensions = MapDimensions & TileDimensions;

export type FileWithData = {
  file: File;
  data: string;
};

export type NewTileSetData = {
  file: FileWithData;
  tileWidth: number;
  tileHeight: number;
  imageWidth: number;
  imageHeight: number;
};

export interface EditorSlice {
  scale: number;
  currentLayerId: number;
  tilesetImages: FileWithData[];
  setScale: (scale: number) => void;
  setMapWidth: (mapWidth: number) => void;
  setMapHeight: (mapHeight: number) => void;
  setTileWidth: (tileWidth: number) => void;
  setTileHeight: (tileHeight: number) => void;
  addLayer: (layer?: Partial<TileMapLayer>) => void;
  addTileSet: (newTileSetData: NewTileSetData) => void;
  deleteTileSet: (tileSet: TileSet) => void;
}

export const createEditorSlice: StateCreator<
  StoreState,
  [],
  [],
  EditorSlice
> = (set, get) => ({
  scale: 1,
  currentLayerId: 1,
  tilesetImages: [],
  setScale: (scale) =>
    set(
      produce((state) => {
        if (scale > 0) {
          state.scale = scale;
        }
      })
    ),
  setMapWidth: (mapWidth) =>
    set(
      produce((state) => {
        state.map.width = mapWidth;
      })
    ),
  setMapHeight: (mapHeight) =>
    set(
      produce((state) => {
        state.map.height = mapHeight;
      })
    ),
  setTileWidth: (tileWidth) =>
    set(
      produce((state) => {
        state.map.tilewidth = tileWidth;
      })
    ),
  setTileHeight: (tileHeight) =>
    set(
      produce((state) => {
        state.map.tileheight = tileHeight;
      })
    ),
  selectLayer: (newLayerIndex: EditorSlice["currentLayerId"]) =>
    set(
      produce((state) => {
        if (newLayerIndex >= 0 && newLayerIndex < state.layers.length)
          state.currentLayerIndex = newLayerIndex;
      })
    ),
  addLayer: (layer = {}) =>
    set(
      produce((state) => {
        const nextLayerId = state.map.nextlayerid;
        const newLayer = newTileMapLayer({
          ...layer,
          id: nextLayerId,
        });
        state.map.layers.push(newLayer);
        state.map.nextlayerid = nextLayerId + 1;
      })
    ),
  addTileSet: ({
    file,
    tileWidth,
    tileHeight,
    imageWidth,
    imageHeight,
  }: NewTileSetData) =>
    set(
      produce((state) => {
        state.map.tilesets.push(
          newTileSet({
            tilewidth: tileWidth,
            tileheight: tileHeight,
            imagewidth: imageWidth,
            imageheight: imageHeight,
            image: file.file.name,
            name: file.file.name,
          })
        );

        state.tilesetImages.push(file);
      })
    ),
  deleteTileSet: (tileSet: TileSet) =>
    set(
      produce((state) => {
        state.map.tilesets = state.map.tilesets.filter(
          (ts: TileSet) => JSON.stringify(ts) !== JSON.stringify(tileSet)
        );

        state.tilesetImages = state.tilesetImages.filter(
          (tileSetImage: FileWithData) =>
            tileSetImage.file.name !== tileSet.image
        );
      })
    ),
});
