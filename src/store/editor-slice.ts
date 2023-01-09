import { StateCreator } from "zustand";
import produce from "immer";
import {
  EditorSlice,
  FileWithData,
  NewTileSetData,
  StoreState,
  TileSet,
  TileSetWithHash,
} from "../types";
import { newTileMapLayer, newTileSet } from "./map-slice";

export const createEditorSlice: StateCreator<
  StoreState,
  [],
  [],
  EditorSlice
> = (set, get) => ({
  scale: 1,
  currentLayerId: 1,
  selectedTool: "cursor",
  selectedTiles: undefined,
  tilesetImages: [],
  computed: {
    // Tilesets aren't very unique, so we need to add a hash to them to make them unique for rendering etc
    get tileSets() {
      return (get()?.map?.tilesets || []).map((tileSet, index) => {
        const hash = JSON.stringify({ ...tileSet, index });
        return {
          ...tileSet,
          hash,
        };
      });
    },
  },

  setScale: (scale) =>
    set(
      produce((state) => {
        if (scale > 0) {
          state.scale = scale;
        }
      })
    ),
  setSelectedTool: (tool) =>
    set(
      produce((state) => {
        state.selectedTool = tool;
      })
    ),
  setSelectedTiles: (tileSetHash, tileIndices) =>
    set(
      produce((state) => {
        state.selectedTiles = {
          tileSetHash,
          tileIndices,
        };
      })
    ),

  paintTiles: (gridIndex) =>
    set(
      produce<StoreState>((state) => {
        const { selectedTiles, currentLayerId } = state;
        if (!selectedTiles) return;

        const { tileSetHash, tileIndices } = selectedTiles;
        const tileSet = state.computed.tileSets.find(
          (ts: TileSetWithHash) => ts.hash === tileSetHash
        );
        if (!tileSet) return;

        const layerIndex = state.map.layers.findIndex(
          (l) => l.id === currentLayerId
        );
        if (layerIndex === -1) return;

        tileIndices.forEach((tileIndex) => {
          const gid = tileSet.firstgid + tileIndex;
          state.map.layers[layerIndex].data[gridIndex] = gid;
        });
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
        // TODO need to calculate gid
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
        const nextGid = state.map.tilesets.reduce(
          (acc: number, ts: TileSet) => {
            const tsGid = ts.firstgid + ts.tilecount;
            return tsGid > acc ? tsGid : acc;
          },
          1
        );

        state.map.tilesets.push(
          newTileSet({
            tilewidth: tileWidth,
            tileheight: tileHeight,
            imagewidth: imageWidth,
            imageheight: imageHeight,
            image: file.file.name,
            name: file.file.name,
            firstgid: nextGid,
          })
        );

        state.tilesetImages.push(file);
      })
    ),
  updateTileSet: (hash, newTileSetData) =>
    set(
      produce((state) => {
        state.map.tilesets = state.map.tilesets.map(
          (ts: TileSet, index: number) => {
            const tsHash = JSON.stringify({ ...ts, index });
            if (tsHash === hash) {
              return { ...ts, ...newTileSetData };
            }
            return ts;
          }
        );
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
