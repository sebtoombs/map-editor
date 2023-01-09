import type Konva from "konva";

export type Editor = {
  stage: Konva.Stage;
  gridLayer: Konva.Layer;
  indicatorLayer: Konva.Layer;
  hoverIndicator?: Konva.Rect;
};

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

export type TileSetWithHash = TileSet & { hash: string };

export type EditorToolTypes = "cursor" | "paint" | "select" | "fill";

export interface EditorSlice {
  scale: number;
  currentLayerId: number;
  selectedTool: EditorToolTypes;
  selectedTiles?: {
    tileSetHash: string;
    tileIndices: number[];
  };
  tilesetImages: FileWithData[];
  computed: {
    tileSets: TileSetWithHash[];
  };
  setScale: (scale: number) => void;
  setSelectedTool: (tool: EditorToolTypes) => void;
  setSelectedTiles: (tileSetHash: string, tileIndices: number[]) => void;
  setMapWidth: (mapWidth: number) => void;
  setMapHeight: (mapHeight: number) => void;
  setTileWidth: (tileWidth: number) => void;
  setTileHeight: (tileHeight: number) => void;
  addLayer: (layer?: Partial<TileMapLayer>) => void;
  addTileSet: (newTileSetData: NewTileSetData) => void;
  updateTileSet: (hash: string, newTileSetData: Partial<TileSet>) => void;
  deleteTileSet: (tileSet: TileSet) => void;
}

export interface TileMapLayer {
  id: number;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  type: "tilelayer" | "objectlayer" | "imagelayer" | "group"; // Only tiles supported for now
  data: number[];
  opacity: number;
  visible: boolean;
  layers?: TileMapLayer[];
}

export interface TileSet {
  name: string;
  image: string;
  tileheight: number;
  tilewidth: number;
  imageheight: number;
  imagewidth: number;
  firstgid: number;
  margin: number;
  spacing: number;
  columns: number;
  tilecount: number;
}

export type TileMap = {
  height: number;
  width: number;
  tilewidth: number;
  tileheight: number;
  orientation: "orthogonal"; // | "isometric" | "staggered" | "hexagonal";
  renderorder: "right-down"; // | "right-up" | "left-down" | "left-up";
  layers: TileMapLayer[];
  tilesets: TileSet[];
  nextlayerid: number;
  nextobjectid: number; // Unused so far?
};

export interface MapSlice {
  map: TileMap;
}

export type StoreState = EditorSlice & MapSlice;
