import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Upload, Delete, Description, Visibility, CloudUpload } from '@mui/icons-material';
import { cvAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CVManagement = () => {
  const { user } = useAuth();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      setLoading(true);
      const response = await cvAPI.getCV();
      console.log('CV response:', response.data); // Debug
      if (response.data && response.data.file) {
        setCv(response.data);
      } else {
        setCv(null); // S'assurer que cv est null si pas de fichier
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du CV:', err);
      setCv(null); // S'assurer que cv est null en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés');
      e.target.value = '';
      return;
    }

    // Vérifier la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Le fichier ne doit pas dépasser 10MB');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('cv_file', file);

      // Uploader ou mettre à jour le CV
      const response = await cvAPI.uploadCV(formData);
      console.log('Upload response:', response.data); // Debug
      
      setSuccess('CV déposé avec succès');

      // Attendre un peu avant de recharger pour s'assurer que le serveur a traité
      setTimeout(async () => {
        await fetchCV();
      }, 500);
    } catch (err) {
      console.error('Erreur lors du dépôt du CV:', err);
      console.error('Error details:', err.response?.data); // Debug
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.response?.data?.detail
        || (err.response?.data && typeof err.response.data === 'object' 
            ? Object.values(err.response.data).flat().join(', ')
            : 'Erreur lors du dépôt du CV');
      setError(errorMessage);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre CV ? Cette action est irréversible.')) {
      return;
    }

    try {
      setError('');
      await cvAPI.deleteCV();
      setCv(null);
      setSuccess('CV supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression du CV');
    }
  };

  const handleViewCV = async () => {
    if (!cv) {
      setError('Aucun CV disponible');
      return;
    }

    try {
      // Utiliser l'endpoint API pour visualiser le CV avec authentification
      const response = await cvAPI.viewCV();
      
      // Créer un blob URL à partir de la réponse
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Ouvrir le CV dans un nouvel onglet
      window.open(url, '_blank');
      
      // Nettoyer l'URL après un délai
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du CV:', err);
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || 'Impossible d\'ouvrir le CV';
      setError(errorMessage);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion de mon CV
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Votre CV sera utilisé pour vos candidatures aux offres de stage
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        {cv ? (
          <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Description sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="h6">CV déposé</Typography>
                      <Chip label="Actif" color="success" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      CV disponible
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Tooltip title="Voir le CV">
                    <IconButton 
                      color="primary" 
                      onClick={handleViewCV}
                      disabled={!cv.file}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer le CV">
                    <IconButton color="error" onClick={handleDelete}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box textAlign="center" py={4}>
            <CloudUpload sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              Aucun CV déposé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Déposez votre CV pour pouvoir postuler aux offres de stage
            </Typography>
          </Box>
        )}

        <Box mt={cv ? 2 : 4}>
          <input
            accept="application/pdf"
            style={{ display: 'none' }}
            id="cv-upload"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="cv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
              fullWidth
              size="large"
              disabled={uploading}
            >
              {uploading ? 'Téléchargement en cours...' : cv ? 'Remplacer le CV' : 'Déposer un CV'}
            </Button>
          </label>
          <Typography variant="caption" display="block" textAlign="center" mt={1} color="text.secondary">
            Format accepté: PDF uniquement (max 10MB)
          </Typography>
        </Box>

        {!cv && (
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Conseils :</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Assurez-vous que votre CV est à jour<br />
              • Utilisez un format PDF pour garantir la compatibilité<br />
              • Vérifiez que toutes vos informations sont correctes<br />
              • Un CV clair et bien structuré augmente vos chances
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default CVManagement;