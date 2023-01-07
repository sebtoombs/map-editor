import { FileWithData } from "../store/editor-slice";
import { TileSet } from "../store/map-slice";

export function lookupImageByTileSet(
  images: FileWithData[],
  tileset: TileSet
): FileWithData | undefined {
  return images.find((image) => image.file.name === tileset.image);
}
