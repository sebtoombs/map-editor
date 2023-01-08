import { Box, Button, Flex, useDisclosure, VStack } from "@chakra-ui/react";
import { AiOutlinePlus } from "react-icons/ai";
import { useStore } from "../store/store";
import { TileSet } from "./tileset";
import { AddTileSetModal } from "./add-tileset-modal";

export function Tilesets() {
  const tilesets = useStore((state) => state.computed.tileSets);

  const addTileSetModal = useDisclosure();

  return (
    <Box p={2}>
      <VStack alignItems="stretch">
        {tilesets.map((tileset) => (
          <TileSet data={tileset} key={tileset.hash} />
        ))}
      </VStack>
      <Flex justifyContent="flex-end" mt={3}>
        <AddTileSetModal {...addTileSetModal} />
        <Button
          size="xs"
          onClick={() => addTileSetModal.onOpen()}
          colorScheme="purple"
          leftIcon={<AiOutlinePlus />}
        >
          Add tileset
        </Button>
      </Flex>
    </Box>
  );
}
