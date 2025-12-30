"""
Vues pour la gestion de l'authentification
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.http import FileResponse, Http404
from django.conf import settings
import os

from .serializers import (
    RegisterStagiaireSerializer,
    RegisterEntrepriseSerializer,
    LoginSerializer,
    UserSerializer,
    StagiaireSerializer,
    EntrepriseSerializer,
    StagiaireAdminSerializer,
    EntrepriseAdminSerializer
)
from .models import Stagiaire, Entreprise

User = get_user_model()


class RegisterStagiaireView(generics.CreateAPIView):
    """Vue pour l'inscription des stagiaires"""
    serializer_class = RegisterStagiaireSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Stagiaire créé avec succès',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class RegisterEntrepriseView(generics.CreateAPIView):
    """Vue pour l'inscription des entreprises"""
    serializer_class = RegisterEntrepriseSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Entreprise créée avec succès',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Vue pour la connexion"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if user is None:
            return Response({
                'error': 'Email ou mot de passe incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Ce compte est désactivé'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Connexion réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Vue pour la déconnexion"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Déconnexion réussie'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Token invalide'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """Vue pour récupérer le profil de l'utilisateur connecté"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateStagiaireProfileView(generics.UpdateAPIView):
    """Vue pour mettre à jour le profil d'un stagiaire"""
    serializer_class = StagiaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.stagiaire_profile
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'STAGIAIRE':
            return Response({
                'error': 'Vous devez être un stagiaire'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)


class UpdateEntrepriseProfileView(generics.UpdateAPIView):
    """Vue pour mettre à jour le profil d'une entreprise"""
    serializer_class = EntrepriseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.entreprise_profile
    
    def update(self, request, *args, **kwargs):
        if request.user.role != 'ENTREPRISE':
            return Response({
                'error': 'Vous devez être une entreprise'
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)


# ===== VUES ADMIN POUR GESTION DES ENTREPRISES ET STAGIAIRES =====

class StagiaireListAdminView(generics.ListAPIView):
    """Vue admin pour lister tous les stagiaires"""
    serializer_class = StagiaireSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Stagiaire.objects.all()
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Stagiaire.objects.none()
        return Stagiaire.objects.all().select_related('user').order_by('-date_creation')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class StagiaireDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """Vue admin pour récupérer, modifier et supprimer un stagiaire"""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Stagiaire.objects.all()
    
    def get_serializer_class(self):
        """Utiliser le serializer admin pour permettre la modification de tous les champs"""
        return StagiaireAdminSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Stagiaire.objects.none()
        return Stagiaire.objects.all().select_related('user')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class EntrepriseListAdminView(generics.ListAPIView):
    """Vue admin pour lister toutes les entreprises"""
    serializer_class = EntrepriseSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Entreprise.objects.all()
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Entreprise.objects.none()
        return Entreprise.objects.all().select_related('user').order_by('-date_creation')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class EntrepriseDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """Vue admin pour récupérer, modifier et supprimer une entreprise"""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Entreprise.objects.all()
    
    def get_serializer_class(self):
        """Utiliser le serializer admin pour permettre la modification de tous les champs"""
        return EntrepriseAdminSerializer
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Entreprise.objects.none()
        return Entreprise.objects.all().select_related('user')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserListAdminView(generics.ListAPIView):
    """Vue admin pour lister tous les utilisateurs"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return User.objects.none()
        return User.objects.all().prefetch_related('stagiaire_profile', 'entreprise_profile').order_by('-date_joined')


class UserDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    """Vue admin pour récupérer, modifier et supprimer un utilisateur"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return User.objects.none()
        return User.objects.all().prefetch_related('stagiaire_profile', 'entreprise_profile')


class CVViewView(APIView):
    """Vue pour visualiser le CV d'un stagiaire"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, stagiaire_id=None):
        """Récupérer le CV du stagiaire connecté ou d'un stagiaire spécifique (admin)"""
        # Si un ID est fourni et que l'utilisateur est admin, permettre de voir le CV d'un autre stagiaire
        if stagiaire_id and request.user.role == 'ADMIN':
            try:
                stagiaire = Stagiaire.objects.get(id=stagiaire_id)
            except Stagiaire.DoesNotExist:
                raise Http404("Stagiaire non trouvé")
        else:
            # Sinon, récupérer le CV du stagiaire connecté
            if request.user.role != 'STAGIAIRE':
                return Response({
                    'error': 'Vous devez être un stagiaire pour voir votre CV'
                }, status=status.HTTP_403_FORBIDDEN)
            
            try:
                stagiaire = request.user.stagiaire_profile
            except Stagiaire.DoesNotExist:
                raise Http404("Profil stagiaire non trouvé")
        
        if not stagiaire.cv_file:
            raise Http404("CV non trouvé")
        
        # Vérifier que le fichier existe
        file_path = stagiaire.cv_file.path
        if not os.path.exists(file_path):
            raise Http404("Fichier CV non trouvé")
        
        # Retourner le fichier PDF
        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            filename=os.path.basename(file_path)
        )