import {
  IconButton,
  Tooltip,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AiFillDelete, AiFillSetting } from "react-icons/ai";
import { useStore } from "../store/store";
import { TileSetWithHash } from "../types";
import { AddTileSetModal } from "./add-tileset-modal";

export function TileSetToolbar({ tileset }: { tileset: TileSetWithHash }) {
  const deleteTileSet = useStore((state) => state.deleteTileSet);

  const editTileSet = useDisclosure();

  return (
    <>
      <Wrap>
        <WrapItem ml="auto">
          <Tooltip label="Edit tileset" aria-label="Edit tileset">
            <IconButton
              aria-label="Edit tileset"
              icon={<AiFillSetting />}
              variant="outline"
              size="xs"
              colorScheme="orange"
              onClick={() => editTileSet.onOpen()}
            />
          </Tooltip>
        </WrapItem>
        <WrapItem ml="auto">
          <Tooltip label="Delete tileset" aria-label="Delete tileset">
            <IconButton
              colorScheme="red"
              aria-label="Delete tileset"
              icon={<AiFillDelete />}
              variant="outline"
              size="xs"
              onClick={() => {
                deleteTileSet(tileset);
              }}
            />
          </Tooltip>
        </WrapItem>
      </Wrap>
      <AddTileSetModal {...editTileSet} tileset={tileset} />
    </>
  );
}
