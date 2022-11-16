import { useEffect, useState } from "react";
import "./App.css";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import {
  Link,
  Route,
  Routes
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AppsIcon from "@mui/icons-material/Apps";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import StoreCreate from "./components/StoreCreate";
import StoreList from "./components/StoreList";
import StoreDetail from "./components/StoreDetail";
import { processMaximaEvent } from './comms';
import { schema } from './schema';

const theme = createTheme();

function App() {
  //  const [data, setData] = useState();
  const [activePage, setActivePage] = useState();
  useEffect(() => {
    window.MDS.init(function (msg) {
      //Do initialisation
      if (msg.event === "inited") {
        window.MDS.sql(schema, function (msg) {
          window.MDS.log("StampD Service SQL Inited..");
        });
      }
      if (msg.event === "MAXIMA") {
        console.log(`recieved maxima message:${msg}`);

        //Process this message
        processMaximaEvent(msg);
      }
    });
  }, []);
  return (
      <ThemeProvider theme={theme}>
        <ResponsiveAppBar />
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mb: 10,
            }}
          >
            <Routes>
              <Route exact path="/" element={<StoreList />} />
              <Route path="store/create" element={<StoreCreate />} />
              <Route path="store/:id" element={<StoreDetail />} />
              <Route path="*" element={<NoMatch />} />
            </Routes>
            <Paper
              sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
              elevation={3}
            >
              <BottomNavigation
                showLabels
                value={activePage}
                onChange={(event, page) => {
                  setActivePage(page);
                }}
              >
                <BottomNavigationAction
                  component={Link}
                  to="/"
                  label="Marketplace"
                  icon={<AppsIcon />}
                />
                <BottomNavigationAction
                  component={Link}
                  to="/store/create"
                  label="Add Store"
                  icon={<WebStoriesIcon />}
                />
              </BottomNavigation>
            </Paper>
          </Box>
        </Container>
      </ThemeProvider>
  );
}

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}


export default App;
