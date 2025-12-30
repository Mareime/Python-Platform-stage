import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
let isRedirecting = false;

api.interceptors.response.use(
  (response) => {
    // Ne pas modifier les réponses blob (fichiers PDF, etc.)
    if (response.config?.responseType === 'blob') {
      return response;
    }
    return response;
  },
  async (error) => {
    // Ne pas traiter les erreurs blob comme des erreurs JSON
    if (error.config?.responseType === 'blob' && error.response) {
      // Si c'est une erreur blob, essayer de lire le message d'erreur
      if (error.response.status === 401 || error.response.status === 403) {
        // Token expiré ou accès refusé
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || currentPath === '/register';
        if (!isAuthPage && !isRedirecting) {
          isRedirecting = true;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
            isRedirecting = false;
          }, 100);
        }
      }
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      
      // Ne pas rediriger si on est déjà sur login/register
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      // Identifier les types de requêtes
      const isLoginRequest = requestUrl.includes('/auth/login/');
      const isRegisterRequest = requestUrl.includes('/auth/register/');
      const isProfileRequest = requestUrl.includes('/auth/profile/');
      const isAuthRequest = isLoginRequest || isRegisterRequest;
      
      // Pour les requêtes de login/register, laisser l'erreur être gérée par le composant
      // Pour les requêtes de profil, laisser AuthContext gérer (ne pas rediriger immédiatement)
      // Pour les autres requêtes authentifiées, rediriger vers login
      if (!isAuthPage && !isAuthRequest && !isProfileRequest && !isRedirecting) {
        isRedirecting = true;
        // Token expiré ou invalide, déconnecter l'utilisateur
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Utiliser setTimeout pour éviter les boucles de navigation
        setTimeout(() => {
          const newPath = window.location.pathname;
          if (newPath !== '/login' && newPath !== '/register' && !newPath.startsWith('/auth')) {
            window.location.href = '/login';
          }
          isRedirecting = false;
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

// ===== AUTHENTIFICATION =====
export const authAPI = {
  registerStagiaire: (data) => api.post('/auth/register/stagiaire/', data),
  registerEntreprise: (data) => api.post('/auth/register/entreprise/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (data) => api.post('/auth/logout/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateStagiaireProfile: (data) => api.patch('/auth/profile/stagiaire/update/', data),
  updateEntrepriseProfile: (data) => api.patch('/auth/profile/entreprise/update/', data),
  // Admin
  getUsers: () => api.get('/auth/admin/users/'),
  getUser: (id) => api.get(`/auth/admin/users/${id}/`),
  updateUser: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}/`),
  getStagiaires: () => api.get('/auth/admin/stagiaires/'),
  getStagiaire: (id) => api.get(`/auth/admin/stagiaires/${id}/`),
  updateStagiaire: (id, data) => api.patch(`/auth/admin/stagiaires/${id}/`, data),
  deleteStagiaire: (id) => api.delete(`/auth/admin/stagiaires/${id}/`),
  getEntreprises: () => api.get('/auth/admin/entreprises/'),
  getEntreprise: (id) => api.get(`/auth/admin/entreprises/${id}/`),
  updateEntreprise: (id, data) => api.patch(`/auth/admin/entreprises/${id}/`, data),
  deleteEntreprise: (id) => api.delete(`/auth/admin/entreprises/${id}/`),
};

// ===== CV =====
// Note: Les CV sont gérés via le profil stagiaire
export const cvAPI = {
  getCV: () => {
    // Récupérer le CV via le profil
    return api.get('/auth/profile/').then(response => {
      const stagiaire = response.data.stagiaire_profile;
      // Utiliser cv_file_url si disponible, sinon cv_file
      const cvUrl = stagiaire?.cv_file_url || stagiaire?.cv_file;
      console.log('CV URL from API:', cvUrl); // Debug
      return { data: cvUrl ? { file: cvUrl, id: stagiaire.id } : null };
    });
  },
  uploadCV: (formData) => {
    // Uploader le CV via le profil stagiaire
    return api.patch('/auth/profile/stagiaire/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateCV: (formData) => {
    // Mettre à jour le CV via le profil stagiaire
    return api.patch('/auth/profile/stagiaire/update/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteCV: () => {
    // Supprimer le CV en mettant cv_file à null
    // Pour supprimer un fichier, on doit envoyer une chaîne vide ou utiliser un champ spécial
    return api.patch('/auth/profile/stagiaire/update/', { cv_file: null }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  viewCV: (stagiaireId = null) => {
    // Récupérer l'URL pour visualiser le CV
    const url = stagiaireId 
      ? `/auth/cv/view/${stagiaireId}/`
      : '/auth/cv/view/';
    return api.get(url, {
      responseType: 'blob', // Important pour les fichiers binaires
    });
  },
  downloadCV: () => {
    // Télécharger le CV via le profil
    return api.get('/auth/profile/').then(response => {
      const cvUrl = response.data.stagiaire_profile?.cv_file;
      if (cvUrl) {
        // Si c'est une URL complète, l'utiliser directement, sinon construire l'URL complète
        const fullUrl = cvUrl.startsWith('http') ? cvUrl : `http://localhost:8000${cvUrl}`;
        return api.get(fullUrl, { responseType: 'blob' });
      }
      throw new Error('Aucun CV trouvé');
    });
  },
};

// ===== OFFRES =====
export const offreAPI = {
  getOffres: (params) => api.get('/stages/offres/', { params }),
  getOffre: (id) => api.get(`/stages/offres/${id}/`),
  createOffre: (data) => api.post('/stages/offres/', data),
  updateOffre: (id, data) => api.put(`/stages/offres/${id}/`, data),
  deleteOffre: (id) => api.delete(`/stages/offres/${id}/`),
  getMyOffres: () => api.get('/stages/offres/my-offres/'),
};

// ===== CANDIDATURES =====
export const candidatureAPI = {
  getCandidatures: (params) => api.get('/stages/candidatures/', { params }),
  getCandidature: (id) => api.get(`/stages/candidatures/${id}/`),
  createCandidature: (data) => api.post('/stages/candidatures/', data),
  updateCandidature: (id, data) => api.put(`/stages/candidatures/${id}/`, data),
  deleteCandidature: (id) => api.delete(`/stages/candidatures/${id}/`),
  acceptCandidature: (id) => api.post(`/stages/candidatures/${id}/accept/`),
  rejectCandidature: (id) => api.post(`/stages/candidatures/${id}/reject/`),
  getMyCandidatures: () => api.get('/stages/candidatures/my-candidatures/'),
  getCandidaturesByOffre: (offreId) => api.get(`/stages/candidatures/offre/${offreId}/candidatures/`),
};

// ===== NOTIFICATIONS =====
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications/', { params }),
  getNotification: (id) => api.get(`/notifications/${id}/`),
  getUnreadCount: () => api.get('/notifications/unread-count/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-as-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-as-read/'),
};

export default api;

