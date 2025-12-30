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
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  People,
  Description,
  Work,
  Assignment,
  Add,
  Edit,
  Delete,
  Block,
  CheckCircleOutline,
  TrendingUp,
  Business,
  School,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { offreAPI, candidatureAPI, authAPI } from '../services/api';
import { Link } from 'react-router-dom';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [offres, setOffres] = useState([]);
  const [candidatures, setCandidatures] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // États pour les modales
  const [offreDialog, setOffreDialog] = useState({ open: false, mode: 'create', offre: null });
  const [candidatureDialog, setCandidatureDialog] = useState({ open: false, candidature: null });
  const [entrepriseDialog, setEntrepriseDialog] = useState({ open: false, mode: 'edit', entreprise: null });
  const [stagiaireDialog, setStagiaireDialog] = useState({ open: false, mode: 'edit', stagiaire: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null, name: '' });

  // États pour les formulaires
  const [offreForm, setOffreForm] = useState({
    titre: '',
    type_stage: 'INITIATION',
    domaine: '',
    description: '',
    competences_requises: '',
    duree: '',
    date_debut: '',
    date_limite: '',
    ville: '',
    remuneration: '',
    nombre_places: 1,
    est_active: true,
    entreprise_id: null,
  });

  const [candidatureForm, setCandidatureForm] = useState({
    statut: 'EN_ATTENTE',
    lettre_motivation: '',
    offre_id: null,
    stagiaire_id: null,
  });

  const [entrepriseForm, setEntrepriseForm] = useState({
    nom_entreprise: '',
    secteur_activite: '',
    telephone: '',
    adresse: '',
    ville: '',
    site_web: '',
    description: '',
    contact_nom: '',
    contact_prenom: '',
    contact_fonction: '',
    user_email: '',
    user_is_active: true,
  });

  const [stagiaireForm, setStagiaireForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    adresse: '',
    ville: '',
    niveau_etude: '',
    domaine: '',
    user_email: '',
    user_is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offresResponse, candidaturesResponse, entreprisesResponse, stagiairesResponse] = await Promise.all([
        offreAPI.getOffres(),
        candidatureAPI.getCandidatures().catch(() => ({ data: [] })),
        authAPI.getEntreprises().catch(() => ({ data: [] })),
        authAPI.getStagiaires().catch(() => ({ data: [] })),
      ]);

      setOffres(offresResponse.data.results || offresResponse.data || []);
      setCandidatures(candidaturesResponse.data.results || candidaturesResponse.data || []);
      setEntreprises(entreprisesResponse.data.results || entreprisesResponse.data || []);
      setStagiaires(stagiairesResponse.data.results || stagiairesResponse.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // ===== GESTION DES OFFRES =====
  const handleOpenOffreDialog = (mode, offre = null) => {
    if (mode === 'edit' && offre) {
      setOffreForm({
        titre: offre.titre || '',
        type_stage: offre.type_stage || 'INITIATION',
        domaine: offre.domaine || '',
        description: offre.description || '',
        competences_requises: offre.competences_requises || '',
        duree: offre.duree || '',
        date_debut: offre.date_debut ? offre.date_debut.split('T')[0] : '',
        date_fin: offre.date_fin ? offre.date_fin.split('T')[0] : '',
        date_limite: offre.date_limite ? offre.date_limite.split('T')[0] : '',
        ville: offre.ville || '',
        remuneration: offre.remuneration || '',
        nombre_places: offre.nombre_places || 1,
        est_active: offre.est_active !== undefined ? offre.est_active : true,
        entreprise_id: offre.entreprise?.id || null,
      });
    } else {
      setOffreForm({
        titre: '',
        type_stage: 'INITIATION',
        domaine: '',
        description: '',
        competences_requises: '',
        duree: '',
        date_debut: '',
        date_limite: '',
        ville: '',
        remuneration: '',
        nombre_places: 1,
        est_active: true,
        entreprise_id: null,
      });
    }
    setOffreDialog({ open: true, mode, offre });
  };

  const handleCloseOffreDialog = () => {
    setOffreDialog({ open: false, mode: 'create', offre: null });
  };

  const handleSaveOffre = async () => {
    try {
      if (offreDialog.mode === 'create') {
        await offreAPI.createOffre(offreForm);
      } else {
        await offreAPI.updateOffre(offreDialog.offre.id, offreForm);
      }
      handleCloseOffreDialog();
      fetchData();
    } catch (err) {
      alert('Erreur lors de la sauvegarde de l\'offre');
    }
  };

  const handleDeleteOffre = async () => {
    try {
      await offreAPI.deleteOffre(deleteDialog.id);
      setDeleteDialog({ open: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleValidate = async (id) => {
    try {
      await offreAPI.updateOffre(id, { est_active: true });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la validation');
    }
  };

  const handleReject = async (id) => {
    try {
      await offreAPI.updateOffre(id, { est_active: false });
      fetchData();
    } catch (err) {
      alert('Erreur lors du refus');
    }
  };

  // ===== GESTION DES CANDIDATURES =====
  const handleOpenCandidatureDialog = (candidature) => {
    setCandidatureForm({
      statut: candidature.statut || 'EN_ATTENTE',
      lettre_motivation: candidature.lettre_motivation || '',
      offre_id: candidature.offre?.id || null,
      stagiaire_id: candidature.stagiaire?.id || null,
    });
    setCandidatureDialog({ open: true, candidature });
  };

  const handleCloseCandidatureDialog = () => {
    setCandidatureDialog({ open: false, candidature: null });
  };

  const handleSaveCandidature = async () => {
    try {
      await candidatureAPI.updateCandidature(candidatureDialog.candidature.id, candidatureForm);
      handleCloseCandidatureDialog();
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          (typeof err.response?.data === 'object' 
                            ? Object.values(err.response.data).flat().join(', ')
                            : 'Erreur lors de la mise à jour de la candidature');
      alert(errorMessage);
      console.error('Erreur mise à jour candidature:', err.response?.data);
    }
  };

  const handleDeleteCandidature = async () => {
    try {
      await candidatureAPI.deleteCandidature(deleteDialog.id);
      setDeleteDialog({ open: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  // ===== GESTION DES DIALOGUES DE SUPPRESSION =====
  const handleOpenDeleteDialog = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, type: '', id: null, name: '' });
  };

  // ===== GESTION DES ENTREPRISES =====
  const handleOpenEntrepriseDialog = (entreprise) => {
    if (entreprise) {
      setEntrepriseForm({
        nom_entreprise: entreprise.nom_entreprise || '',
        secteur_activite: entreprise.secteur_activite || '',
        telephone: entreprise.telephone || '',
        adresse: entreprise.adresse || '',
        ville: entreprise.ville || '',
        site_web: entreprise.site_web || '',
        description: entreprise.description || '',
        contact_nom: entreprise.contact_nom || '',
        contact_prenom: entreprise.contact_prenom || '',
        contact_fonction: entreprise.contact_fonction || '',
        user_email: entreprise.user?.email || '',
        user_is_active: entreprise.user?.is_active !== undefined ? entreprise.user.is_active : true,
      });
      setEntrepriseDialog({ open: true, mode: 'edit', entreprise });
    }
  };

  const handleCloseEntrepriseDialog = () => {
    setEntrepriseDialog({ open: false, mode: 'edit', entreprise: null });
  };

  const handleSaveEntreprise = async () => {
    try {
      await authAPI.updateEntreprise(entrepriseDialog.entreprise.id, entrepriseForm);
      handleCloseEntrepriseDialog();
      fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Erreur lors de la mise à jour de l\'entreprise';
      alert(errorMessage);
      console.error('Erreur mise à jour entreprise:', err.response?.data);
    }
  };

  const handleDeleteEntreprise = async () => {
    try {
      await authAPI.deleteEntreprise(deleteDialog.id);
      setDeleteDialog({ open: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleUserActive = async (userId, isActive) => {
    try {
      await authAPI.updateUser(userId, { is_active: !isActive });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la modification du statut');
    }
  };

  // ===== GESTION DES STAGIAIRES =====
  const handleOpenStagiaireDialog = (mode, stagiaire = null) => {
    if (mode === 'edit' && stagiaire) {
      // Pré-remplir tous les champs du formulaire avec les données du stagiaire
      let dateNaissance = '';
      if (stagiaire.date_naissance) {
        if (typeof stagiaire.date_naissance === 'string') {
          // Si c'est une chaîne ISO (ex: "2023-12-25T00:00:00Z"), extraire la date
          dateNaissance = stagiaire.date_naissance.split('T')[0];
        } else {
          dateNaissance = stagiaire.date_naissance;
        }
      }
      
      setStagiaireForm({
        nom: stagiaire.nom || '',
        prenom: stagiaire.prenom || '',
        telephone: stagiaire.telephone || '',
        date_naissance: dateNaissance,
        adresse: stagiaire.adresse || '',
        ville: stagiaire.ville || '',
        niveau_etude: stagiaire.niveau_etude || '',
        domaine: stagiaire.domaine || '',
        user_email: stagiaire.user?.email || '',
        user_is_active: stagiaire.user?.is_active !== undefined ? stagiaire.user.is_active : true,
      });
      setStagiaireDialog({ open: true, mode: 'edit', stagiaire });
    } else {
      // Mode création - réinitialiser le formulaire
      setStagiaireForm({
        nom: '',
        prenom: '',
        telephone: '',
        date_naissance: '',
        adresse: '',
        ville: '',
        niveau_etude: '',
        domaine: '',
      });
      setStagiaireDialog({ open: true, mode: 'create', stagiaire: null });
    }
  };

  const handleCloseStagiaireDialog = () => {
    setStagiaireDialog({ open: false, mode: 'edit', stagiaire: null });
  };

  const handleSaveStagiaire = async () => {
    try {
      if (!stagiaireDialog.stagiaire || !stagiaireDialog.stagiaire.id) {
        alert('Erreur: Stagiaire non trouvé');
        return;
      }

      // Préparer les données à envoyer
      const dataToSend = {
        ...stagiaireForm,
        // S'assurer que date_naissance est null si vide
        date_naissance: stagiaireForm.date_naissance || null,
        // S'assurer que les champs vides sont des chaînes vides et non undefined
        adresse: stagiaireForm.adresse || '',
        ville: stagiaireForm.ville || '',
        niveau_etude: stagiaireForm.niveau_etude || '',
        domaine: stagiaireForm.domaine || '',
      };

      await authAPI.updateStagiaire(stagiaireDialog.stagiaire.id, dataToSend);
      handleCloseStagiaireDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur complète:', err);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || (err.response?.data && typeof err.response.data === 'object' 
            ? Object.values(err.response.data).flat().join(', ')
            : 'Erreur lors de la mise à jour du stagiaire');
      alert(errorMessage);
      console.error('Erreur mise à jour stagiaire:', err.response?.data);
    }
  };

  const handleDeleteStagiaire = async () => {
    try {
      await authAPI.deleteStagiaire(deleteDialog.id);
      setDeleteDialog({ open: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'offre') {
      handleDeleteOffre();
    } else if (deleteDialog.type === 'candidature') {
      handleDeleteCandidature();
    } else if (deleteDialog.type === 'entreprise') {
      handleDeleteEntreprise();
    } else if (deleteDialog.type === 'stagiaire') {
      handleDeleteStagiaire();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTEE':
        return 'success';
      case 'REFUSEE':
        return 'error';
      case 'EN_ATTENTE':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const pendingOffres = offres.filter(o => !o.est_active);
  const activeOffres = offres.filter(o => o.est_active);

  const domaines = ['Informatique', 'Marketing', 'Finance', 'Ressources Humaines', 'Communication', 'Autre'];
  const typesStage = [
    { value: 'OBSERVATION', label: 'Stage d\'observation' },
    { value: 'INITIATION', label: 'Stage d\'initiation' },
    { value: 'PERFECTIONNEMENT', label: 'Stage de perfectionnement' },
    { value: 'PFE', label: 'Projet de fin d\'études' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Dashboard Administrateur
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Bienvenue, <strong>{user?.email}</strong>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Offres en attente
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {pendingOffres.length}
                  </Typography>
                </Box>
                <Description sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total offres
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {offres.length}
                  </Typography>
                </Box>
                <Work sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Offres actives
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {activeOffres.length}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Candidatures
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {candidatures.length}
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #764ba2 0%, #543574 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Entreprises
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {entreprises.length}
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Stagiaires
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stagiaires.length}
                  </Typography>
                </Box>
                <School sx={{ fontSize: 48, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper 
        sx={{ 
          mb: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab icon={<Work />} iconPosition="start" label="Offres" />
          <Tab icon={<Assignment />} iconPosition="start" label="Candidatures" />
          <Tab icon={<People />} iconPosition="start" label="Entreprises" />
          <Tab icon={<Description />} iconPosition="start" label="Stagiaires" />
        </Tabs>
      </Paper>

      {/* ONGLET OFFRES */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Gestion des Offres
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenOffreDialog('create')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                Créer une offre
              </Button>
            </Box>

            {offres.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune offre.
              </Alert>
            ) : (
              <TableContainer 
                component={Paper}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Titre</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Entreprise</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Domaine</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Ville</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offres.map((offre) => (
                      <TableRow 
                        key={offre.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                            cursor: 'pointer',
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {offre.titre}
                          </Typography>
                        </TableCell>
                        <TableCell>{offre.entreprise?.nom_entreprise}</TableCell>
                        <TableCell>{offre.domaine}</TableCell>
                        <TableCell>{offre.ville}</TableCell>
                        <TableCell>
                          <Chip
                            label={offre.est_active ? 'Active' : 'Inactive'}
                            color={offre.est_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(offre.date_creation).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Valider">
                            <span>
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleValidate(offre.id)}
                                disabled={offre.est_active}
                              >
                                <CheckCircle />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Refuser">
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleReject(offre.id)}
                                disabled={!offre.est_active}
                              >
                                <Cancel />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenOffreDialog('edit', offre)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/offres/${offre.id}`}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleOpenDeleteDialog('offre', offre.id, offre.titre)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ONGLET CANDIDATURES */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gestion des Candidatures
            </Typography>

            {candidatures.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune candidature.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Offre</TableCell>
                      <TableCell>Stagiaire</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {candidatures.map((candidature) => (
                      <TableRow key={candidature.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {candidature.offre?.titre || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {candidature.stagiaire
                            ? `${candidature.stagiaire.prenom} ${candidature.stagiaire.nom}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {candidature.stagiaire?.user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              candidature.statut === 'ACCEPTEE'
                                ? 'Acceptée'
                                : candidature.statut === 'REFUSEE'
                                ? 'Refusée'
                                : 'En attente'
                            }
                            size="small"
                            color={getStatusColor(candidature.statut)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(candidature.date_candidature).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenCandidatureDialog(candidature)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/offres/${candidature.offre?.id}/candidatures`}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleOpenDeleteDialog(
                                  'candidature',
                                  candidature.id,
                                  `Candidature de ${candidature.stagiaire?.prenom} ${candidature.stagiaire?.nom}`
                                )
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ONGLET ENTREPRISES */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gestion des Entreprises
            </Typography>

            {entreprises.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucune entreprise.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Secteur</TableCell>
                      <TableCell>Ville</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {entreprises.map((entreprise) => (
                      <TableRow key={entreprise.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {entreprise.nom_entreprise}
                          </Typography>
                        </TableCell>
                        <TableCell>{entreprise.secteur_activite}</TableCell>
                        <TableCell>{entreprise.ville}</TableCell>
                        <TableCell>{entreprise.user?.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={entreprise.user?.is_active ? 'Actif' : 'Inactif'}
                            color={entreprise.user?.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(entreprise.date_creation).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenEntrepriseDialog(entreprise)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={entreprise.user?.is_active ? 'Désactiver' : 'Activer'}>
                            <IconButton
                              color={entreprise.user?.is_active ? 'warning' : 'success'}
                              size="small"
                              onClick={() => handleToggleUserActive(entreprise.user?.id, entreprise.user?.is_active)}
                            >
                              {entreprise.user?.is_active ? <Block /> : <CheckCircleOutline />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleOpenDeleteDialog('entreprise', entreprise.id, entreprise.nom_entreprise)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ONGLET STAGIAIRES */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gestion des Stagiaires
            </Typography>

            {stagiaires.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucun stagiaire.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Prénom</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Ville</TableCell>
                      <TableCell>CV</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stagiaires.map((stagiaire) => (
                      <TableRow key={stagiaire.id}>
                        <TableCell>{stagiaire.nom}</TableCell>
                        <TableCell>{stagiaire.prenom}</TableCell>
                        <TableCell>{stagiaire.user?.email || 'N/A'}</TableCell>
                        <TableCell>{stagiaire.telephone}</TableCell>
                        <TableCell>{stagiaire.ville || '-'}</TableCell>
                        <TableCell>
                          {stagiaire.cv_file ? (
                            <Chip label="Oui" color="success" size="small" />
                          ) : (
                            <Chip label="Non" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stagiaire.user?.is_active ? 'Actif' : 'Inactif'}
                            color={stagiaire.user?.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleOpenStagiaireDialog('edit', stagiaire)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={stagiaire.user?.is_active ? 'Désactiver' : 'Activer'}>
                            <IconButton
                              color={stagiaire.user?.is_active ? 'warning' : 'success'}
                              size="small"
                              onClick={() => handleToggleUserActive(stagiaire.user?.id, stagiaire.user?.is_active)}
                            >
                              {stagiaire.user?.is_active ? <Block /> : <CheckCircleOutline />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleOpenDeleteDialog('stagiaire', stagiaire.id, `${stagiaire.prenom} ${stagiaire.nom}`)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* MODALE CRÉER/MODIFIER OFFRE */}
      <Dialog 
        open={offreDialog.open} 
        onClose={handleCloseOffreDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            py: 2,
          }}
        >
          {offreDialog.mode === 'create' ? 'Créer une offre' : 'Modifier l\'offre'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre"
                value={offreForm.titre}
                onChange={(e) => setOffreForm({ ...offreForm, titre: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type de stage"
                value={offreForm.type_stage}
                onChange={(e) => setOffreForm({ ...offreForm, type_stage: e.target.value })}
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
                value={offreForm.domaine}
                onChange={(e) => setOffreForm({ ...offreForm, domaine: e.target.value })}
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
                value={offreForm.description}
                onChange={(e) => setOffreForm({ ...offreForm, description: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={offreForm.ville}
                onChange={(e) => setOffreForm({ ...offreForm, ville: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Durée"
                value={offreForm.duree}
                onChange={(e) => setOffreForm({ ...offreForm, duree: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={offreForm.date_debut}
                onChange={(e) => setOffreForm({ ...offreForm, date_debut: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date limite"
                type="date"
                value={offreForm.date_limite}
                onChange={(e) => setOffreForm({ ...offreForm, date_limite: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rémunération"
                value={offreForm.remuneration}
                onChange={(e) => setOffreForm({ ...offreForm, remuneration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de places"
                type="number"
                value={offreForm.nombre_places}
                onChange={(e) => setOffreForm({ ...offreForm, nombre_places: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Compétences requises"
                value={offreForm.competences_requises}
                onChange={(e) => setOffreForm({ ...offreForm, competences_requises: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={offreForm.est_active}
                    onChange={(e) => setOffreForm({ ...offreForm, est_active: e.target.checked })}
                  />
                }
                label="Offre active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOffreDialog}>Annuler</Button>
          <Button onClick={handleSaveOffre} variant="contained">
            {offreDialog.mode === 'create' ? 'Créer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODALE MODIFIER CANDIDATURE */}
      <Dialog open={candidatureDialog.open} onClose={handleCloseCandidatureDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la candidature</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={candidatureForm.statut}
                onChange={(e) => setCandidatureForm({ ...candidatureForm, statut: e.target.value })}
                required
              >
                <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                <MenuItem value="ACCEPTEE">Acceptée</MenuItem>
                <MenuItem value="REFUSEE">Refusée</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lettre de motivation"
                value={candidatureForm.lettre_motivation}
                onChange={(e) => setCandidatureForm({ ...candidatureForm, lettre_motivation: e.target.value })}
                multiline
                rows={6}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCandidatureDialog}>Annuler</Button>
          <Button onClick={handleSaveCandidature} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODALE MODIFIER ENTREPRISE */}
      <Dialog 
        open={entrepriseDialog.open} 
        onClose={handleCloseEntrepriseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            py: 2,
          }}
        >
          Modifier l'entreprise
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={entrepriseForm.nom_entreprise}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, nom_entreprise: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Secteur d'activité"
                value={entrepriseForm.secteur_activite}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, secteur_activite: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={entrepriseForm.telephone}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, telephone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={entrepriseForm.adresse}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, adresse: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={entrepriseForm.ville}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, ville: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Site web"
                value={entrepriseForm.site_web}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, site_web: e.target.value })}
                type="url"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom du contact"
                value={entrepriseForm.contact_nom}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, contact_nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom du contact"
                value={entrepriseForm.contact_prenom}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, contact_prenom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fonction du contact"
                value={entrepriseForm.contact_fonction}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, contact_fonction: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={entrepriseForm.description}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, description: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Informations utilisateur
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email de l'utilisateur"
                type="email"
                value={entrepriseForm.user_email}
                onChange={(e) => setEntrepriseForm({ ...entrepriseForm, user_email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut de l'utilisateur</InputLabel>
                <Select
                  value={entrepriseForm.user_is_active ? 'active' : 'inactive'}
                  label="Statut de l'utilisateur"
                  onChange={(e) => setEntrepriseForm({ ...entrepriseForm, user_is_active: e.target.value === 'active' })}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEntrepriseDialog}>Annuler</Button>
          <Button onClick={handleSaveEntreprise} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODALE MODIFIER STAGIAIRE */}
      <Dialog open={stagiaireDialog.open} onClose={handleCloseStagiaireDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            py: 2,
          }}
        >
          {stagiaireDialog.mode === 'create' ? 'Créer un stagiaire' : 'Modifier le stagiaire'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                value={stagiaireForm.nom}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, nom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                value={stagiaireForm.prenom}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, prenom: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={stagiaireForm.telephone}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, telephone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date de naissance"
                type="date"
                value={stagiaireForm.date_naissance}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, date_naissance: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                value={stagiaireForm.adresse}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, adresse: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ville"
                value={stagiaireForm.ville}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, ville: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Niveau d'études"
                value={stagiaireForm.niveau_etude}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, niveau_etude: e.target.value })}
              >
                <MenuItem value="">Sélectionner...</MenuItem>
                <MenuItem value="Bac">Bac</MenuItem>
                <MenuItem value="Bac+1">Bac+1</MenuItem>
                <MenuItem value="Bac+2">Bac+2</MenuItem>
                <MenuItem value="Bac+3">Bac+3 (Licence)</MenuItem>
                <MenuItem value="Bac+4">Bac+4</MenuItem>
                <MenuItem value="Bac+5">Bac+5 (Master)</MenuItem>
                <MenuItem value="Bac+6">Bac+6 et plus</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Domaine d'études"
                value={stagiaireForm.domaine}
                onChange={(e) => setStagiaireForm({ ...stagiaireForm, domaine: e.target.value })}
              >
                <MenuItem value="">Sélectionner...</MenuItem>
                <MenuItem value="Informatique">Informatique</MenuItem>
                <MenuItem value="Commerce">Commerce</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Communication">Communication</MenuItem>
                <MenuItem value="Gestion">Gestion</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Ressources Humaines">Ressources Humaines</MenuItem>
                <MenuItem value="Droit">Droit</MenuItem>
                <MenuItem value="Ingénierie">Ingénierie</MenuItem>
                <MenuItem value="Santé">Santé</MenuItem>
                <MenuItem value="Éducation">Éducation</MenuItem>
                <MenuItem value="Autre">Autre</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStagiaireDialog}>Annuler</Button>
          <Button onClick={handleSaveStagiaire} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODALE CONFIRMATION SUPPRESSION */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer <strong>{deleteDialog.name}</strong> ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardAdmin;
