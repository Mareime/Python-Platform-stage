import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Work, Add, Visibility, Download } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { offreAPI, candidatureAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const DashboardEntreprise = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offresResponse, candidaturesResponse] = await Promise.all([
        offreAPI.getMyOffres(),
        candidatureAPI.getCandidatures(),
      ]);
      
      setOffres(offresResponse.data.results || offresResponse.data || []);
      setCandidatures(candidaturesResponse.data.results || candidaturesResponse.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (est_active) => {
    return est_active ? 'success' : 'default';
  };

  const getStatusLabel = (est_active) => {
    return est_active ? 'Active' : 'Inactive';
  };

  const handleViewCandidatures = (offreId) => {
    navigate(`/offres/${offreId}/candidatures`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Entreprise
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenue, {user?.entreprise_profile?.nom_entreprise || user?.email}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          to="/offres/create"
        >
          Publier une offre
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Box textAlign="center" mt={2}>
                <Typography variant="h4" color="primary">
                  {offres.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Offres publiées
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Candidatures
              </Typography>
              <Box textAlign="center" mt={2}>
                <Typography variant="h4" color="success.main">
                  {candidatures.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Candidatures reçues
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Offres validées
              </Typography>
              <Box textAlign="center" mt={2}>
                <Typography variant="h4" color="info.main">
                  {offres.filter(o => o.est_active).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Actives
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Offres Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mes Offres
              </Typography>
              
              {offres.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Vous n'avez pas encore publié d'offre. Créez votre première offre pour commencer à recevoir des candidatures.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Titre</TableCell>
                        <TableCell>Domaine</TableCell>
                        <TableCell>Ville</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Candidatures</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {offres.map((offre) => {
                        const offreCandidatures = candidatures.filter(
                          c => c.offre?.id === offre.id
                        );
                        return (
                          <TableRow key={offre.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {offre.titre}
                              </Typography>
                            </TableCell>
                            <TableCell>{offre.domaine}</TableCell>
                            <TableCell>{offre.ville}</TableCell>
                            <TableCell>
                              {new Date(offre.date_creation).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(offre.est_active)}
                                color={getStatusColor(offre.est_active)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => handleViewCandidatures(offre.id)}
                              >
                                {offreCandidatures.length} candidature(s)
                              </Button>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                component={Link}
                                to={`/offres/${offre.id}`}
                              >
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardEntreprise;

