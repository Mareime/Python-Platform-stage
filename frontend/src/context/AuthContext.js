import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Définir l'utilisateur immédiatement pour éviter les problèmes de timing
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Vérifier que le token est toujours valide (en arrière-plan)
        try {
          const response = await authAPI.getProfile();
          const userData = response.data;
          // Mettre à jour l'utilisateur avec les données fraîches
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        } catch (error) {
          // Si l'erreur est 401, le token est invalide
          if (error.response?.status === 401) {
            logout();
            return;
          }
          // Pour les autres erreurs, garder l'utilisateur stocké
          console.warn('Erreur lors de la récupération du profil:', error);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        logout();
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { tokens, user: userData } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Erreur de connexion. Vérifiez vos identifiants.';
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const isStagiaire = userData.role === 'STAGIAIRE';
      const registerEndpoint = isStagiaire 
        ? authAPI.registerStagiaire 
        : authAPI.registerEntreprise;
      
      // Adapter les données selon le format backend
      let registerData;
      if (isStagiaire) {
        registerData = {
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password2 || userData.password_confirm,
          nom: userData.last_name || userData.nom,
          prenom: userData.first_name || userData.prenom,
          telephone: userData.phone || userData.telephone,
          // date_naissance: userData.date_naissance || userData.date_birth,
          adresse: userData.address || userData.adresse || '',
          ville: userData.city || userData.ville || '',
          niveau_etude: userData.niveau_etude || userData.study_level || '',
          domaine: userData.domaine || userData.field || '',
        };
      } else {
        registerData = {
          email: userData.email,
          password: userData.password,
          password_confirm: userData.password2 || userData.password_confirm,
          nom_entreprise: userData.company_name || userData.nom_entreprise,
          secteur_activite: userData.secteur_activite || 'Autre',
          telephone: userData.phone || userData.telephone,
          adresse: userData.address || userData.adresse,
          ville: userData.city || userData.ville,
          contact_nom: userData.contact_nom,
          contact_prenom: userData.contact_prenom,
        };
      }
      
      const response = await registerEndpoint(registerData);
      const { tokens, user } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      const errorData = error.response?.data;
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (errorData) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          // Extraire les messages d'erreur du serializer
          const errors = Object.values(errorData).flat();
          errorMessage = errors.join(', ');
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};