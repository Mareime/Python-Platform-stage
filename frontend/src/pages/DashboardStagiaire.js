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
} from '@mui/material';
import { Description, Work, CheckCircle, Pending } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { cvAPI, candidatureAPI } from '../services/api';
import { Link } from 'react-router-dom';

const DashboardStagiaire = () => {
  const { user } = useAuth();
  const [cv, setCv] = useState(null);
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cvResponse, candidaturesResponse] = await Promise.all([
        cvAPI.getCV().catch(() => ({ data: null })),
        candidatureAPI.getMyCandidatures(),
      ]);
      
      if (cvResponse.data && cvResponse.data.file) {
        setCv(cvResponse.data);
      }
      setCandidatures(candidaturesResponse.data.results || candidaturesResponse.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTEE':
        return 'success';
      case 'REFUSEE':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      default:
        return 'En attente';
    }
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
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Stagiaire
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bienvenue, {user?.stagiaire_profile?.prenom || ''} {user?.stagiaire_profile?.nom || ''}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* CV Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mon CV
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/cv"
                  size="small"
                >
                  {cv ? 'Modifier' : 'Déposer'}
                </Button>
              </Box>
              {cv ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    CV disponible
                  </Typography>
                  <Chip
                    label="CV actif"
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              ) : (
                <Alert severity="info">
                  Vous n'avez pas encore déposé de CV. Déposez-en un pour pouvoir postuler aux offres.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {candidatures.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Candidatures
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {candidatures.filter(c => c.statut === 'ACCEPTEE').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Acceptées
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Candidatures Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Mes Candidatures
                </Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/offres"
                  size="small"
                >
                  Voir les offres
                </Button>
              </Box>
              
              {candidatures.length === 0 ? (
                <Alert severity="info">
                  Vous n'avez pas encore postulé à une offre. Parcourez les offres disponibles pour commencer.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Offre</TableCell>
                        <TableCell>Entreprise</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {candidatures.map((candidature) => (
                        <TableRow key={candidature.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {candidature.offre?.titre}
                            </Typography>
                          </TableCell>
                          <TableCell>{candidature.offre?.entreprise?.nom_entreprise}</TableCell>
                          <TableCell>
                            {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(candidature.statut)}
                              color={getStatusColor(candidature.statut)}
                              size="small"
                              icon={
                                candidature.statut === 'ACCEPTEE' ? (
                                  <CheckCircle />
                                ) : (
                                  <Pending />
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              component={Link}
                              to={`/offres/${candidature.offre?.id}`}
                            >
                              Voir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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

export default DashboardStagiaire;

