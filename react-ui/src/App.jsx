import { useEffect, useState } from "react";
import './App.css';
/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Link as RouterLink, Route, Routes, MemoryRouter
} from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import CssBaseline from '@mui/material/CssBaseline';
import CreateTokenForm from "./components/AddItem";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AppsIcon from '@mui/icons-material/Apps';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import WebStoriesIcon from '@mui/icons-material/WebStories';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from "./components/Navbar";
import ListingCreate from "./components/ListingCreate";
import ListingList from "./components/ListingList";
import ListingUpdate from "./components/ListingUpdate";

function Router(props) {
  const { children } = props;
  if (typeof window === 'undefined') {
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
    window.MDS.init();
  }, []);
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Navbar />
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 10
            }}
          >
            <Routes>
              <Route exact path="/" element={<ListingList />} />
              <Route path="/edit/:id" element={<ListingUpdate />} />
              <Route path="/create" element={<ListingCreate />} />
            </Routes>
          </Box>
        </Container>
      </ThemeProvider>
    </Router>
  );
}

export default App;