import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  School,
  Business,
  Description,
  Search,
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 10,
          mb: 6,
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom align="center" fontWeight="bold">
            Bienvenue sur StagePlatform
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            La plateforme qui connecte les stagiaires et les entreprises
          </Typography>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ bgcolor: 'white', color: '#667eea', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Commencer
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/offres"
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Voir les offres
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container>
        {/* Features Section */}
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Pourquoi choisir StagePlatform ?
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <School sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Pour les Stagiaires
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Déposez votre CV, recherchez des offres de stage et postulez facilement
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Business sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Pour les Entreprises
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Publiez vos offres de stage et consultez les CV des candidats
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Description sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Gestion des CV
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stockage sécurisé et gestion simple de vos documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card 
              sx={{ 
                height: '100%', 
                textAlign: 'center',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <Search sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Recherche Avancée
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Filtrez les offres par ville, domaine et compétences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA Section */}
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: 3,
            border: '1px solid rgba(102, 126, 234, 0.2)',
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Prêt à commencer ?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
            Rejoignez notre communauté de stagiaires et d'entreprises
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/register"
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': { 
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease-in-out',
            }}
          >
            Créer un compte
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;

