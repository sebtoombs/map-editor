import { Box } from "@chakra-ui/react";
import Konva from "konva";
import { KonvaEventListener } from "konva/lib/Node";
import { Stage, StageConfig } from "konva/lib/Stage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialMapHeight,
  initialMapWidth,
  initialScale,
  initialTileHeight,
  initialTileWidth,
} from "../constants";
import { useStore } from "../store/store";
import {
  Editor,
  FileWithData,
  TileDimensions,
  TileMap,
  TileSet,
} from "../types";
import {
  calculateStageSize,
  getScaledPosition,
  mapCoordsToIndex,
  mapIndexToCoords,
  setStageSize,
  snapToGrid,
} from "../utils/canvas";
import { lookupImageByTileSet } from "../utils/tileset";

const getTilesetFromGid = (gid: number, tilesets: TileSet[]) =>
  tilesets.find(
    (tileset) =>
      gid >= tileset.firstgid && gid < tileset.firstgid + tileset.tilecount
  );

const imageCache = new Map<string, HTMLImageElement>();

const getImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
    }
    const image = new Image();
    image.onload = () => {
      imageCache.set(src, image);
      resolve(image);
    };
    image.onerror = () => {
      reject();
    };
    image.src = src;
  });

const drawTiles = (
  editor: Editor,
  map: TileMap,
  tilesetImages: FileWithData[]
) => {
  editor.imageLayer.removeChildren();
  map.layers.forEach((layer) => {
    layer.data
      .map((gid, index) => [gid, index])
      .filter(([gid]) => gid > 0)
      .forEach(async ([gid, gridIndex]) => {
        if (gid === 0) return;
        const tileset = getTilesetFromGid(gid, map.tilesets);
        if (!tileset) return;
        const tilesetImage = lookupImageByTileSet(tilesetImages, tileset);
        if (!tilesetImage) return;

        const { x, y } = mapIndexToCoords(gridIndex, {
          gridColumns: map.width,
          gridX: map.tilewidth,
          gridY: map.tileheight,
        });

        const tileIndex = gid - tileset.firstgid;

        const tileCoordinates = mapIndexToCoords(tileIndex, {
          gridColumns: tileset.columns,
          gridX: tileset.tilewidth,
          gridY: tileset.tileheight,
        });

        // TODO tileset spacing, margin
        const tile = new Konva.Image({
          x,
          y,
          image: await getImage(tilesetImage.data),
          width: map.tilewidth,
          height: map.tileheight,

          // offsetX: tilesetOffsetX,
          // offsetY: tilesetOffsetY,
          crop: {
            x: tileCoordinates.x,
            y: tileCoordinates.y,
            width: tileset.tilewidth,
            height: tileset.tileheight,
          },
        });

        // add the shape to the layer
        editor.imageLayer.add(tile);
      });
  });
};

const drawGrid = (
  editor: Editor,
  { tileWidth, tileHeight }: TileDimensions
) => {
  const { width, height } = editor.stage.size();
  editor.gridLayer.removeChildren();

  const isFirstLine = (i: number) => i === 0;
  const isLastLine = (i: number, dimension: number) => i === dimension - 1;
  const isReferenceLine = (i: number) => (i / tileWidth) % 10 === 0;

  const lineConfig = (i: number, direction: "v" | "h") => {
    const isFirstOrLastLine =
      isFirstLine(i) || isLastLine(i, direction === "v" ? width : height);

    return {
      stroke: "#F7FAFC",
      opacity: isFirstOrLastLine || isReferenceLine(i) ? 0.5 : 0.2,
      strokeWidth: 1,
      dash: isFirstOrLastLine ? undefined : [4, 2],
    };
  };

  for (let i = 0; i < width; i += tileWidth) {
    editor.gridLayer.add(
      new Konva.Line({
        ...lineConfig(i, "v"),
        points: [i, 0, i, height],
      })
    );
  }
  for (let i = 0; i < height; i += tileHeight) {
    editor.gridLayer.add(
      new Konva.Line({
        ...lineConfig(i, "h"),
        points: [0, i, width, i],
      })
    );
  }
};

