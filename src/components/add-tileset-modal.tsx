import {
  Text,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  UseDisclosureReturn,
  VStack,
} from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { AiOutlinePlus, AiOutlineSave } from "react-icons/ai";
import { initialTileHeight, initialTileWidth } from "../constants";
import { useStore } from "../store/store";
import { FileWithData, TileSetWithHash } from "../types";
import { getImageDimensions, readFile } from "../utils/file";
import { parseNumber } from "../utils/number";
import { lookupImageByTileSet } from "../utils/tileset";

export function AddTileSetModal({
  isOpen,
  onClose,
  tileset,
}: UseDisclosureReturn & { tileset?: TileSetWithHash }) {
  const isEdit = !!tileset;

  const tileSetImages = useStore((state) => state.tilesetImages);

  const tilesetImage = isEdit
    ? lookupImageByTileSet(tileSetImages, tileset)
    : undefined;

  const [file, setFile] = useState<FileWithData | undefined>(tilesetImage);

  const onFileSelected: ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const selectedFile = Array.from(
      (event?.currentTarget as HTMLInputElement)?.files || []
    )?.at(0);
    if (selectedFile) {
      setFile({
        file: selectedFile,
        data: await readFile(selectedFile),
      });
    }
  };

  const [tileWidth, setTileWidth] = useState(
    tileset?.tilewidth || initialTileWidth
  );
  const [tileHeight, setTileHeight] = useState(
    tileset?.tileheight || initialTileHeight
  );

  const [addTileSet, updateTileSet] = useStore((state) => [
    state.addTileSet,
    state.updateTileSet,
  ]);

  const handleSubmit: FormEventHandler<HTMLElement> = async (event) => {
    event.preventDefault();
    // TODO validation etc

    if (isEdit) {
      updateTileSet(tileset.hash, {
        tilewidth: tileWidth,
        tileheight: tileHeight,
      });
    } else {
      const { width, height } = await getImageDimensions(file!.data);
      addTileSet({
        file: file!,
        tileWidth,
        tileHeight,
        imageWidth: width,
        imageHeight: height,
      });
      setTileWidth(initialTileWidth);
      setTileHeight(initialTileHeight);
    }

    setFile(undefined);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>Add new tileset</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack>
            <FormControl>
              <FormLabel>Tileset image</FormLabel>
              {!isEdit && (
                <Input as="div" position="relative">
                  <Flex alignItems="center" height="100%">
                    <Text
                      flexGrow="1"
                      color={file ? undefined : "chakra-placeholder-color"}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      mr="2"
                    >
                      {file ? file.file.name : "No file selected"}
                    </Text>
                    <Button as="span" size="sm" px="2" flexShrink="0">
                      Choose file
                    </Button>
                  </Flex>
                  <Box
                    as="input"
                    type="file"
                    accept="image/*"
                    position="absolute"
                    opacity="0"
                    left="0"
                    right="0"
                    top="0"
                    bottom="0"
                    cursor="pointer"
                    onChange={onFileSelected}
                  />
                </Input>
              )}
            </FormControl>
            {!!file && (
              <Box maxW="sm">
                <img src={file.data} alt={`Tileset: ${file.file.name}`} />
              </Box>
            )}
            <SimpleGrid columns={2} gap={3}>
              <FormControl>
                <FormLabel>Tile width (px)</FormLabel>
                <Input
                  type="number"
                  value={tileWidth}
                  onChange={(event) => {
                    setTileWidth(parseNumber(event.target.value));
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tile height (px)</FormLabel>
                <Input
                  type="number"
                  value={tileHeight}
                  onChange={(event) => {
                    setTileHeight(parseNumber(event.target.value));
                  }}
                />
              </FormControl>
            </SimpleGrid>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            leftIcon={isEdit ? <AiOutlineSave /> : <AiOutlinePlus />}
            type="submit"
          >
            {isEdit ? "Update" : "Add"} tileset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
