import React, { useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Work,
  Description,
  ExitToApp,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleMenu = useCallback((event) => {
    if (isMountedRef.current) {
      setAnchorEl(event.currentTarget);
    }
  }, []);

  const handleClose = useCallback((event, reason) => {
    // Ignorer les fermetures par clic sur backdrop pendant la navigation
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      if (isMountedRef.current) {
        setAnchorEl(null);
      }
    } else {
      if (isMountedRef.current) {
        setAnchorEl(null);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    handleClose();
    // Utiliser requestAnimationFrame pour s'assurer que le DOM est nettoyé
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!isMountedRef.current) return;
        logout();
        navigate('/');
      }, 150);
    });
  }, [logout, navigate, handleClose]);

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'STAGIAIRE':
        return '/dashboard/stagiaire';
      case 'ENTREPRISE':
        return '/dashboard/entreprise';
      case 'ADMIN':
        return '/dashboard/admin';
      default:
        return '/dashboard';
    }
  };

  const getBrandName = () => {
    if (!isAuthenticated || !user) {
      return 'StagePlatform';
    }
    
    // Afficher le nom selon le rôle de l'utilisateur
    switch (user.role) {
      case 'STAGIAIRE':
        const stagiaireName = user.stagiaire_profile 
          ? `${user.stagiaire_profile.prenom || ''} ${user.stagiaire_profile.nom || ''}`.trim()
          : user.email;
        return stagiaireName || 'Mon Dashboard';
      case 'ENTREPRISE':
        const entrepriseName = user.entreprise_profile?.nom_entreprise || user.email;
        return entrepriseName || 'Mon Dashboard';
      case 'ADMIN':
        return 'Dashboard Admin';
      default:
        return 'Mon Dashboard';
    }
  };

  const getBrandLink = () => {
    if (!isAuthenticated || !user) {
      return '/';
    }
    return getDashboardPath();
  };

  const handleBrandClick = useCallback((e) => {
    e.preventDefault();
    const link = getBrandLink();
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate(link);
        }
      }, 0);
    });
  }, [navigate]);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div"
          onClick={handleBrandClick}
          sx={{ 
            flexGrow: 0, 
            textDecoration: 'none', 
            color: 'inherit', 
            mr: 4,
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        >
          {getBrandName()}
        </Typography>
        
        {isAuthenticated && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/offres')}
            >
              <Work sx={{ mr: 1 }} />
              Offres
            </Button>
            
            {user?.role === 'STAGIAIRE' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/cv')}
              >
                <Description sx={{ mr: 1 }} />
                Mon CV
              </Button>
            )}
            
            {user?.role === 'ENTREPRISE' && (
              <Button 
                color="inherit" 
                onClick={() => navigate('/offres/create')}
              >
                <Work sx={{ mr: 1 }} />
                Publier une offre
              </Button>
            )}
          </Box>
        )}

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationBell />
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            
            {anchorEl && (
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableRestoreFocus
                disableAutoFocusItem
                TransitionProps={{
                  timeout: 150,
                }}
              >
                <MenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const path = getDashboardPath();
                    // Fermer le menu immédiatement
                    setAnchorEl(null);
                    // Utiliser un délai pour laisser le Menu se fermer
                    setTimeout(() => {
                      if (isMountedRef.current) {
                        try {
                          navigate(path);
                        } catch (error) {
                          console.warn('Navigation error:', error);
                        }
                      }
                    }, 300);
                  }}
                >
                  <Dashboard sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAnchorEl(null);
                    setTimeout(() => {
                      if (isMountedRef.current) {
                        try {
                          navigate('/notifications');
                        } catch (error) {
                          console.warn('Navigation error:', error);
                        }
                      }
                    }, 300);
                  }}
                >
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Notifications
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAnchorEl(null);
                    setTimeout(() => {
                      if (isMountedRef.current) {
                        try {
                          handleLogout();
                        } catch (error) {
                          console.warn('Logout error:', error);
                        }
                      }
                    }, 300);
                  }}
                >
                  <ExitToApp sx={{ mr: 1 }} />
                  Déconnexion
                </MenuItem>
              </Menu>
            )}
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Connexion
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Inscription
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

