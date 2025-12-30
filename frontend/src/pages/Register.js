import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    role: 'STAGIAIRE',
    phone: '',
    // Champs Stagiaire
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    niveau_etude: '',
    domaine: '',
    // Champs Entreprise
    company_name: '',
    secteur_activite: '',
    description: '',
    website: '',
    contact_nom: '',
    contact_prenom: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Effacer l'erreur quand l'utilisateur modifie un champ
    if (error) {
      setError('');
    }
  };

  const isFormValid = () => {
    // Vérifier les champs communs
    if (!formData.email || !formData.password || !formData.password2 || !formData.phone) {
      return false;
    }

    // Vérifier selon le rôle
    if (formData.role === 'STAGIAIRE') {
      return !!(formData.first_name && formData.last_name);
    } else if (formData.role === 'ENTREPRISE') {
      return !!(
        formData.company_name &&
        formData.secteur_activite &&
        formData.address &&
        formData.city &&
        formData.contact_nom &&
        formData.contact_prenom
      );
    }

    return false;
  };

  const validateForm = () => {
    const errors = [];

    // Validation des champs communs
    if (!formData.email || !formData.email.trim()) {
      errors.push('L\'email est obligatoire');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!formData.password || formData.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (formData.password !== formData.password2) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.push('Le téléphone est obligatoire');
    }

    // Validation selon le rôle
    if (formData.role === 'STAGIAIRE') {
      if (!formData.first_name || !formData.first_name.trim()) {
        errors.push('Le prénom est obligatoire');
      }
      if (!formData.last_name || !formData.last_name.trim()) {
        errors.push('Le nom est obligatoire');
      }
    } else if (formData.role === 'ENTREPRISE') {
      if (!formData.company_name || !formData.company_name.trim()) {
        errors.push('Le nom de l\'entreprise est obligatoire');
      }
      if (!formData.secteur_activite || !formData.secteur_activite.trim()) {
        errors.push('Le secteur d\'activité est obligatoire');
      }
      if (!formData.address || !formData.address.trim()) {
        errors.push('L\'adresse est obligatoire');
      }
      if (!formData.city || !formData.city.trim()) {
        errors.push('La ville est obligatoire');
      }
      if (!formData.contact_nom || !formData.contact_nom.trim()) {
        errors.push('Le nom du contact est obligatoire');
      }
      if (!formData.contact_prenom || !formData.contact_prenom.trim()) {
        errors.push('Le prénom du contact est obligatoire');
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation complète du formulaire
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setLoading(true);

    const registerData = {
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
      role: formData.role,
      phone: formData.phone,
    };

    if (formData.role === 'STAGIAIRE') {
      registerData.first_name = formData.first_name;
      registerData.last_name = formData.last_name;
    } else if (formData.role === 'ENTREPRISE') {
      registerData.company_name = formData.company_name;
      registerData.secteur_activite = formData.secteur_activite || 'Autre';
      registerData.address = formData.address;
      registerData.city = formData.city;
      registerData.contact_nom = formData.contact_nom;
      registerData.contact_prenom = formData.contact_prenom;
      registerData.description = formData.description;
      registerData.website = formData.website;
    }

    const result = await register(registerData);
    setLoading(false);

    if (result.success) {
      // Rediriger selon le rôle
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === 'STAGIAIRE') {
        navigate('/dashboard/stagiaire');
      } else if (user?.role === 'ENTREPRISE') {
        navigate('/dashboard/entreprise');
      } else if (user?.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      if (typeof result.error === 'object') {
        const errorMessages = Object.values(result.error).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={0}
          sx={{ 
            p: 5,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Inscription
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créez votre compte pour commencer
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Type de compte"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="STAGIAIRE">Stagiaire</MenuItem>
                  <MenuItem value="ENTREPRISE">Entreprise</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirmer le mot de passe"
                  name="password2"
                  type="password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Grid>

              {formData.role === 'STAGIAIRE' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ville"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Niveau d'études"
                      name="niveau_etude"
                      value={formData.niveau_etude}
                      onChange={handleChange}
                      select
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
                      label="Domaine d'études"
                      name="domaine"
                      value={formData.domaine}
                      onChange={handleChange}
                      select
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
                </>
              )}

              {formData.role === 'ENTREPRISE' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom de l'entreprise"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Secteur d'activité"
                      name="secteur_activite"
                      value={formData.secteur_activite}
                      onChange={handleChange}
                      required
                      select
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ville"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom du contact"
                      name="contact_nom"
                      value={formData.contact_nom}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom du contact"
                      name="contact_prenom"
                      value={formData.contact_prenom}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site web"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Description de l'entreprise..."
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    mt: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "S'inscrire"}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="text.secondary">
              Déjà un compte ?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Connectez-vous
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;

