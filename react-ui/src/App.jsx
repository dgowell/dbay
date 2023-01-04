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
import Marketplace from "./components/Marketplace";
import ListingDetail from "./components/ListingDetail";
import ListingCreate from "./components/ListingCreate";
import ListingPurchase from "./components/ListingPurchase";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentError from "./components/PaymentError";
import { processMaximaEvent } from "./minima";
import { getHost } from "./database/settings";
import { setup } from "./database/index";
import Purchases from "./components/Purchases";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MailIcon from "@mui/icons-material/Mail";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Profile from "./components/Profile";
import WelcomePage from "./components/WelcomePage";
import ListingDetailSeller from "./components/ListingDetailSeller";
import ListingListSeller from "./components/ListingListSeller";
import ListingDeliverySeller from "./components/ListingDeliverySeller";

const theme = createTheme({
  typography: {
    "fontFamily": `"Karla", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightRegular": 400,
    "fontWeightMedium": 700
  },
  palette: {
    primary: {
      main: '#2e2e2e',
    }
  }
});


theme.typography.h3 = {
  fontSize: '1.2rem',
  '@media (min-width:600px)': {
    fontSize: '1.5rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
};

function App() {
  const [activePage, setActivePage] = useState();
  const [loading, setLoading] = useState();
  const [host, setHost] = useState({
    "name": '',
    "pk": ''
  });

  async function intialise() {
    try {
      await setup();
    }
    catch (e) {
      console.log(`Setup failed! ${e}`);
    }
    getHost().then(res => {
      setHost({
        'name': res.name,
        'pk': res.pk
      });
      setLoading(false);
    }).catch((e) => console.error(e));
  }

  useEffect(() => {
    window.MDS.init(function (msg) {
      //take action depending on what type of event comes in
      switch (msg.event) {
        case "inited":
          if (host.name === '') {
            setLoading(true);
            intialise();
          }
          break;
        case "MAXIMA":
          //console.log(`recieved maxima message:${JSON.stringify(msg)}`);
          processMaximaEvent(msg);
          break;
        case "NEWBLOCK":
          //processNewBlock(msg.data);
          break;
        default:
          //console.log(msg.event);
      }
    });
  }, [host.name]);

  if (!loading) {
    return (
      <ThemeProvider theme={theme}>
        <ResponsiveAppBar />
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box>
            <Routes>
              <Route exact path="/" element={<Marketplace />} />
              <Route path="listing/create" element={<ListingCreate />} />
              <Route path="listing/:id" element={<ListingDetail />} />
              <Route path="listing/:id/purchase" element={<ListingPurchase />} />
              <Route path="seller/listings/" element={<ListingListSeller />} />
              <Route path="seller/listing/:id" element={<ListingDetailSeller />} />
              <Route path="seller/listing/delivery/:id" element={<ListingDeliverySeller />} />
              <Route path="purchases/" element={<Purchases />} />
              <Route path="payment-success/" element={<PaymentSuccess />} />
              <Route path="payment-error/" element={<PaymentError />} />
              <Route path="profile/" element={<Profile />} />
              <Route path="address/" element={<Profile />} />
              <Route path="name/" element={<Profile />} />
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
                  to="/profile"
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
      <WelcomePage />
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
