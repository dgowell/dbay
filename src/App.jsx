import { useEffect, useState } from "react";
import minimaLogo from './minima_logo.png';
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
import WebStoriesIcon from '@mui/icons-material/WebStories';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';


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
        <Container component="main" maxWidth="xs">
          <div className="App">
            <section className="container">
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <img src={minimaLogo} className="logo" alt="logo" />
                {data ? <ReceiveTransaction data={data} /> : ''}
                <Routes>
                  <Route path="/my-items" element={<CreateTokenForm />} />
                  <Route path="/inbox" element={<CreateTokenForm />} />
                </Routes>
                <Routes>
                  <Route path="*" element={<Content />} />
                </Routes>
                <BottomNavigation
                  showLabels
                  value={activePage}
                  onChange={(event, page) => {
                    setActivePage(page);
                  }}
                  sx={{ width: 400 }}
                >
                  <BottomNavigationAction component={RouterLink} to="/favourites" label="Favorites" icon={<FavoriteIcon />} />
                  <BottomNavigationAction component={RouterLink} to="/marketplace" label="Explore" icon={<AppsIcon />} />
                  <BottomNavigationAction component={RouterLink} to="/my-items" label="My Items" icon={<WebStoriesIcon />} />
                  <BottomNavigationAction component={RouterLink} to="/inbox" label="Inbox" icon={<MailOutlineIcon />} />
                </BottomNavigation>
              </Box>
            </section>
          </div>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;