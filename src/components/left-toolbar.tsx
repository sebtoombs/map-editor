import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState } from "react";
import { useStore } from "../store/store";
import { getInputMin, parseNumber } from "../utils/number";

export function LeftToolbar() {
  const [mapWidth, setMapWidth] = useStore((state) => [
    state.map.width,
    state.setMapWidth,
  ]);
  const [mapHeight, setMapHeight] = useStore((state) => [
    state.map.height,
    state.setMapHeight,
  ]);
  const [tileWidth, setTileWidth] = useStore((state) => [
    state.map.tilewidth,
    state.setTileWidth,
  ]);
  const [tileHeight, setTileHeight] = useStore((state) => [
    state.map.tileheight,
    state.setTileHeight,
  ]);

  const [inputMapWidthValue, setInputMapWidthValue] = useState(mapWidth);
  const [inputMapHeightValue, setInputMapHeightValue] = useState(mapHeight);
  const [inputTileWidthValue, setInputTileWidthValue] = useState(tileWidth);
  const [inputTileHeightValue, setInputTileHeightValue] = useState(tileHeight);

  const updateInputValue = (name: string, value: number) => {
    switch (name) {
      case "mapWidth":
        setInputMapWidthValue(value);
        break;
      case "mapHeight":
        setInputMapHeightValue(value);
        break;
      case "tileWidth":
        setInputTileWidthValue(value);
        break;
      case "tileHeight":
        setInputTileHeightValue(value);
        break;
      default:
        break;
    }
  };

  const validate = (element: HTMLInputElement, value: any) => {
    const min = getInputMin(element);

    return (min !== false && value < min) || min !== false;
  };

  const submitUpdate = (name: string, value: any) => {
    switch (name) {
      case "mapWidth":
        setMapWidth(value);
        break;
      case "mapHeight":
        setMapHeight(value);
        break;
      case "tileWidth":
        setTileWidth(value);
        break;
      case "tileHeight":
        setTileHeight(value);
        break;
      default:
        break;
    }
  };

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const parsedValue = parseNumber(value);

    updateInputValue(name, parsedValue);

    if (validate(event.target, parsedValue)) {
      submitUpdate(name, parsedValue);
    }
  };

  return (
    <Box p="4">
      <VStack>
        <SimpleGrid columns={2} gap={2}>
          <FormControl>
            <FormLabel fontSize="sm">
              Map width{" "}
              <Text as="span" fontSize="xs" color="gray.300">
                (tiles)
              </Text>
            </FormLabel>
            <Input
              size="sm"
              type="number"
              name="mapWidth"
              value={inputMapWidthValue}
              onChange={handleUpdate}
              min={1}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">
              Map height{" "}
              <Text as="span" fontSize="xs" color="gray.300">
                (tiles)
              </Text>
            </FormLabel>
            <Input
              size="sm"
              type="number"
              name="mapHeight"
              value={inputMapHeightValue}
              onChange={handleUpdate}
              min={1}
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={2} gap={2}>
          <FormControl>
            <FormLabel fontSize="sm">
              Tile width{" "}
              <Text as="span" fontSize="xs" color="gray.300">
                (px)
              </Text>
            </FormLabel>
            <Input
              size="sm"
              type="number"
              name="tileWidth"
              value={inputTileWidthValue}
              onChange={handleUpdate}
              min={1}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">
              Tile height{" "}
              <Text as="span" fontSize="xs" color="gray.300">
                (px)
              </Text>
            </FormLabel>
            <Input
              size="sm"
              type="number"
              name="tileHeight"
              value={inputTileHeightValue}
              onChange={handleUpdate}
              min={1}
            />
          </FormControl>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
