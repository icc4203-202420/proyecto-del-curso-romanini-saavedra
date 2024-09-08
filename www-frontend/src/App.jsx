import React, { useReducer, useState, useEffect } from 'react';
import {Routes, Route, Link, useLocation} from 'react-router-dom';
import {AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import useLocalStorageState from 'use-local-storage-state';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import SportsBarIcon from '@mui/icons-material/SportsBar';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import axios from 'axios';
import Beers from './components/Beers';
import Bars from './components/Bars';
import Home from './components/Home';
import Users from './components/Users';
import BarEvents from './components/BarEvents';
import LoginForm from './components/Login';
import SignupForm from './components/Signup';
import './App.css'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [token, setToken] = useLocalStorageState('app-token', { defaultValue: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:3001/api/v1/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        console.log('response test info:',response)
        const user = response.data.user;
        setIsAuthenticated(true);
        setUsername(`${user.first_name} ${user.last_name}`);
        setLoading(false);
        navigate('/')
      })
      .catch(error => {
        console.error('Error during authentication:', error);
        setToken('');
        setIsAuthenticated(false);
        setUsername('');
        navigate('/login');
      });
    } else {
      setIsAuthenticated(false);
      setLoading(false)
      setUsername('');
    }
  }, [token]);

  const handleJWT = (token) => {
    setToken(token);
  }

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    setUsername('');
    navigate('/login');
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
      <AppBar position="fixed" sx={{ backgroundColor: 'rgb(78, 42, 30)' }}>
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
          keepMounted: true,
        }}
      >
        <List>
          {!isAuthenticated ? (
            <>
              <ListItem button component={Link} to="/login" onClick={toggleDrawer}>
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Iniciar Sesión" />
              </ListItem>
              <ListItem button component={Link} to="/signup" onClick={toggleDrawer}>
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="Crear cuenta" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem>
                <ListItemText primary={`Usuario: ${username}`} />
              </ListItem>
              <ListItem button onClick={() => { handleLogout(); toggleDrawer(); }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
              </ListItem>
            </>
          )}
          <ListItem button component={Link} to="/" onClick={toggleDrawer}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Inicio" />
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
        <Route path="/" element={<Home />} />
        <Route path="/beers" element={<Beers />} />
        <Route path="/bars" element={<Bars />} />
        <Route path="/bars/:bar_id/events" element={<BarEvents />} />
        <Route path="/users" element={<Users />} />
        <Route path="/login" element={<LoginForm tokenHandler={handleJWT} />} />
        <Route path="/signup" element={<SignupForm tokenHandler={handleJWT} />} />
      </Routes>
    </>
  );
}

export default App;
