import { Box, Text } from "@chakra-ui/react";
import { useStore } from "../store/store";
import { TileSetWithHash } from "../types";
import { lookupImageByTileSet } from "../utils/tileset";
import { TileSetCanvas } from "./tileset-canvas";

export function TileSetImage({ tileset }: { tileset: TileSetWithHash }) {
  const tileSetImages = useStore((state) => state.tilesetImages);

  const tilesetImage = lookupImageByTileSet(tileSetImages, tileset);

  if (!tilesetImage) {
    return (
      <Box mx="auto" bg="gray.700" p="2">
        <Text fontSize="sm" color="red.300" textAlign="center">
          Image not found
        </Text>
      </Box>
    );
  }

  // return (
  //   <Box
  //     sx={{
  //       backgroundImage: `repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
  //     repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)`,
  //       backgroundSize: "64px 64px",
  //     }}
  //   >
  //     <img src={tilesetImage?.data} key={tilesetImage.file.name} />
  //   </Box>
  // );
  return <TileSetCanvas tileset={tileset} tilesetImage={tilesetImage} />;
}
