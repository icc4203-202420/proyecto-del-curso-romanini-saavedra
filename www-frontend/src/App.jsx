import React, { useReducer, useState } from 'react';
import {Routes, Route, Link, useLocation} from 'react-router-dom';
import {AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon} from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import Beers from './components/Beers';
import Bars from './components/Bars';
import Home from './components/Home';
import Users from './components/Users';
import BarEvents from './components/BarEvents';
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
      case '/bars':
        return 'Bars'
      case '/users':
        return 'Users'
      case '/':
        return 'BeerMates';
      default:
        return 'BeerMates';
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{backgroundColor: 'rgb(78, 42, 30)'}}>
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
          <ListItem button component={Link} to="/bars" onClick={toggleDrawer}>
            <ListItemIcon>
              <LocalDiningIcon />
            </ListItemIcon>
            <ListItemText primary="Bars" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar /> {/* This empty toolbar is necessary to offset the content below the AppBar */}
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/beers" element={<Beers/>}/>
        <Route path="/bars" element={<Bars/>}/>
        <Route path="/bars/:bar_id/events" element={<BarEvents />} />
        <Route path="/users" element={<Users/>}/>
      </Routes>
    </>
  );
}

export default App;
