import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { useDrop } from "react-dnd";

export function DropZone({
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
