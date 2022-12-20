import { useEffect, useState } from "react";
import "./App.css";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import Marketplace from "./pages/Marketplace";
import ListingDetail from "./components/ListingDetail";
import ListingCreate from "./components/ListingCreate";
import MyListingList from "./components/MyListingList";
import ListingPurchase from "./pages/ListingPurchase";
import { processMaximaEvent } from "./comms";
import { getHost } from "./database/settings";
import { setup } from "./database/index";
import Purchases from "./pages/Purchases";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MailIcon from "@mui/icons-material/Mail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const theme = createTheme();

function App() {
  const [activePage, setActivePage] = useState();
  const [initialised, setInitialised] = useState(false);
  const [host, setHost] = useState({
    "name" : '',
    "pk" : ''
  });

  useEffect(() => {
    window.MDS.init(async function (msg) {
      //Do initialisation
      if (msg.event === "inited") {
        if (!initialised) {
          try {
            //check if host details have been stored
            const currentHost = await getHost();
            if (currentHost.name) {
                setHost({
                  name: currentHost.name,
                  pk: currentHost.pk,
                });
              } else {
                //store them
                setup().then(function(res){
                  setHost({
                    "name": res.name,
                    "pk": res.pk
                  });
                });
              }
              setInitialised(true);
          }
          catch (e) {
            console.log(`Couldn't get host info ${e}`);
          }
        }
      }
      if (msg.event === "MAXIMA") {
        console.log(`recieved maxima message:${JSON.stringify(msg)}`);

        //Process this message
        processMaximaEvent(msg);
      }
    });
  }, [host, initialised]);

  if (host.name) {
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
              <Route path="listing/create" element={<ListingCreate />} />
              <Route path="listing/:id" element={<ListingDetail />} />
              <Route path="listing/:id/purchase" element={<ListingPurchase />} />
              <Route path="my-store/" element={<MyListingList />} />
              <Route path="purchases/" element={<Purchases />} />
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
                  label="Home"
                  icon={<HomeIcon />}
                />
                <BottomNavigationAction
                  component={Link}
                  to="/"
                  label="Favourites"
                  icon={<FavoriteIcon />}
                />
                <BottomNavigationAction
                  component={Link}
                  to="/listing/create"
                  label="Sell"
                  icon={<AddCircleIcon />}
                />
                <BottomNavigationAction
                  component={Link}
                  to="/"
                  label="Inbox"
                  icon={<MailIcon />}
                />
                <BottomNavigationAction
                  component={Link}
                  to="/"
                  label="Me"
                  icon={<AccountCircleIcon />}
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
      <h2>No Host stored!</h2>
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
