import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { Layers } from "./layers";
import { Tilesets } from "./tilesets";

const ToolbarItems = [
  {
    title: "Layers",
    component: Layers,
  },
  {
    title: "Tilesets",
    component: Tilesets,
  },
];

export function RightToolbar() {
  return (
    <Box>
      <Accordion defaultIndex={[0, 1]} allowMultiple>
        {ToolbarItems.map((item) => (
          <AccordionItem borderColor="purple.800" key={item.title}>
            <h2>
              <AccordionButton
                bg="gray.900"
                fontSize="sm"
                px="4"
                py="2"
                fontWeight="bold"
                color="purple.400"
              >
                <Box as="span" flex="1" textAlign="left">
                  {item.title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel p={0}>{item.component()}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}
