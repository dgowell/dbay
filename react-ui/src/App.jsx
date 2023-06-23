import "./App.css";
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import Marketplace from "./components/Marketplace";
import ListingDetail from "./components/ListingDetail";
import ListingCreate from "./components/ListingCreate";
import ListingPurchase from "./components/ListingPurchase";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentError from "./components/PaymentError";
import BottomNavBar from "./components/BottomNavBar";
import Purchases from "./components/Purchases";
import Profile from "./components/Profile";
import ListingDetailSeller from "./components/ListingDetailSeller";
import ListingListSeller from "./components/ListingListSeller";
import ListingDeliverySeller from "./components/ListingDeliverySeller";
import ListingTransmissionBuyer from "./components/ListingTransmissionBuyer";
import CollectionSuccess from "./components/CollectionSuccess";
import InfoPage from "./components/InfoPage";
import ArrangeCollection from "./components/ArrangeCollection";
import InstructionPage from "./components/InstructionPage";
//import DmaxClient from "./components/DmaxClient";
import Subscriptions from "./components/Subscriptions";

import "@fontsource/roboto";

const theme = createTheme({
  typography: {
    "fontFamily": `"Roboto", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightRegular": 400,
    "fontWeightMedium": 700
  },
  palette: {
    primary: {
      main: '#2e2e2e',
    },
    secondary: {
      main: '#6F83FF',
    },
    success: {
      main: '#6DDD89',
    },
    error: {
      main: '#FF4A4A',
    },
    grey: {
      main: '#8F8F8F',
    },
    white: {
      main: '#FFFFFF',
    },
    black: {
      main: '#000000',
    },
    clear: {
      main: 'rgba(255,255,255,0.2)',
    },
  }, overrides: {
    MuiButton: {
      root: {
        background: 'red'
      }
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
  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Container component="main" maxWidth="xs" sx={{ paddingBottom: '80px' }}>
        <CssBaseline />
        <Box>
          <Routes>
            <Route exact path="/" element={<Marketplace />} />
            <Route path="listing/create" element={<ListingCreate />} />
            <Route path="listing/:id" element={<ListingDetail />} />
            <Route path="listing/:id/purchase" element={<ListingPurchase />} />
            <Route path="listing/transmission/:id" element={<ListingTransmissionBuyer />} />
            <Route path="seller/listings/" element={<ListingListSeller />} />
            <Route path="seller/listing/:id" element={<ListingDetailSeller />} />
            <Route path="seller/listing/delivery/:id" element={<ListingDeliverySeller />} />
            <Route path="purchases/" element={<Purchases />} />
            <Route path="collection-success/" element={<CollectionSuccess />} />
            <Route path="payment-success/" element={<PaymentSuccess />} />
            <Route path="payment-error/" element={<PaymentError />} />
            <Route path="profile/" element={<Profile />} />
            <Route path="address/" element={<Profile />} />
            <Route path="name/" element={<Profile />} />
            <Route path="info/" element={<InfoPage />} />
            <Route path="arr-col/:id" element={<ArrangeCollection />} />
            <Route path="instruction/" element={<InstructionPage />} />
            <Route path="subscriptions/" element={<Subscriptions />} />
            {/*<Route path="dmax/" element={<DmaxClient />} />*/}
            <Route path="*" element={<NoMatch />} />
          </Routes>
          <BottomNavBar />
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