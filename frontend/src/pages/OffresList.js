import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Search, LocationOn, Business, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { offreAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OffresList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    ville: '',
    domaine: '',
    est_active: user?.role === 'STAGIAIRE' ? 'true' : '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOffres();
  }, [filters, page]);

  const fetchOffres = async () => {
    try {
      setLoading(true);
      
      // Pour les entreprises, utiliser l'endpoint qui filtre leurs offres
      if (user?.role === 'ENTREPRISE') {
        const response = await offreAPI.getMyOffres();
        setOffres(response.data.results || response.data || []);
        setTotalPages(1); // Pas de pagination pour les offres de l'entreprise
      } else {
        // Pour les stagiaires et visiteurs, utiliser l'endpoint général
        const params = {
          ...filters,
          page,
        };
        
        // Pour les stagiaires, ne montrer que les offres actives
        if (user?.role === 'STAGIAIRE') {
          params.est_active = 'true';
        }
        
        const response = await offreAPI.getOffres(params);
        setOffres(response.data.results || response.data || []);
        setTotalPages(Math.ceil((response.data.count || 0) / 10));
      }
    } catch (err) {
      setError('Erreur lors du chargement des offres');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
    setPage(1);
  };

  const getStatusColor = (est_active) => {
    return est_active ? 'success' : 'default';
  };

  const domaines = ['Informatique', 'Marketing', 'Finance', 'Ressources Humaines', 'Communication', 'Autre'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Offres de Stage
      </Typography>

      {/* Filtres */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Ville"
              variant="outlined"
              value={filters.ville}
              onChange={(e) => handleFilterChange('ville', e.target.value)}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="Paris">Paris</MenuItem>
              <MenuItem value="Lyon">Lyon</MenuItem>
              <MenuItem value="Marseille">Marseille</MenuItem>
              <MenuItem value="Toulouse">Toulouse</MenuItem>
              <MenuItem value="Lille">Lille</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Domaine"
              variant="outlined"
              value={filters.domaine}
              onChange={(e) => handleFilterChange('domaine', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {domaines.map((domaine) => (
                <MenuItem key={domaine} value={domaine}>
                  {domaine}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {user?.role !== 'STAGIAIRE' && (
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Statut"
                variant="outlined"
                value={filters.est_active}
                onChange={(e) => handleFilterChange('est_active', e.target.value)}
              >
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : offres.length === 0 ? (
        <Alert severity="info">Aucune offre trouvée.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {offres.map((offre) => (
              <Grid item xs={12} md={6} key={offre.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {offre.titre}
                      </Typography>
                      {user?.role !== 'STAGIAIRE' && (
                        <Chip
                          label={offre.est_active ? 'Active' : 'Inactive'}
                          color={getStatusColor(offre.est_active)}
                          size="small"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {offre.description.length > 150
                        ? `${offre.description.substring(0, 150)}...`
                        : offre.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                      <Chip
                        icon={<LocationOn />}
                        label={offre.ville}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Business />}
                        label={offre.domaine}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CalendarToday />}
                        label={offre.duree}
                        size="small"
                        variant="outlined"
                      />
                      {offre.entreprise && (
                        <Chip
                          label={offre.entreprise.nom_entreprise}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/offres/${offre.id}`)}
                    >
                      Voir les détails
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default OffresList;

