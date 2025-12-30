"""
URLs pour l'authentification
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterStagiaireView,
    RegisterEntrepriseView,
    LoginView,
    LogoutView,
    UserProfileView,
    UpdateStagiaireProfileView,
    UpdateEntrepriseProfileView,
    StagiaireListAdminView,
    StagiaireDetailAdminView,
    EntrepriseListAdminView,
    EntrepriseDetailAdminView,
    UserListAdminView,
    UserDetailAdminView,
    CVViewView,
)

urlpatterns = [
    # Inscription
    path('register/stagiaire/', RegisterStagiaireView.as_view(), name='register-stagiaire'),
    path('register/entreprise/', RegisterEntrepriseView.as_view(), name='register-entreprise'),
    
    # Authentification
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Profils
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/stagiaire/update/', UpdateStagiaireProfileView.as_view(), name='update-stagiaire-profile'),
    path('profile/entreprise/update/', UpdateEntrepriseProfileView.as_view(), name='update-entreprise-profile'),
    
    # CV
    path('cv/view/', CVViewView.as_view(), name='view-cv'),
    path('cv/view/<int:stagiaire_id>/', CVViewView.as_view(), name='view-cv-admin'),
    
    # Admin - Gestion des utilisateurs
    path('admin/users/', UserListAdminView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', UserDetailAdminView.as_view(), name='admin-user-detail'),
    
    # Admin - Gestion des stagiaires
    path('admin/stagiaires/', StagiaireListAdminView.as_view(), name='admin-stagiaire-list'),
    path('admin/stagiaires/<int:pk>/', StagiaireDetailAdminView.as_view(), name='admin-stagiaire-detail'),
    
    # Admin - Gestion des entreprises
    path('admin/entreprises/', EntrepriseListAdminView.as_view(), name='admin-entreprise-list'),
    path('admin/entreprises/<int:pk>/', EntrepriseDetailAdminView.as_view(), name='admin-entreprise-detail'),
]
