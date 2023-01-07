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
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { PropsWithChildren, useCallback, useRef } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { useStore } from "../store/store";
import { DndProvider, useDrag, useDrop, XYCoord } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TileMapLayer } from "../store/map-slice";
import { IoChevronDown } from "react-icons/io5";

// SO MUCH TODO HERE!!
// - Drag and drop layers
// - Layer types
// - Layer visibility
// - Layer opacity
// - Layer name
// - Layer properties
// - Layer delete

export default function Layers() {
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
            <ButtonGroup size="xs" isAttached isDisabled={true}>
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
              isDisabled={true}
              onClick={() => addNewLayer({ type: "imagelayer" })}
            >
              Image layer
            </MenuItem>
            <MenuItem
              fontSize="sm"
              isDisabled={true}
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

function LayerList() {
  const layers = useStore((state) => state.map.layers);

  return (
    // <DropZone
    //   onDrop={(item, monitor) =>
    //     console.log("list drop", item, monitor.didDrop())
    //   }
    // >
    <Box py="1">
      <VStack spacing="1" alignItems="stretch">
        {layers.map((layer, index) => (
          <Layer key={index} layer={layer} />
        ))}
      </VStack>
    </Box>
    // </DropZone>
  );
}

function Layer({ layer }: { layer: TileMapLayer }) {
  const { id } = layer;

  // const [{ isDragging }, drag] = useDrag({
  //   type: "layer",
  //   item: () => ({ id }),
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // });

  // const opacity = isDragging ? 0.4 : 1;

  const renderLayer = useCallback(() => {
    return (
      // <Box ref={drag} style={{ opacity }}>
      <Box>
        <Text as="span" fontSize="sm">
          {layer.name}
        </Text>
      </Box>
    );
    // }, [drag, opacity, layer.name]);
  }, [layer.name]);

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

function DropZone({
  onDrop,
  children,
}: PropsWithChildren<{ onDrop: (item: any, monitor: any) => void }>) {
  const [{ isOver, isOverCurrent }, drop] = useDrop({
    accept: "layer",
    drop: (item, monitor) => onDrop(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <Box ref={drop} style={{ background: isOverCurrent ? "red" : "none" }}>
      {children}
    </Box>
  );
}
