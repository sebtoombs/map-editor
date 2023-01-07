import {
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
  useDisclosure,
  UseDisclosureReturn,
  VStack,
  Text,
  SimpleGrid,
  Wrap,
  WrapItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import {
  initialMapHeight,
  initialTileHeight,
  initialTileWidth,
  useStore,
} from "../store/store";
import {
  AiFillSetting,
  AiFillDelete,
  AiOutlinePlus,
  AiOutlineSave,
} from "react-icons/ai";
import { FileWithData, TileSetWithHash } from "../store/editor-slice";
import { parseNumber } from "../utils/number";
import { getImageDimensions, readFile } from "../utils/file";
import { TileSet } from "../store/map-slice";
import { lookupImageByTileSet } from "../utils/tileset";

function TileSet({ data }: { data: TileSetWithHash }) {
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

function TileSetImage({ tileset }: { tileset: TileSet }) {
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

  return (
    <Box
      sx={{
        backgroundImage: `repeating-linear-gradient(#ccc 0 1px, transparent 1px 100%),
      repeating-linear-gradient(90deg, #ccc 0 1px, transparent 1px 100%)`,
        backgroundSize: "64px 64px",
      }}
    >
      <img src={tilesetImage?.data} key={tilesetImage.file.name} />
    </Box>
  );
}

function TileSetToolbar({ tileset }: { tileset: TileSetWithHash }) {
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
              colorScheme={"red"}
              aria-label="Delete tileset"
              icon={<AiFillDelete />}
              variant="outline"
              size="xs"
              onClick={() => {
                console.log("delete", tileset);
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

export default function Tilesets() {
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

function AddTileSetModal({
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
                      color={!!file ? undefined : "chakra-placeholder-color"}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      mr="2"
                    >
                      {!!file ? file.file.name : "No file selected"}
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
                <img src={file.data} />
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
