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
import { Editor, TileDimensions } from "../types";
import {
  calculateStageSize,
  getScaledPosition,
  mapCoordsToIndex,
  setStageSize,
  snapToGrid,
} from "../utils/canvas";

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
  const indicatorLayer = new Konva.Layer();

  const editor = {
    stage,
    gridLayer,
    indicatorLayer,
  };

  drawGrid(editor, {
    tileWidth: initialTileWidth,
    tileHeight: initialTileHeight,
  });

  stage.add(gridLayer);
  stage.add(indicatorLayer);

  return {
    stage,
    gridLayer,
    indicatorLayer,
  };
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

  const paintTiles = useStore(useCallback((state) => state.paintTiles, []));

  const [editor, setEditor] = useState<Editor>();

  const onStageClick = useCallback(() => {
    if (!editor) return;

    const position = getScaledPosition(editor);
    if (!position) return;

    const gridIndex = mapCoordsToIndex(position, {
      gridColumns: mapWidth,
      gridX: tileWidth,
      gridY: tileHeight,
    });

    paintTiles(gridIndex);
  }, [editor, mapWidth, tileWidth, tileHeight, paintTiles]);

  // this might need to be throttled / some optimisation
  const onStageHover = useCallback(() => {
    // const { x, y } = editor?.stage?.getPointerPosition()! || {};
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
