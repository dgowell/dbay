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
import Marketplace from "./pages/Marketplace";
import ListingDetail from "./components/ListingDetail";
import ListingCreate from "./components/ListingCreate";
import MyListingList from "./components/MyListingList";
import { processMaximaEvent } from "./comms";
import { getHostStore } from "./database/settings";
import { setup } from "./database/index";


const theme = createTheme();

function App() {
  const [activePage, setActivePage] = useState();
  const [initialised, setInitialised] = useState(false);
  const [store, setStore] = useState({
    "name" : '',
    "pubkey" : ''
  });

  useEffect(() => {
    window.MDS.init(async function (msg) {
      //Do initialisation
      if (msg.event === "inited") {
        if (!initialised) {
          try {
            //check if store has been created
            const hostStore = await getHostStore();
            if (hostStore.host_store_name) {
              //if the store has been created set it as the state
                setStore({
                  name: hostStore.host_store_name,
                  pubkey: hostStore.host_store_pubkey,
                });
              } else {
                //if it has not been created, create
                setup().then(function(res){
                  setStore({
                    "name": res.storeName,
                    "pubkey": res.storePubkey
                  });
                });
              }
              setInitialised(true);
          }
          catch (e) {
            console.log(`Couldn't get host store ${e}`);
          }
        }
      }
      if (msg.event === "MAXIMA") {
        console.log(`recieved maxima message:${msg}`);

        //Process this message
        processMaximaEvent(msg);
      }
    });
  }, [store, initialised]);

  if (store.name) {
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
              <Route exact path="/" element={<Marketplace />} />
              <Route path="store/create" element={<StoreCreate />} />
              <Route path="listing/create" element={<ListingCreate />} />
              <Route path="listing/:id" element={<ListingDetail />} />
              <Route path="my-store/" element={<MyListingList storeName={store.name} storePubkey={store.pubkey} />} />
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
                  to="/my-store"
                  label={`${store.name}'s Listings`}
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
