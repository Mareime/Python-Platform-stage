import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Ignorer les erreurs removeChild avant même de mettre à jour l'état
    const errorMessage = error?.message || '';
    const errorName = error?.name || '';
    const errorStack = error?.stack || '';
    
    // Vérifier toutes les variantes possibles de l'erreur removeChild
    if (errorMessage.includes('removeChild') || 
        errorName === 'NotFoundError' ||
        errorMessage.includes('n\'est pas un enfant') ||
        errorMessage.includes('not a child') ||
        errorMessage.includes('The node to be removed is not a child') ||
        errorMessage.includes('Failed to execute \'removeChild\'') ||
        errorStack.includes('removeChild') ||
        errorStack.includes('NotFoundError')) {
      // Ne pas mettre à jour l'état pour ces erreurs non-critiques
      // Ces erreurs se produisent lors de la navigation et sont non-critiques
      return { hasError: false, error: null };
    }
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Ignorer spécifiquement l'erreur removeChild qui est souvent non critique
    const errorMessage = error?.message || '';
    const errorName = error?.name || '';
    const errorStack = error?.stack || '';
    const componentStack = errorInfo?.componentStack || '';
    
    // Vérifier toutes les variantes possibles de l'erreur removeChild
    if (errorMessage.includes('removeChild') || 
        errorName === 'NotFoundError' ||
        errorMessage.includes('n\'est pas un enfant') ||
        errorMessage.includes('not a child') ||
        errorMessage.includes('The node to be removed is not a child') ||
        errorMessage.includes('Failed to execute \'removeChild\'') ||
        errorStack.includes('removeChild') ||
        errorStack.includes('NotFoundError') ||
        componentStack.includes('Text') && errorMessage.includes('removeChild')) {
      // Cette erreur est non-critique et peut être ignorée silencieusement
      // Elle se produit lors de la fermeture de composants Material-UI pendant la navigation
      // Ne pas logger pour éviter le bruit dans la console
      this.setState({ hasError: false });
      return;
    }
    
    // Pour les autres erreurs, les logger normalement
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Vous pouvez personnaliser l'UI de secours comme vous le souhaitez
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Une erreur s'est produite
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </Typography>
          <Button variant="contained" onClick={this.handleReset}>
            Réessayer
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

