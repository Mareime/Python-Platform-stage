import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  LocationOn,
  Business,
  CalendarToday,
  Description,
  ArrowBack,
} from '@mui/icons-material';
import { offreAPI, candidatureAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OffreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offre, setOffre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchOffre();
    checkApplication();
  }, [id]);

  const fetchOffre = async () => {
    try {
      setLoading(true);
      const response = await offreAPI.getOffre(id);
      setOffre(response.data);
    } catch (err) {
      setError('Erreur lors du chargement de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    if (user?.role === 'STAGIAIRE') {
      try {
        const response = await candidatureAPI.getMyCandidatures();
        const candidatures = response.data.results || response.data || [];
        const applied = candidatures.some(c => c.offre?.id === parseInt(id));
        setHasApplied(applied);
      } catch (err) {
        // Ignore error
      }
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await candidatureAPI.createCandidature({ offre_id: parseInt(id), lettre_motivation: '' });
      setHasApplied(true);
      setDialogOpen(false);
      await checkApplication(); // Re-vérifier les candidatures
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Erreur lors de la candidature';
      alert(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    } finally {
      setApplying(false);
    }
  };

  // Vérifier si l'offre est disponible pour candidature
  const isOffreAvailable = () => {
    if (!offre) return false;
    
    // Vérifier si l'offre est active
    if (!offre.est_active) return false;
    
    // Vérifier si l'offre est expirée
    if (offre.date_limite) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateLimite = new Date(offre.date_limite);
      if (dateLimite < today) return false;
    }
    
    // Vérifier si l'offre est complète (toutes les places sont prises)
    // Note: Le backend devrait déjà filtrer ces offres, mais on vérifie quand même
    const placesPrises = offre.candidatures?.filter(c => c.statut === 'ACCEPTEE').length || 0;
    if (offre.nombre_places && placesPrises >= offre.nombre_places) return false;
    
    return true;
  };

  const getOffreStatusMessage = () => {
    if (!offre) return null;
    
    if (!offre.est_active) {
      return { type: 'warning', message: 'Cette offre n\'est plus active.' };
    }
    
    if (offre.date_limite) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateLimite = new Date(offre.date_limite);
      if (dateLimite < today) {
        return { type: 'warning', message: 'Cette offre a expiré. La date limite de candidature est passée.' };
      }
    }
    
    const placesPrises = offre.candidatures?.filter(c => c.statut === 'ACCEPTEE').length || 0;
    if (offre.nombre_places && placesPrises >= offre.nombre_places) {
      return { type: 'info', message: 'Cette offre est complète. Toutes les places ont été prises.' };
    }
    
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !offre) {
    return (
      <Container>
        <Alert severity="error">{error || 'Offre non trouvée'}</Alert>
        <Button component={Link} to="/offres" sx={{ mt: 2 }}>
          Retour aux offres
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/offres')}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {offre.titre}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              <Chip
                icon={<LocationOn />}
                label={offre.ville}
                variant="outlined"
              />
              <Chip
                icon={<Business />}
                label={offre.domaine}
                variant="outlined"
              />
              {user?.role !== 'STAGIAIRE' && (
                      <Chip
                        label={offre.est_active ? 'Active' : 'Inactive'}
                        color={offre.est_active ? 'success' : 'default'}
                      />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Entreprise
            </Typography>
            <Typography variant="body1" gutterBottom>
              {offre.entreprise?.nom_entreprise}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Durée
            </Typography>
            <Typography variant="body1" gutterBottom>
              {offre.duree}
            </Typography>
          </Grid>

          {offre.date_debut && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Date de début
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(offre.date_debut).toLocaleDateString('fr-FR')}
              </Typography>
            </Grid>
          )}

          {offre.date_limite && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Date limite de candidature
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(offre.date_limite).toLocaleDateString('fr-FR')}
              </Typography>
            </Grid>
          )}
          {offre.remuneration && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rémunération
              </Typography>
              <Typography variant="body1" gutterBottom>
                {offre.remuneration}
              </Typography>
            </Grid>
          )}
          {offre.type_stage && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Type de stage
              </Typography>
              <Typography variant="body1" gutterBottom>
                {offre.type_stage === 'OBSERVATION' ? 'Stage d\'observation' :
                 offre.type_stage === 'INITIATION' ? 'Stage d\'initiation' :
                 offre.type_stage === 'PERFECTIONNEMENT' ? 'Stage de perfectionnement' :
                 offre.type_stage === 'PFE' ? 'Projet de fin d\'études' : offre.type_stage}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {offre.description}
            </Typography>
          </Grid>

          {offre.competences_requises && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Compétences requises
              </Typography>
              <Typography variant="body1">
                {offre.competences_requises}
              </Typography>
            </Grid>
          )}
        </Grid>

        {user?.role === 'STAGIAIRE' && (
          <Box mt={4}>
            {hasApplied ? (
              <Alert severity="success">
                Vous avez déjà postulé à cette offre.
              </Alert>
            ) : (() => {
              const statusMessage = getOffreStatusMessage();
              if (statusMessage) {
                return (
                  <Alert severity={statusMessage.type}>
                    {statusMessage.message}
                  </Alert>
                );
              }
              
              if (isOffreAvailable()) {
                return (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setDialogOpen(true)}
                    fullWidth
                  >
                    Postuler à cette offre
                  </Button>
                );
              }
              
              return null;
            })()}
          </Box>
        )}

        {user?.role === 'ENTREPRISE' && offre.entreprise && (
          <Box mt={4} display="flex" gap={2}>
            <Button
              variant="outlined"
              component={Link}
              to={`/offres/${id}/edit`}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to={`/offres/${id}/candidatures`}
            >
              Voir les candidatures
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Postuler à cette offre</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir postuler à cette offre ? Votre CV sera envoyé à l'entreprise.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={applying}
          >
            {applying ? <CircularProgress size={24} /> : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OffreDetail;

