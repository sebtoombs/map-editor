import { Box, ChakraProvider, extendTheme, Grid } from "@chakra-ui/react";
import { EditorComponent } from "./components/editor";
import { LeftToolbar } from "./components/left-toolbar";
import { RightToolbar } from "./components/right-toolbar";

import { TopToolbar } from "./components/top-toolbar";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  // styles: {
  //   global: {
  //     body: {
  //       bg: "gray.100",
  //     },
  //   },
  // },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box
        className="layout-wrapper"
        height="100vh"
        display="flex"
        flexDirection="column"
      >
        <Box borderBottom="1px solid" borderColor="gray.700">
          <Box p="4">Toolbar will go here</Box>
          <TopToolbar />
        </Box>

        <Box flexGrow="1" overflow="hidden" className="content-wrapper">
          <Grid
            flexGrow="1"
            height="100%"
            templateColumns={{
              base: "1fr",
              lg: "14rem minmax(0, 1fr) 14rem",
              xl: "20rem minmax(0, 1fr) 20rem",
            }}
            className="content-grid"
          >
            {/* Left toolbar */}
            <Box
              className="left-toolbar-area"
              overflowY="scroll"
              borderRight="1px solid"
              borderColor="gray.700"
            >
              <LeftToolbar />
            </Box>
            {/* Centre editor */}
            <Box className="main-area" overflowY="scroll">
              <EditorComponent />
            </Box>
            {/* Right toolbar */}
            <Box
              className="right-toolbar-area"
              overflowY="scroll"
              borderLeft="1px solid"
              borderColor="gray.700"
            >
              <RightToolbar />
            </Box>
          </Grid>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

export { App };
