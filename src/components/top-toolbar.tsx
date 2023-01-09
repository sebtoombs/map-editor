import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { BiBrush } from "react-icons/bi";
import { GrCursor } from "react-icons/gr";
import { useStore } from "../store/store";

export function TopToolbar() {
  const [scale, setScale] = useStore((state) => [state.scale, state.setScale]);
  const [selectedTool, setSelectedTool] = useStore((state) => [
    state.selectedTool,
    state.setSelectedTool,
  ]);

  return (
    <Box px="4" py="1">
      <Wrap>
        <WrapItem>
          <ButtonGroup isAttached>
            <Tooltip label="Zoom out">
              <IconButton
                onClick={() => setScale(scale - 0.1)}
                size="sm"
                icon={<AiOutlineZoomOut />}
                aria-label="Zoom editor in"
              />
            </Tooltip>
            <Tooltip label="Reset zoom">
              <Button size="sm" onClick={() => setScale(1)}>
                {Math.round(scale * 100)}%
              </Button>
            </Tooltip>
            <Tooltip label="Zoom in">
              <IconButton
                onClick={() => setScale(scale + 0.1)}
                size="sm"
                icon={<AiOutlineZoomIn />}
                aria-label="Zoom editor in"
              />
            </Tooltip>
          </ButtonGroup>
        </WrapItem>
        <WrapItem>
          <Tooltip label="Select cursor tool">
            <IconButton
              icon={<GrCursor />}
              aria-label="Cursor tool"
              size="sm"
              sx={{
                "svg *": {
                  stroke: "currentColor",
                },
              }}
              isActive={selectedTool === "cursor"}
              onClick={() => setSelectedTool("cursor")}
            />
          </Tooltip>
        </WrapItem>
        <WrapItem>
          <Tooltip label="Select paint tool">
            <IconButton
              icon={<BiBrush />}
              aria-label="Paint tool"
              size="sm"
              isActive={selectedTool === "paint"}
              onClick={() => setSelectedTool("paint")}
            />
          </Tooltip>
        </WrapItem>
      </Wrap>
    </Box>
  );
}
