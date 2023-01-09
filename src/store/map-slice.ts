import { StateCreator } from "zustand";
import {
  initialMapHeight,
  initialMapWidth,
  initialTileHeight,
  initialTileWidth,
} from "../constants";
import { MapSlice, StoreState, TileMap, TileMapLayer, TileSet } from "../types";

export function newTileMapLayer(
  tileMapLayerProperties: Partial<TileMapLayer> = {}
) {
  const type = tileMapLayerProperties.type || "tilelayer";
  const id = tileMapLayerProperties.id || 1;

  const defaultName = () => {
    const typeSplit = type.split("layer");
    let tempName = typeSplit.length > 1 ? `${typeSplit.at(0)} Layer` : type;
    tempName =
      tempName.charAt(0).toUpperCase() + tempName.slice(1).toLowerCase();
    tempName = `${tempName} ${id}`;
    return tempName;
  };

  const name = tileMapLayerProperties.name || defaultName();

  const newInstance: TileMapLayer = {
    width: initialMapWidth,
    height: initialMapHeight,
    x: 0,
    y: 0,
    type: "tilelayer",
    data: [],
    opacity: 1,
    visible: true,
    ...tileMapLayerProperties,
    name,
    id,
  };

  newInstance.data = newInstance.data?.length
    ? newInstance.data
    : new Array(newInstance.width * newInstance.height).fill(0);
  return newInstance;
}

export function newTileSet(tileSetProperties: Partial<TileSet> = {}): TileSet {
  return {
    name: "New Tile Set",
    image: "",
    tileheight: initialTileHeight,
    tilewidth: initialTileWidth,
    imageheight: 0,
    imagewidth: 0,
    firstgid: 1,
    margin: 0,
    spacing: 0,
    ...tileSetProperties,
    get columns() {
      return Math.floor(this.imagewidth / this.tilewidth);
    },
    get tilecount() {
      return Math.floor(this.imageheight / this.tileheight) * this.columns; // reuse the columns property
    },
  };
}

// public findLayerById(
//     id: number,
//     node: TileMap | TileMapLayer = this
//   ): TileMapLayer | undefined {
//     const searchLayers = node.layers || [];
//     if (!searchLayers.length) return undefined;

//     let layer: TileMapLayer | undefined = undefined;
//     for (let i = 0; i < (searchLayers?.length || 0); i++) {
//       const testLayer = searchLayers[i];
//       if (testLayer.id === id) {
//         layer = searchLayers[i];
//         break;
//       }

//       const isGroup =
//         testLayer.type === "group" && (testLayer.layers?.length || 0) > 0;
//       if (isGroup) {
//         layer = this.findLayerById(id, testLayer);
//         if (layer) {
//           break;
//         }
//       }
//     }
//     return layer;
//   }

export function newTileMap(): TileMap {
  const tileMap: TileMap = {
    height: initialMapHeight,
    width: initialMapWidth,
    tilewidth: initialTileWidth,
    tileheight: initialTileHeight,
    orientation: "orthogonal",
    renderorder: "right-down",
    layers: [],
    tilesets: [],
    nextlayerid: 1,
    nextobjectid: 1,
  };
  tileMap.layers.push(
    newTileMapLayer({
      id: tileMap.nextlayerid,
    })
  );
  tileMap.nextlayerid += 1;
  return tileMap;
}

export const createMapSlice: StateCreator<
  StoreState,
  [],
  [],
  MapSlice
> = () => ({
  map: newTileMap(),
});
