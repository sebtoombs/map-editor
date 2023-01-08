import { FileWithData, TileSet } from "../types";

export function lookupImageByTileSet(
  images: FileWithData[],
  tileset: TileSet
): FileWithData | undefined {
  return images.find((image) => image.file.name === tileset.image);
}
