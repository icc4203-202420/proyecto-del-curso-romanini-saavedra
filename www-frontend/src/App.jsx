import React, { useReducer, useState } from 'react';
import {Routes, Route, Link, useLocation} from 'react-router-dom';
import {AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon} from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SportsBarIcon from '@mui/icons-material/SportsBar'
import Beers from './components/Beers';
import './App.css'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const getTitle = () => {
    switch (location.pathname) {
      case '/beers':
        return 'Beers';
      case '/':
        return 'BeerMates';
      default:
        return 'BeerMates';
    }
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {getTitle()}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <List>
          <ListItem button component={Link} to="/" onClick={toggleDrawer}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button component={Link} to="/beers" onClick={toggleDrawer}>
            <ListItemIcon>
              <SportsBarIcon />
            </ListItemIcon>
            <ListItemText primary="Beers" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar /> {/* This empty toolbar is necessary to offset the content below the AppBar */}
      <Routes>
        <Route path="/beers" element={<Beers/>}/>
      </Routes>
    </>
  );
}

export default App;
