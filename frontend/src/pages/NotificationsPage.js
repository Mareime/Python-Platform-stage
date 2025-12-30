import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Delete,
  CheckCircle,
  MoreVert,
} from '@mui/icons-material';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [tabValue]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (tabValue === 1) {
        params.is_read = 'true';
      } else if (tabValue === 0) {
        params.is_read = 'false';
      }
      
      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.results || response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleNotificationClick = useCallback(async (notification) => {
    // Marquer comme lue si non lue
    if (!notification.is_read) {
      try {
        await notificationAPI.markAsRead(notification.id);
        if (isMountedRef.current) {
          setNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
          );
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    }

    // Naviguer selon le type après un court délai pour laisser React nettoyer le DOM
    if (notification.related_object_id && isMountedRef.current) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (!isMountedRef.current) return;
          
          if (notification.type === 'NOUVELLE_CANDIDATURE' ||
              notification.type === 'CANDIDATURE_ACCEPTEE' ||
              notification.type === 'CANDIDATURE_REFUSEE') {
            navigate(`/offres/${notification.related_object_id}/candidatures`);
          } else if (notification.type === 'OFFRE_VALIDEE' || notification.type === 'OFFRE_REFUSEE') {
            navigate(`/offres/${notification.related_object_id}`);
          } else if (notification.type === 'NOUVEAU_STAGIAIRE') {
            // Pour les entreprises : rediriger vers le dashboard admin ou la liste des stagiaires
            // Pour l'instant, on reste sur la page actuelle
            // navigate(`/dashboard/admin`); // Optionnel
          }
        }, 150);
      });
    }
  }, [navigate]);

  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async () => {
    if (selectedNotification && !selectedNotification.is_read) {
      try {
        await notificationAPI.markAsRead(selectedNotification.id);
        setNotifications(prev =>
          prev.map(n => n.id === selectedNotification.id ? { ...n, is_read: true } : n)
        );
      } catch (err) {
        alert('Erreur lors du marquage de la notification');
      }
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedNotification) {
      try {
        // Note: L'endpoint delete n'existe pas encore dans le backend
        // On peut simplement filtrer côté frontend pour l'instant
        setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
    handleMenuClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      await fetchNotifications();
    } catch (err) {
      alert('Erreur lors du marquage de toutes les notifications');
    }
  };

  const handleDeleteAllRead = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications lues ?')) {
      try {
        // Note: L'endpoint deleteAllRead n'existe pas encore dans le backend
        // On peut simplement filtrer côté frontend pour l'instant
        setNotifications(prev => prev.filter(n => !n.is_read));
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NOUVELLE_CANDIDATURE':
        return '📝';
      case 'CANDIDATURE_ACCEPTEE':
        return '✅';
      case 'CANDIDATURE_REFUSEE':
        return '❌';
      case 'OFFRE_VALIDEE':
        return '✓';
      case 'OFFRE_REFUSEE':
        return '✗';
      case 'NOUVEAU_STAGIAIRE':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'CANDIDATURE_ACCEPTEE':
      case 'OFFRE_VALIDEE':
        return 'success';
      case 'CANDIDATURE_REFUSEE':
      case 'OFFRE_REFUSEE':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'NOUVELLE_CANDIDATURE': 'Nouvelle candidature',
      'CANDIDATURE_ACCEPTEE': 'Candidature acceptée',
      'CANDIDATURE_REFUSEE': 'Candidature refusée',
      'OFFRE_VALIDEE': 'Offre validée',
      'OFFRE_REFUSEE': 'Offre refusée',
      'NOUVEAU_STAGIAIRE': 'Nouveau stagiaire inscrit',
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Mes Notifications
        </Typography>
        <Box>
          {tabValue === 0 && notifications.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckCircle />}
              onClick={handleMarkAllAsRead}
              sx={{ mr: 1 }}
            >
              Tout marquer comme lu
            </Button>
          )}
          {tabValue === 1 && notifications.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={handleDeleteAllRead}
            >
              Supprimer les lues
            </Button>
          )}
        </Box>
      </Box>

      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Non lues (${notifications.filter(n => !n.is_read).length})`} />
          <Tab label="Lues" />
          <Tab label="Toutes" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {tabValue === 0
                ? 'Aucune notification non lue'
                : tabValue === 1
                ? 'Aucune notification lue'
                : 'Aucune notification'}
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                disablePadding
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={(e) => handleMenuOpen(e, notification)}
                  >
                    <MoreVert />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => handleNotificationClick(notification)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="h5">{getNotificationIcon(notification.type)}</Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography
                          variant="body1"
                          fontWeight={notification.is_read ? 'normal' : 'bold'}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getTypeLabel(notification.type)}
                          color={getNotificationColor(notification.type)}
                          size="small"
                        />
                        {!notification.is_read && (
                          <Chip label="Non lu" color="primary" size="small" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {new Date(notification.created_at).toLocaleString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.is_read && (
          <MenuItem onClick={handleMarkAsRead}>
            <CheckCircle sx={{ mr: 1 }} />
            Marquer comme lu
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default NotificationsPage;