const drawHoverIndicator = (
  editor: Editor,
  { tileWidth, tileHeight }: TileDimensions
) => {
  const pointerPosition = editor.stage.getPointerPosition();

  if (!pointerPosition) return;

  const scaledPosition = getScaledPosition(editor, pointerPosition);
  if (!scaledPosition) return;

  const snappedPosition = snapToGrid(scaledPosition, {
    gridX: tileWidth,
    gridY: tileHeight,
  });

  if (!editor.hoverIndicator) {
    editor.hoverIndicator = new Konva.Rect({
      ...snappedPosition,
      width: tileWidth,
      height: tileHeight,
      fill: "#48BB78",
      opacity: 0.3,
      // stroke: "transparent",
      // strokeWidth: 1,
    });
    editor.indicatorLayer.add(editor.hoverIndicator);
  }

  editor.hoverIndicator.setPosition(snappedPosition);
};

const removeHoverIndicator = (editor: Editor) => {
  editor.hoverIndicator?.remove();
  editor.hoverIndicator = undefined;
};

const createEditor = ({ container }: Partial<StageConfig>) => {
  const { width, height } = calculateStageSize({
    mapWidth: initialMapWidth,
    mapHeight: initialMapHeight,
    tileWidth: initialTileWidth,
    tileHeight: initialTileHeight,
  });

  const stage = new Konva.Stage({
    container: container!,
    width,
    height,
    scale: { x: initialScale, y: initialScale },
  });

  const gridLayer = new Konva.Layer();
  const imageLayer = new Konva.Layer();
  const indicatorLayer = new Konva.Layer();

  const editor = {
    stage,
    gridLayer,
    imageLayer,
    indicatorLayer,
  };

  drawGrid(editor, {
    tileWidth: initialTileWidth,
    tileHeight: initialTileHeight,
  });

  stage.add(gridLayer);
  stage.add(imageLayer);
  stage.add(indicatorLayer);

  return editor;
};

