import { Box } from "@chakra-ui/react";
import Konva from "konva";
import { StageConfig } from "konva/lib/Stage";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Editor,
  FileWithData,
  TileDimensions,
  TileSetWithHash,
} from "../types";
import {
  getScaledPosition,
  mapCoordsToIndex,
  snapToGrid,
} from "../utils/canvas";

export const drawGrid = (
  editor: any,
  { tileWidth, tileHeight }: TileDimensions
) => {
  const { width, height } = editor.stage.size();
  editor.gridLayer.removeChildren();

  const isFirstLine = (i: number) => i === 0;
  const isLastLine = (i: number, dimension: number) => i === dimension - 1;

  const lineConfig = (i: number, direction: "v" | "h") => {
    const isFirstOrLastLine =
      isFirstLine(i) || isLastLine(i, direction === "v" ? width : height);

    return {
      stroke: "#F7FAFC",
      opacity: isFirstOrLastLine ? 0.7 : 0.5,
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

export const drawImage = (editor: any, imageSrc: string) => {
  const { width, height } = editor.stage.size();
  const imageObj = new Image();
  imageObj.onload = () => {
    const tilesetImage = new Konva.Image({
      x: 0,
      y: 0,
      image: imageObj,
      width,
      height,
    });

    // add the shape to the layer
    editor.imageLayer.add(tilesetImage);
  };
  imageObj.src = imageSrc;
};

const drawHoverIndicator = (
  editor: any,
  { x, y, tileWidth, tileHeight }: { x: number; y: number } & TileDimensions
) => {
  const scaledPosition = getScaledPosition(editor, { x, y });
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
  // add the shape to the layer
  editor.hoverIndicator.setPosition(snappedPosition);
};

const removeHoverIndicator = (editor: Editor) => {
  editor.hoverIndicator?.remove();
  editor.hoverIndicator = undefined;
};

export const createCanvas = ({
  container,
  width,
  height,
}: Partial<StageConfig> & {
  width?: number;
  height?: number;
}) => {
  const stage = new Konva.Stage({
    container: container!,
    width,
    height,
  });

  const imageLayer = new Konva.Layer();
  const gridLayer = new Konva.Layer();
  const indicatorLayer = new Konva.Layer();

  const canvas = {
    stage,
    imageLayer,
    gridLayer,
    indicatorLayer,
  };

  stage.add(imageLayer);
  stage.add(gridLayer);
  stage.add(indicatorLayer);

  return canvas;
};

export function TileSetCanvas({
  tileset,
  tilesetImage,
}: {
  tileset: TileSetWithHash;
  tilesetImage: FileWithData;
}) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<any>();

  useEffect(() => {
    let newCanvas: any;
    if (canvasContainerRef.current) {
      newCanvas = createCanvas({
        container: canvasContainerRef.current!,
      });

      setCanvas(newCanvas);
    }

    return () => {
      newCanvas?.stage.destroy();
      setCanvas(undefined);
    };
  }, []);

  useEffect(() => {
    if (canvasContainerRef.current && canvas) {
      const { width, height } =
        canvasContainerRef.current.getBoundingClientRect();

      const scale = width / tileset.imagewidth;

      if (canvas) {
        canvas.stage.width(width);
        canvas.stage.height(scale * tileset.imageheight);
        canvas.stage.draw();
      }
    }
  }, [canvas, tileset.imagewidth, tileset.imageheight]);

  useEffect(() => {
    if (canvas && canvasContainerRef.current) {
      const { width, height } =
        canvasContainerRef.current.getBoundingClientRect();

      const scale = width / tileset.imagewidth;

      drawGrid(canvas, {
        tileWidth: scale * tileset.tilewidth,
        tileHeight: scale * tileset.tileheight,
      });
    }
  }, [canvas, tileset.tilewidth, tileset.tileheight, tileset.imagewidth]);

  useEffect(() => {
    if (canvas) {
      drawImage(canvas, tilesetImage.data);
    }
  }, [canvas, tilesetImage.data]);

  // // this might need to be throttled / some optimisation
  const onStageHover = useCallback(() => {
    const { x, y } = canvas?.stage.getPointerPosition()! || {};
    const { width, height } =
      canvasContainerRef.current!.getBoundingClientRect();

    const scale = width / tileset.imagewidth;

    drawHoverIndicator(canvas!, {
      x,
      y,
      tileWidth: scale * tileset.tilewidth,
      tileHeight: scale * tileset.tileheight,
    });
  }, [canvas, tileset.tilewidth, tileset.tileheight, tileset.imagewidth]);

  const onStageMouseOut = useCallback(
    (event: Event) => {
      if (event.target === canvas?.stage) removeHoverIndicator(canvas!);
    },
    [canvas]
  );

  const onStageClick = useCallback(() => {
    if (!canvas) return;

    const position = getScaledPosition(canvas);
    if (!position) return;

    const { width, height } =
      canvasContainerRef.current!.getBoundingClientRect();

    const scale = width / tileset.imagewidth;

    const gridIndex = mapCoordsToIndex(position, {
      gridColumns: tileset.imagewidth / tileset.tilewidth,
      gridX: scale * tileset.tilewidth,
      gridY: scale * tileset.tileheight,
    });
    // TODO
  }, [canvas, tileset.tilewidth, tileset.tileheight, tileset.imagewidth]);

  // // Listen for mouse moves on the stage
  useEffect(() => {
    if (canvas) {
      canvas.stage.on("mousemove", onStageHover);
    }
    return () => {
      if (canvas) {
        canvas.stage.off("mousemove", onStageHover);
      }
    };
  }, [canvas, onStageHover]);

  // // Remove the hover indicator when the mouse leaves the stage
  useEffect(() => {
    if (canvas) {
      canvas.stage.on("mouseout", onStageMouseOut);
    }
    return () => {
      if (canvas) {
        canvas.stage.off("mouseout", onStageMouseOut);
      }
    };
  }, [canvas, onStageMouseOut]);

  // Listen for clicks on the stage
  useEffect(() => {
    if (canvas) {
      canvas.stage.on("click", onStageClick);
    }
    return () => {
      if (canvas) {
        canvas.stage.off("click", onStageClick);
      }
    };
  }, [canvas, onStageClick]);

  return (
    <Box
      bg="gray.900"
      sx={{
        overflow: "scroll !important",
      }}
      ref={canvasContainerRef}
    />
  );
}
