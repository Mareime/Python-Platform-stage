import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle } from '@mui/icons-material';
import { notificationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    fetchUnreadCount();
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        fetchUnreadCount();
      }
    }, 30000); // Rafraîchir toutes les 30 secondes
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications();
    }
  }, [anchorEl]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch (err) {
      // Ignore errors
      setUnreadCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications({ is_read: 'false' });
      setNotifications(response.data.results || response.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleNotificationClick = useCallback(async (notification) => {
    // Fermer le popover immédiatement
    setAnchorEl(null);
    
    // Marquer comme lue
    if (!notification.is_read) {
      try {
        await notificationAPI.markAsRead(notification.id);
        if (isMountedRef.current) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
          );
        }
      } catch (err) {
        console.error('Erreur lors du marquage de la notification:', err);
      }
    }

    // Naviguer selon le type de notification après un délai pour laisser React nettoyer le DOM
    if (notification.related_object_id && isMountedRef.current) {
      // Délai plus long pour laisser le Popover se fermer complètement
      setTimeout(() => {
        if (!isMountedRef.current) return;
        
        try {
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
        } catch (error) {
          console.warn('Navigation error:', error);
        }
      }, 300);
    }
  }, [navigate]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
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

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      {anchorEl && (
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: { width: 400, maxHeight: 500 }
          }}
          disableRestoreFocus
          TransitionProps={{
            timeout: 150,
          }}
        >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead}>
                Tout marquer comme lu
              </Button>
            )}
          </Box>
          
          <Divider />
          
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Aucune notification
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  disablePadding
                  sx={{
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemButton onClick={() => handleNotificationClick(notification)}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{getNotificationIcon(notification.type)}</span>
                          <Typography variant="body2" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                            {notification.title}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          
          {notifications.length > 0 && (
            <Box p={1} textAlign="center">
              <Button
                size="small"
                fullWidth
                onClick={() => {
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
                Voir toutes les notifications
              </Button>
            </Box>
          )}
        </Box>
        </Popover>
      )}
    </>
  );
};

export default NotificationBell;