export function EditorComponent() {
  const editorRef = useRef<HTMLDivElement>(null);

  const { mapWidth, mapHeight, tileWidth, tileHeight, scale } = useStore(
    useCallback(
      (state) => ({
        mapWidth: state.map.width,
        mapHeight: state.map.height,
        tileWidth: state.map.tilewidth,
        tileHeight: state.map.tileheight,
        scale: state.scale,
      }),
      []
    )
  );

  const map = useStore(useCallback((state) => state.map, []));
  const tilesetImages = useStore(
    useCallback((state) => state.tilesetImages, [])
  );

  const paintTiles = useStore(useCallback((state) => state.paintTiles, []));

  const selectedTool = useStore((state) => state.selectedTool);

  const [editor, setEditor] = useState<Editor>();

  const onStageClick = useCallback(() => {
    if (selectedTool !== "paint") return;
    if (!editor) return;

    const position = getScaledPosition(editor);
    if (!position) return;

    const gridIndex = mapCoordsToIndex(position, {
      gridColumns: mapWidth,
      gridX: tileWidth,
      gridY: tileHeight,
    });

    paintTiles(gridIndex);
  }, [editor, mapWidth, tileWidth, tileHeight, paintTiles, selectedTool]);

  // this might need to be throttled / some optimisation
  const onStageHover: KonvaEventListener<Stage, MouseEvent> =
    useCallback(() => {
      drawHoverIndicator(editor!, { tileWidth, tileHeight });
    }, [editor, tileWidth, tileHeight]);

  const onStageMouseOut: KonvaEventListener<Stage, MouseEvent> = useCallback(
    (event) => {
      if ((event.target as unknown as Konva.Stage) === editor?.stage)
        removeHoverIndicator(editor!);
    },
    [editor]
  );

  // Create and dispose of the editor
  useEffect(() => {
    let newEditor: Editor;
    if (editorRef.current) {
      newEditor = createEditor({
        container: editorRef.current!,
      });

      setEditor(newEditor);
    }

    return () => {
      newEditor?.stage.destroy();
      setEditor(undefined);
    };
  }, []);

  // Resize the stage when the map dimensions change
  useEffect(() => {
    if (editor) {
      setStageSize(editor, {
        mapWidth,
        mapHeight,
        tileWidth,
        tileHeight,
      });
      drawGrid(editor, { tileWidth, tileHeight });
    }
  }, [editor, mapWidth, mapHeight, tileWidth, tileHeight]);

  // Scale the map
  useEffect(() => {
    if (editor) {
      editor.stage.scale({ x: scale, y: scale });
    }
  }, [scale, editor]);

  // Listen for clicks on the stage
  useEffect(() => {
    if (editor) {
      editor.stage.on("click", onStageClick);
    }
    return () => {
      if (editor) {
        editor.stage.off("click", onStageClick);
      }
    };
  }, [editor, onStageClick]);

  // Listen for mouse moves on the stage
  useEffect(() => {
    if (editor) {
      editor.stage.on("mousemove", onStageHover);
    }
    return () => {
      if (editor) {
        editor.stage.off("mousemove", onStageHover);
      }
    };
  }, [editor, onStageHover]);

  // Remove the hover indicator when the mouse leaves the stage
  useEffect(() => {
    if (editor) {
      editor.stage.on("mouseout", onStageMouseOut);
    }
    return () => {
      if (editor) {
        editor.stage.off("mouseout", onStageMouseOut);
      }
    };
  }, [editor, onStageMouseOut]);

  const [isDragging, setIsDragging] = useState(false);

  const onStageMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const onStageMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const [tilesToPaint, setTilesToPaint] = useState<Set<number>>(new Set());

  // TODO this works, but it's not very efficient.
  // Potential optimisations
  // - only paint tiles that are in the viewport
  // - only paint tiles that are in the viewport and are not already painted
  // - dispatch painting to a queue
  // - throttle painting
  // - only draw if grid index is different from last draw

  const onStageMouseMove = useCallback(() => {
    if (isDragging && editor && selectedTool === "paint") {
      const position = getScaledPosition(editor);
      if (!position) return;

      const gridIndex = mapCoordsToIndex(position, {
        gridColumns: mapWidth,
        gridX: tileWidth,
        gridY: tileHeight,
      });

      paintTiles(gridIndex);
      // tilesToPaint.add(gridIndex);
    }
  }, [
    editor,
    isDragging,
    selectedTool,
    tileWidth,
    tileHeight,
    mapWidth,
    // tilesToPaint,
    paintTiles,
    // isDragging,
    // editor,
    // mapWidth,
    // tileWidth,
    // tileHeight,
    // paintTiles,
    // selectedTool,
  ]);

  useEffect(() => {
    if (!isDragging && tilesToPaint.size > 0) {
      Array.from(tilesToPaint).forEach((tile) => paintTiles(tile));
      setTilesToPaint(new Set());
    }
  }, [isDragging, tilesToPaint, paintTiles]);

  // Paint tiles on drag
  useEffect(() => {
    if (editor) {
      editor.stage.on("mousedown", onStageMouseDown);
      editor.stage.on("mouseup", onStageMouseUp);
      editor.stage.on("mousemove", onStageMouseMove);
    }
    return () => {
      if (editor) {
        editor.stage.off("mousedown", onStageMouseDown);
        editor.stage.off("mouseup", onStageMouseUp);
        editor.stage.off("mousemove", onStageMouseMove);
      }
    };
  }, [editor, onStageMouseDown, onStageMouseUp, onStageMouseMove]);

  // Draw tiles!
  // All this work to get here
  useEffect(() => {
    if (editor) {
      drawTiles(editor, map, tilesetImages);
    }
  }, [editor, map, tilesetImages]);

  return (
    <Box pb="4">
      <Box
        bg="gray.900"
        sx={{
          overflow: "scroll !important",
        }}
        ref={editorRef}
      />
    </Box>
  );
}
