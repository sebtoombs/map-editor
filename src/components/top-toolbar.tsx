import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { useStore } from "../store/store";

export default function TopToolbar() {
  const [scale, setScale] = useStore((state) => [state.scale, state.setScale]);

  return (
    <Box px="4" py="1">
      <Wrap>
        <WrapItem>
          <ButtonGroup isAttached>
            <Tooltip label="Zoom out">
              <IconButton
                onClick={() => setScale(scale - 0.1)}
                size="xs"
                icon={<AiOutlineZoomOut />}
                aria-label="Zoom editor in"
              />
            </Tooltip>
            <Tooltip label="Reset zoom">
              <Button size="xs" onClick={() => setScale(1)}>
                {Math.round(scale * 100)}%
              </Button>
            </Tooltip>
            <Tooltip label="Zoom in">
              <IconButton
                onClick={() => setScale(scale + 0.1)}
                size="xs"
                icon={<AiOutlineZoomIn />}
                aria-label="Zoom editor in"
              />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>
      </Wrap>
    </Box>
  );
}
