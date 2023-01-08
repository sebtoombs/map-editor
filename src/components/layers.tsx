import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { IoChevronDown } from "react-icons/io5";
import { useStore } from "../store/store";
import { TileMapLayer } from "../types";
import { LayerList } from "./layer-list";

// SO MUCH TODO HERE!!
// - Drag and drop layers
// - Layer types
// - Layer visibility
// - Layer opacity
// - Layer name
// - Layer properties
// - Layer delete

export function Layers() {
  const [layers, addLayer] = useStore((state) => [
    state.map.layers,
    state.addLayer,
  ]);

  const addNewLayer = useCallback(
    ({ type }: Partial<Pick<TileMapLayer, "type">> = {}) => {
      addLayer({ type });
    },
    [addLayer]
  );

  return (
    <Box p={2}>
      <DndProvider backend={HTML5Backend}>
        <LayerList />
      </DndProvider>
      <Flex justifyContent="flex-end">
        <Menu isLazy>
          <Tooltip label="Coming soon">
            <ButtonGroup size="xs" isAttached isDisabled>
              <Button
                size="xs"
                onClick={() => addNewLayer()}
                colorScheme="purple"
                leftIcon={<AiOutlinePlus />}
              >
                Add layer
              </Button>

              <MenuButton
                as={IconButton}
                icon={<IoChevronDown />}
                aria-label="Open layer add menu"
                colorScheme="purple"
              />
            </ButtonGroup>
          </Tooltip>
          <MenuList>
            <MenuItem
              fontSize="sm"
              onClick={() => addNewLayer({ type: "tilelayer" })}
            >
              Tile layer
            </MenuItem>
            <MenuItem
              fontSize="sm"
              isDisabled
              onClick={() => addNewLayer({ type: "imagelayer" })}
            >
              Image layer
            </MenuItem>
            <MenuItem
              fontSize="sm"
              isDisabled
              onClick={() => addNewLayer({ type: "objectlayer" })}
            >
              Object layer
            </MenuItem>
            <MenuItem
              fontSize="sm"
              onClick={() => addNewLayer({ type: "group" })}
            >
              Group
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
}
