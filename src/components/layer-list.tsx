import { Box, VStack } from "@chakra-ui/react";
import { useStore } from "../store/store";
import { Layer } from "./layer";

export function LayerList() {
  const layers = useStore((state) => state.map.layers);

  return (
    // <DropZone
    //   onDrop={(item, monitor) =>
    //     console.log("list drop", item, monitor.didDrop())
    //   }
    // >
    <Box py="1">
      <VStack spacing="1" alignItems="stretch">
        {layers.map((layer) => (
          <Layer key={layer.id} layer={layer} />
        ))}
      </VStack>
    </Box>
    // </DropZone>
  );
}
