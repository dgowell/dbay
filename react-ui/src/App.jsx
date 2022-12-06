import { useEffect, useState } from "react";
import "./App.css";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import AppsIcon from "@mui/icons-material/Apps";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import StoreCreate from "./components/StoreCreate";
import ListingList from "./components/ListingList";
import ListingDetail from "./components/ListingDetail";
import StoreDetail from "./components/StoreDetail";
import ListingCreate from "./components/ListingCreate";
import { processMaximaEvent } from "./comms";
import { getHostStore } from "./database/settings";
import { setup } from "./database/index";

const theme = createTheme();

function App() {
  const [activePage, setActivePage] = useState();
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    window.MDS.init(function (msg) {
      //Do initialisation
      if (msg.event === "inited") {
        //check if store has been created
        getHostStore().then((res) => {
          if (res.count > 0) {
            setStoreName(res.rows[0].host_store_name);
          } else {
            setup().then(function(res){
              setStoreName(res)
            });
          }
        });
      }
      if (msg.event === "MAXIMA") {
        console.log(`recieved maxima message:${msg}`);

        //Process this message
        processMaximaEvent(msg);
      }
    });
  }, [storeName]);

  if (storeName) {
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
              <Route exact path="/" element={<ListingList />} />
              <Route path="store/create" element={<StoreCreate />} />
              <Route path="store/:id" element={<StoreDetail />} />
              <Route path="listing/create" element={<ListingCreate />} />
              <Route path="listing/:id" element={<ListingDetail />} />
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
                  to="/my-listings"
                  label={`${storeName}'s Listings`}
                  icon={<AppsIcon />}
                />
              </BottomNavigation>
            </Paper>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
  else {
    return (
      <h2>No store created!</h2>
    )
  }
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
