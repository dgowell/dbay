import { useEffect, useState } from "react";
import "./App.css";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import PropTypes from "prop-types";
import {
  Link as RouterLink,
  Route,
  Routes,
  MemoryRouter,
} from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AppsIcon from "@mui/icons-material/Apps";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import WebStoriesIcon from "@mui/icons-material/WebStories";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import ListingCreate from "./components/ListingCreate";
import ListingList from "./components/ListingList";
import ListingUpdate from "./components/ListingUpdate";
import { processMaximaEvent } from './comms';

function Router(props) {
  const { children } = props;
  if (typeof window === "undefined") {
    return <StaticRouter location="">{children}</StaticRouter>;
  }

  return <MemoryRouter>{children}</MemoryRouter>;
}

Router.propTypes = {
  children: PropTypes.node,
};

const theme = createTheme();

function App() {
  //  const [data, setData] = useState();
  const [activePage, setActivePage] = useState();
  useEffect(() => {
    window.MDS.init(function (msg) {
      //Do initialisation
      if (msg.event === "inited") {
        //Create the DB if not exists
        const initsql =
          "CREATE TABLE IF NOT EXISTS `listings` ( " +
          "  `id` IDENTITY PRIMARY KEY, " +
          "  `name` varchar(160) NOT NULL, " +
          "  `price` varchar(50) NOT NULL " +
          " )";
        //Run this..
        window.MDS.sql(initsql, function (msg) {
          window.MDS.log("StampD Service SQL Inited..");
        });
      }
      if (msg.event === "MAXIMA") {
        debugger;
        console.log(`recieved maxima message:${msg}`);

        //Process this message
        processMaximaEvent(msg);
      }
    });
  }, []);
  return (
    <Router>
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
              <Route exact path="/" element={<ListingList />} />
              <Route path="/edit/:id" element={<ListingUpdate />} />
              <Route path="/create" element={<ListingCreate />} />
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
                  component={RouterLink}
                  to="/"
                  label="Marketplace"
                  icon={<AppsIcon />}
                />
                <BottomNavigationAction
                  component={RouterLink}
                  to="/list"
                  label="My Items"
                  icon={<HomeIcon />}
                />
                <BottomNavigationAction
                  component={RouterLink}
                  to="/create"
                  label="Add Listing"
                  icon={<WebStoriesIcon />}
                />
              </BottomNavigation>
            </Paper>
          </Box>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;
