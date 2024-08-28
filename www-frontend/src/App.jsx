import React, { useReducer, useState } from 'react';
import {Routes, Route, Link} from 'react-router-dom';
import {AppBar, ToolBar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon} from '@mui/material';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import './App.css'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
            Weather App
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
            <ListItemText primary="Inicio" />
          </ListItem>
          <ListItem button component={Link} to="/search" onClick={toggleDrawer}>
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Buscar" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar /> {/* This empty toolbar is necessary to offset the content below the AppBar */}
    </>
  );
}

export default App
