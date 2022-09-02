import { useEffect, useState } from "react";
import './App.css';
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Link as RouterLink, Route, Routes, MemoryRouter, useLocation
} from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import CssBaseline from '@mui/material/CssBaseline';
import ReceiveTransaction from "./ReceiveTransaction";
import CreateTokenForm from "./CreateTokenForm";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AppsIcon from '@mui/icons-material/Apps';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import WebStoriesIcon from '@mui/icons-material/WebStories';
import Transaction from "./Transaction";
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import SendTokenButton from './SendTokenButton';
import ResponsiveAppBar from "./ResponsiveAppBar";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InteractiveList from "./ItemLIst";

function Router(props) {
  const { children } = props;
  if (typeof window === 'undefined') {
    return <StaticRouter location="/">{children}</StaticRouter>;
  }

  return <MemoryRouter>{children}</MemoryRouter>;
}

Router.propTypes = {
  children: PropTypes.node,
};

const theme = createTheme();


function App() {
  const [data, setData] = useState();
  const [activePage, setActivePage] = useState();

  useEffect(() => {
    window.MDS.init((msg) => {
      if (msg.event === 'MAXIMA') {
        console.log(msg);
        if (msg.data.data) {
          //TODO: you could check here for correct application
          setData(msg.data.data);
        }
      }
    });
  }, []);

  function Content() {
    const location = useLocation();
    return (
      <Typography variant="body2" sx={{ pb: 2 }} color="text.secondary">
        Current route: {location.pathname}
      </Typography>
    );
  }



  return (
    <Router>
      <ThemeProvider theme={theme}>
        <ResponsiveAppBar />
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {data ? <ReceiveTransaction data={data} /> : ''}
            <Routes>
              <Route path="/favourites" element={<CreateTokenForm />} />
              <Route path="/marketplace" element={<InteractiveList />} />
              <Route path="/my-items" element={<CreateTokenForm />} />
              <Route path="/sell" element={<Transaction />} />
            </Routes>
            <Routes>
              <Route path="*" element={<Content />} />
            </Routes>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
              <BottomNavigation
                showLabels
                value={activePage}
                onChange={(event, page) => {
                  setActivePage(page);
                }}

              >
                <BottomNavigationAction component={RouterLink} to="/favourites" label="Favorites" icon={<FavoriteIcon />} />
                <BottomNavigationAction component={RouterLink} to="/marketplace" label="Explore" icon={<AppsIcon />} />
                <BottomNavigationAction component={RouterLink} to="/my-items" label="Add Item" icon={<WebStoriesIcon />} />
                <BottomNavigationAction component={RouterLink} to="/sell" label="Sell Item" icon={<MonetizationOnIcon />} />
              </BottomNavigation>
            </Paper>
          </Box>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;