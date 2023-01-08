import { VStack, Text } from "@chakra-ui/react";

import { TileSetWithHash } from "../types";
import { TileSetImage } from "./tileset-image";
import { TileSetToolbar } from "./tileset-toolbar";

export function TileSet({ data }: { data: TileSetWithHash }) {
  return (
    <VStack spacing={1} alignItems="stretch">
      <Text fontSize="sm" fontWeight="medium">
        {data.name}
      </Text>
      <TileSetImage tileset={data} />
      <TileSetToolbar tileset={data} />
    </VStack>
  );
}
