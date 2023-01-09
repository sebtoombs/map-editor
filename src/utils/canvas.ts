import { Vector2d } from "konva/lib/types";
import { Editor, EditorDimensions, TileDimensions } from "../types";

// Snap an x,y coord to the closest (left, top) grid point
export const snapToGrid = (
  { x, y }: { x: number; y: number },
  { gridX, gridY }: { gridX: number; gridY: number }
) => ({
  x: Math.floor(Math.floor(x / gridX) * gridX),
  y: Math.floor(Math.floor(y / gridY) * gridY),
});

export const mapCoordsToIndex = (
  { x, y }: { x: number; y: number },
  {
    gridColumns,
    gridX,
    gridY,
  }: { gridColumns: number; gridX: number; gridY: number }
) => {
  const { x: snappedX, y: snappedY } = snapToGrid({ x, y }, { gridX, gridY });

  const index = Math.round((snappedY / gridY) * gridColumns + snappedX / gridX);
  return index;
};

export const mapIndexToCoords = (
  index: number,
  {
    gridColumns,
    gridX,
    gridY,
  }: { gridColumns: number; gridX: number; gridY: number }
) => {
  const x = (index % gridColumns) * gridX;
  const y = Math.floor(index / gridColumns) * gridY;
  return { x, y };
};

export const getScaledPosition = (
  editor: Editor,
  inputPosition?: Vector2d
): Vector2d | null => {
  let position: Vector2d | null = inputPosition || null;
  if (!position) position = editor.stage.getPointerPosition();
  if (!position) return null;

  const scaledPosition = {
    x: position.x / editor.stage.scaleX(),
    y: position.y / editor.stage.scaleY(),
  };

  return scaledPosition;
};

export const calculateStageSize = ({
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
}: EditorDimensions) => ({
  width: mapWidth * tileWidth + 1,
  height: mapHeight * tileHeight + 1,
});

export const setStageSize = (
  editor: Editor,
  { mapWidth, mapHeight, tileWidth, tileHeight }: EditorDimensions
) => {
  const { width, height } = editor.stage.size();
  const { width: newWidth, height: newHeight } = calculateStageSize({
    mapWidth,
    mapHeight,
    tileWidth,
    tileHeight,
  });
  if (width !== newWidth || height !== newHeight) {
    editor.stage.width(newWidth);
    editor.stage.height(newHeight);
  }
};
