import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Download, CheckCircle, Cancel, ArrowBack } from '@mui/icons-material';
import { candidatureAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CandidaturesList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidatures, setCandidatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidatures();
  }, [id]);

  const fetchCandidatures = async () => {
    try {
      setLoading(true);
      const candidaturesResponse = await candidatureAPI.getCandidaturesByOffre(id);
      setCandidatures(candidaturesResponse.data.results || candidaturesResponse.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };


  const handleAccept = async (candidatureId) => {
    try {
      await candidatureAPI.acceptCandidature(candidatureId);
      fetchCandidatures();
    } catch (err) {
      alert('Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async (candidatureId) => {
    try {
      await candidatureAPI.rejectCandidature(candidatureId);
      fetchCandidatures();
    } catch (err) {
      alert('Erreur lors du refus');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Candidatures pour l'offre
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        {candidatures.length === 0 ? (
          <Alert severity="info">Aucune candidature pour cette offre.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stagiaire</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Date de candidature</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {candidatures.map((candidature) => (
                  <TableRow key={candidature.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {candidature.stagiaire?.prenom} {candidature.stagiaire?.nom}
                      </Typography>
                    </TableCell>
                    <TableCell>{candidature.stagiaire?.user?.email || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={candidature.statut === 'ACCEPTEE' ? 'Acceptée' : candidature.statut === 'REFUSEE' ? 'Refusée' : 'En attente'}
                        color={getStatusColor(candidature.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {candidature.stagiaire?.cv_file && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              const cvUrl = candidature.stagiaire.cv_file;
                              // Si c'est une URL complète, l'utiliser directement, sinon construire l'URL complète
                              const fullUrl = cvUrl.startsWith('http') ? cvUrl : `http://localhost:8000${cvUrl}`;
                              window.open(fullUrl, '_blank');
                            }}
                            title="Voir le CV"
                          >
                            <Download />
                          </IconButton>
                        )}
                        {candidature.statut === 'EN_ATTENTE' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAccept(candidature.id)}
                              title="Accepter"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(candidature.id)}
                              title="Refuser"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default CandidaturesList;

