import { Box, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { TileMapLayer } from "../types";

export function Layer({ layer }: { layer: TileMapLayer }) {
  const { id } = layer;

  // const [{ isDragging }, drag] = useDrag({
  //   type: "layer",
  //   item: () => ({ id }),
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // });

  // const opacity = isDragging ? 0.4 : 1;

  const renderLayer = useCallback(
    () => (
      // <Box ref={drag} style={{ opacity }}>
      <Box>
        <Text as="span" fontSize="sm">
          {layer.name}
        </Text>
      </Box>
    ),
    // }, [drag, opacity, layer.name]);
    [layer.name]
  );

  // if (layer.type === "group") {
  //   return (
  //     <DropZone
  //       onDrop={(item, monitor) =>
  //         console.log("layer drop", item, monitor.didDrop())
  //       }
  //     >
  //       {renderLayer()}
  //     </DropZone>
  //   );
  // }

  return renderLayer();
}
