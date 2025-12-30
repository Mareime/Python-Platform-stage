import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import { offreAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OffreEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    titre: '',
    type_stage: 'INITIATION',
    description: '',
    domaine: '',
    ville: '',
    duree: '',
    date_debut: '',
    date_limite: '',
    competences_requises: '',
    remuneration: '',
    nombre_places: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchOffre();
  }, [id]);

  const fetchOffre = async () => {
    try {
      setFetching(true);
      const response = await offreAPI.getOffre(id);
      const offre = response.data;
      
      // Vérifier que l'utilisateur est propriétaire de l'offre
      if (user?.role === 'ENTREPRISE' && offre.entreprise?.user?.id !== user.id) {
        setError('Vous n\'avez pas la permission de modifier cette offre');
        setTimeout(() => navigate('/dashboard/entreprise'), 2000);
        return;
      }
      
      // Pré-remplir le formulaire avec les données de l'offre
      setFormData({
        titre: offre.titre || '',
        type_stage: offre.type_stage || 'INITIATION',
        description: offre.description || '',
        domaine: offre.domaine || '',
        ville: offre.ville || '',
        duree: offre.duree || '',
        date_debut: offre.date_debut ? offre.date_debut.split('T')[0] : '',
        date_limite: offre.date_limite ? offre.date_limite.split('T')[0] : '',
        competences_requises: offre.competences_requises || '',
        remuneration: offre.remuneration || '',
        nombre_places: offre.nombre_places || 1,
      });
    } catch (err) {
      setError('Erreur lors du chargement de l\'offre');
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/dashboard/entreprise'), 2000);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation côté client : vérifier que la date de début n'est pas dans le passé
    if (formData.date_debut) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateDebut = new Date(formData.date_debut);
      
      if (dateDebut < today) {
        setError('La date de début ne peut pas être dans le passé');
        setLoading(false);
        return;
      }
    }

    // Validation côté client : vérifier que la date limite n'est pas dans le passé
    if (formData.date_limite) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateLimite = new Date(formData.date_limite);
      
      if (dateLimite < today) {
        setError('La date limite de candidature ne peut pas être dans le passé');
        setLoading(false);
        return;
      }
      
      // Vérifier que la date limite est après la date de début si les deux sont fournies
      if (formData.date_debut) {
        const dateDebut = new Date(formData.date_debut);
        if (dateLimite < dateDebut) {
          setError('La date limite doit être après ou égale à la date de début');
          setLoading(false);
          return;
        }
      }
    }

    try {
      await offreAPI.updateOffre(id, formData);
      navigate(`/offres/${id}`);
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.values(err.response.data).flat().join(', ');
        setError(errors);
      } else {
        setError('Erreur lors de la modification de l\'offre');
      }
    } finally {
      setLoading(false);
    }
  };

  const domaines = ['Informatique', 'Marketing', 'Finance', 'Ressources Humaines', 'Communication', 'Autre'];
  const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Lille', 'Bordeaux', 'Nantes', 'Strasbourg'];
  const typesStage = [
    { value: 'OBSERVATION', label: 'Stage d\'observation' },
    { value: 'INITIATION', label: 'Stage d\'initiation' },
    { value: 'PERFECTIONNEMENT', label: 'Stage de perfectionnement' },
    { value: 'PFE', label: 'Projet de fin d\'études' },
  ];

  if (fetching) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Modifier l'offre de stage
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de l'offre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type de stage"
                name="type_stage"
                value={formData.type_stage}
                onChange={handleChange}
                required
              >
                {typesStage.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Domaine"
                name="domaine"
                value={formData.domaine}
                onChange={handleChange}
                required
              >
                {domaines.map((domaine) => (
                  <MenuItem key={domaine} value={domaine}>
                    {domaine}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={6}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Ville"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                required
              >
                {villes.map((ville) => (
                  <MenuItem key={ville} value={ville}>
                    {ville}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Durée (ex: 6 mois)"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début"
                name="date_debut"
                type="date"
                value={formData.date_debut}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date limite de candidature"
                name="date_limite"
                type="date"
                value={formData.date_limite}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rémunération"
                name="remuneration"
                value={formData.remuneration}
                onChange={handleChange}
                placeholder="Ex: 600€/mois"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de places"
                name="nombre_places"
                type="number"
                value={formData.nombre_places}
                onChange={handleChange}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Compétences requises"
                name="competences_requises"
                value={formData.competences_requises}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Ex: Python, Django, React, Communication..."
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/offres/${id}`)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default OffreEdit;

