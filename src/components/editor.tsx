import {
  AspectRatio,
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  VStack,
} from "@chakra-ui/react";
import Konva from "konva";
import { StageConfig } from "konva/lib/Stage";
import { Vector2d } from "konva/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { EditorDimensions, TileDimensions } from "../store/editor-slice";
import { initialScale, useStore } from "../store/store";

const initialMapWidth = 30;
const initialMapHeight = 30;
const initialTileWidth = 32;
const initialTileHeight = 32;

type Editor = {
  stage: Konva.Stage;
  gridLayer: Konva.Layer;
  indicatorLayer: Konva.Layer;
  hoverIndicator?: Konva.Rect;
};

const calculateStageSize = ({
  mapWidth,
  mapHeight,
  tileWidth,
  tileHeight,
}: EditorDimensions) => {
  return {
    width: mapWidth * tileWidth + 1,
    height: mapHeight * tileHeight + 1,
  };
};

const setStageSize = (
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

const snapToGrid = (
  { x, y }: { x: number; y: number },
  { tileWidth, tileHeight }: TileDimensions
) => {
  return {
    x: Math.floor(x / tileWidth) * tileWidth,
    y: Math.floor(y / tileHeight) * tileHeight,
  };
};

const mapCoordsToIndex = (
  { x, y }: { x: number; y: number },
  { tileWidth, tileHeight, mapWidth, mapHeight }: EditorDimensions
) => {
  const { x: snappedX, y: snappedY } = snapToGrid(
    { x, y },
    { tileWidth, tileHeight }
  );
  const index = (snappedY / tileHeight) * mapWidth + snappedX / tileWidth;
  return index;
};

const getScaledPosition = (
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

const drawHoverIndicator = (
  editor: Editor,
  { x, y, tileWidth, tileHeight }: { x: number; y: number } & TileDimensions
) => {
  const scaledPosition = getScaledPosition(editor, { x, y });
  if (!scaledPosition) return;

  const position = snapToGrid(scaledPosition, { tileWidth, tileHeight });

  if (!editor.hoverIndicator) {
    editor.hoverIndicator = new Konva.Rect({
      ...position,
      width: tileWidth,
      height: tileHeight,
      fill: "#48BB78",
      opacity: 0.3,
      // stroke: "transparent",
      // strokeWidth: 1,
    });
    editor.indicatorLayer.add(editor.hoverIndicator);
  }
  // add the shape to the layer
  editor.hoverIndicator.setPosition(position);
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

export default function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);

  const { mapWidth, mapHeight, tileWidth, tileHeight, scale } = useStore(
    (state) => ({
      mapWidth: state.map.width,
      mapHeight: state.map.height,
      tileWidth: state.map.tilewidth,
      tileHeight: state.map.tileheight,
      scale: state.scale,
    })
  );

  const [editor, setEditor] = useState<Editor>();

  const onStageClick = useCallback(() => {
    if (!editor) return;

    const position = getScaledPosition(editor);
    if (!position) return;
    const layerIndex = mapCoordsToIndex(position, {
      mapWidth,
      mapHeight,
      tileWidth,
      tileHeight,
    });
  }, [editor, mapWidth, mapHeight, tileWidth, tileHeight]);

  // this might need to be throttled / some optimisation
  const onStageHover = useCallback(() => {
    const { x, y } = editor?.stage.getPointerPosition()!;
    drawHoverIndicator(editor!, { x, y, tileWidth, tileHeight });
  }, [editor, tileWidth, tileHeight]);

  const onStageMouseOut = useCallback(() => {
    removeHoverIndicator(editor!);
  }, [editor]);

  // Create and dispose of the editor
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    const editor = createEditor({
      container: editorRef.current!,
    });

    setEditor(editor);

    return () => {
      editor.stage.destroy();
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
  }, [scale]);

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
