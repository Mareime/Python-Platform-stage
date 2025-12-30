import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardStagiaire from './pages/DashboardStagiaire';
import DashboardEntreprise from './pages/DashboardEntreprise';
import DashboardAdmin from './pages/DashboardAdmin';
import OffresList from './pages/OffresList';
import OffreDetail from './pages/OffreDetail';
import OffreCreate from './pages/OffreCreate';
import OffreEdit from './pages/OffreEdit';
import CVManagement from './pages/CVManagement';
import CandidaturesList from './pages/CandidaturesList';
import NotificationsPage from './pages/NotificationsPage';

// Composant de redirection intégré
const DashboardRedirect = () => {
  const { user } = useAuth();
  const dashboardRoutes = {
    'STAGIAIRE': '/dashboard/stagiaire',
    'ENTREPRISE': '/dashboard/entreprise',
    'ADMIN': '/dashboard/admin'
  };
  return <Navigate to={dashboardRoutes[user?.role] || '/'} replace />;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa3f5',
      dark: '#4a5fc7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9a6bc2',
      dark: '#543574',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
          '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
            transition: 'background-color 0.2s ease-in-out',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ErrorBoundary>
          <Router>
            <ErrorBoundary>
              <Navbar />
            </ErrorBoundary>
            <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute allowedRoles={[]} redirectIfAuthenticated>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute allowedRoles={[]} redirectIfAuthenticated>
                  <Register />
                </ProtectedRoute>
              } 
            />
            <Route path="/offres" element={<OffresList />} />
            <Route path="/offres/:id" element={<OffreDetail />} />
            
            {/* Routes création offres - DOIT être avant /offres/:id */}
            <Route
              path="/offres/create"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRISE']}>
                  <OffreCreate />
                </ProtectedRoute>
              }
            />
            
            {/* Route édition offres - DOIT être avant /offres/:id */}
            <Route
              path="/offres/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRISE', 'ADMIN']}>
                  <OffreEdit />
                </ProtectedRoute>
              }
            />
            
            {/* Route dashboard avec redirection automatique */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            
            {/* Routes dashboard par rôle */}
            <Route
              path="/dashboard/stagiaire"
              element={
                <ProtectedRoute allowedRoles={['STAGIAIRE']}>
                  <DashboardStagiaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/entreprise"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRISE']}>
                  <DashboardEntreprise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />
            
            {/* Routes CV (Stagiaire uniquement) */}
            <Route
              path="/cv"
              element={
                <ProtectedRoute allowedRoles={['STAGIAIRE']}>
                  <CVManagement />
                </ProtectedRoute>
              }
            />
            
            {/* Routes candidatures (Entreprise et Admin) */}
            <Route
              path="/offres/:id/candidatures"
              element={
                <ProtectedRoute allowedRoles={['ENTREPRISE', 'ADMIN']}>
                  <CandidaturesList />
                </ProtectedRoute>
              }
            />
            
            {/* Routes notifications (Tous les utilisateurs connectés) */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;