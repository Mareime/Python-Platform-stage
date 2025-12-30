"""
Vues pour la gestion des stages
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, F
from django.utils import timezone

from .models import OffreStage, Candidature
from .serializers import (
    OffreStageSerializer, 
    CandidatureSerializer,
    OffreStageAdminSerializer,
    CandidatureAdminSerializer
)
from accounts.models import Entreprise, Stagiaire


class OffreStageListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des offres de stage"""
    serializer_class = OffreStageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = OffreStage.objects.annotate(
            places_prises=Count('candidatures', filter=Q(candidatures__statut='ACCEPTEE'))
        )
        
        # Filtres
        search = self.request.query_params.get('search', None)
        ville = self.request.query_params.get('ville', None)
        domaine = self.request.query_params.get('domaine', None)
        est_active = self.request.query_params.get('est_active', None)
        
        if search:
            queryset = queryset.filter(
                Q(titre__icontains=search) |
                Q(description__icontains=search) |
                Q(entreprise__nom_entreprise__icontains=search)
            )
        
        if ville:
            queryset = queryset.filter(ville=ville)
        
        if domaine:
            queryset = queryset.filter(domaine=domaine)
        
        if est_active is not None:
            queryset = queryset.filter(est_active=est_active.lower() == 'true')
        
        # Filtrer selon le rôle de l'utilisateur
        if not self.request.user.is_authenticated or self.request.user.role == 'STAGIAIRE':
            # Pour les stagiaires et visiteurs non authentifiés, filtrer les offres disponibles
            today = timezone.now().date()
            queryset = queryset.filter(
                est_active=True
            ).filter(
                Q(date_limite__isnull=True) | Q(date_limite__gte=today)
            ).filter(
                places_prises__lt=F('nombre_places')
            )
        elif self.request.user.role == 'ENTREPRISE':
            # Les entreprises ne voient que leurs propres offres
            try:
                entreprise = self.request.user.entreprise_profile
                queryset = queryset.filter(entreprise=entreprise)
            except AttributeError:
                # Si l'entreprise n'a pas de profil, retourner un queryset vide
                queryset = OffreStage.objects.none()
        # Pour les admins, montrer toutes les offres (même expirées ou complètes)
        
        return queryset.order_by('-date_creation')
    
    def perform_create(self, serializer):
        """Créer une offre pour l'entreprise connectée"""
        if self.request.user.role != 'ENTREPRISE':
            raise permissions.PermissionDenied("Seules les entreprises peuvent créer des offres")
        
        try:
            entreprise = self.request.user.entreprise_profile
        except AttributeError:
            raise permissions.PermissionDenied("Profil entreprise non trouvé")
        
        serializer.save(entreprise=entreprise)


class OffreStageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, modifier et supprimer une offre de stage"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Utiliser le serializer admin si l'utilisateur est admin"""
        if self.request.user.is_authenticated and self.request.user.role == 'ADMIN':
            return OffreStageAdminSerializer
        return OffreStageSerializer
    
    def get_queryset(self):
        """Ajouter l'annotation places_prises pour le serializer"""
        return OffreStage.objects.annotate(
            places_prises=Count('candidatures', filter=Q(candidatures__statut='ACCEPTEE'))
        )
    
    def get_permissions(self):
        """Permissions différentes selon la méthode"""
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def get_object(self):
        """Récupérer l'offre avec l'annotation places_prises"""
        queryset = self.get_queryset()
        offre = get_object_or_404(queryset, pk=self.kwargs['pk'])
        
        # Vérifier que l'entreprise peut seulement voir ses propres offres
        if self.request.user.is_authenticated and self.request.user.role == 'ENTREPRISE':
            try:
                entreprise = self.request.user.entreprise_profile
                if offre.entreprise != entreprise:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Vous n'avez pas la permission de voir cette offre")
            except AttributeError:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Profil entreprise non trouvé")
        
        return offre
    
    def get_serializer_context(self):
        """Ajouter le request au contexte du serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour une offre"""
        offre = self.get_object()
        # Les admins peuvent modifier toutes les offres
        if request.user.role == 'ADMIN':
            return super().update(request, *args, **kwargs)
        # Les entreprises peuvent modifier leurs propres offres
        if request.user.role != 'ENTREPRISE':
            return Response({
                'error': 'Vous n\'avez pas la permission de modifier cette offre'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Vérifier que l'entreprise est propriétaire de l'offre
        try:
            if offre.entreprise.user != request.user:
                return Response({
                    'error': 'Vous n\'avez pas la permission de modifier cette offre'
                }, status=status.HTTP_403_FORBIDDEN)
        except AttributeError:
            return Response({
                'error': 'Erreur lors de la vérification des permissions'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Supprimer une offre"""
        offre = self.get_object()
        # Les admins peuvent supprimer toutes les offres
        if request.user.role == 'ADMIN':
            return super().destroy(request, *args, **kwargs)
        # Les entreprises peuvent supprimer leurs propres offres
        if request.user.role != 'ENTREPRISE' or offre.entreprise.user != request.user:
            return Response({
                'error': 'Vous n\'avez pas la permission de supprimer cette offre'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class MyOffresView(generics.ListAPIView):
    """Vue pour récupérer les offres de l'entreprise connectée"""
    serializer_class = OffreStageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'ENTREPRISE':
            return OffreStage.objects.none()
        try:
            entreprise = self.request.user.entreprise_profile
        except AttributeError:
            # Si l'entreprise n'a pas de profil, retourner un queryset vide
            return OffreStage.objects.none()
        return OffreStage.objects.filter(entreprise=entreprise).order_by('-date_creation')


class CandidatureListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer des candidatures"""
    serializer_class = CandidatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        """Ajouter le request au contexte du serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        user = self.request.user
        
        # Filtres
        offre_id = self.request.query_params.get('offre_id', None)
        
        if user.role == 'STAGIAIRE':
            # Les stagiaires voient leurs propres candidatures
            try:
                stagiaire = user.stagiaire_profile
                queryset = Candidature.objects.filter(stagiaire=stagiaire)
            except AttributeError:
                # Si le stagiaire n'a pas de profil, retourner un queryset vide
                queryset = Candidature.objects.none()
        elif user.role == 'ENTREPRISE':
            # Les entreprises voient les candidatures pour leurs offres
            try:
                entreprise = user.entreprise_profile
                queryset = Candidature.objects.filter(offre__entreprise=entreprise)
            except AttributeError:
                # Si l'entreprise n'a pas de profil, retourner un queryset vide
                queryset = Candidature.objects.none()
        elif user.role == 'ADMIN':
            # Les admins voient toutes les candidatures
            queryset = Candidature.objects.all()
        else:
            queryset = Candidature.objects.none()
        
        if offre_id:
            queryset = queryset.filter(offre_id=offre_id)
        
        return queryset.order_by('-date_candidature')
    
    def perform_create(self, serializer):
        """Créer une candidature pour le stagiaire connecté"""
        if self.request.user.role != 'STAGIAIRE':
            raise permissions.PermissionDenied("Seuls les stagiaires peuvent créer des candidatures")
        
        try:
            stagiaire = self.request.user.stagiaire_profile
        except AttributeError:
            raise permissions.PermissionDenied("Profil stagiaire non trouvé")
        
        serializer.save(stagiaire=stagiaire)


class CandidatureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, modifier et supprimer une candidature"""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Candidature.objects.all()
    
    def get_serializer_class(self):
        """Utiliser le serializer admin si l'utilisateur est admin"""
        if self.request.user.role == 'ADMIN':
            return CandidatureAdminSerializer
        return CandidatureSerializer
    
    def get_serializer_context(self):
        """Ajouter le request au contexte du serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_object(self):
        """Récupérer la candidature"""
        return get_object_or_404(Candidature, pk=self.kwargs['pk'])
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour une candidature"""
        candidature = self.get_object()
        user = request.user
        
        # Les admins peuvent modifier toutes les candidatures
        if user.role == 'ADMIN':
            # Les admins ont tous les droits
            return super().update(request, *args, **kwargs)
        # Seuls les entreprises peuvent modifier le statut
        elif user.role == 'ENTREPRISE':
            if candidature.offre.entreprise.user != user:
                return Response({
                    'error': 'Vous n\'avez pas la permission de modifier cette candidature'
                }, status=status.HTTP_403_FORBIDDEN)
            return super().update(request, *args, **kwargs)
        elif user.role == 'STAGIAIRE':
            # Les stagiaires peuvent seulement modifier leur lettre de motivation
            if candidature.stagiaire.user != user:
                return Response({
                    'error': 'Vous n\'avez pas la permission de modifier cette candidature'
                }, status=status.HTTP_403_FORBIDDEN)
            # Empêcher la modification du statut
            if 'statut' in request.data:
                request.data.pop('statut')
            return super().update(request, *args, **kwargs)
        else:
            return Response({
                'error': 'Permission refusée'
            }, status=status.HTTP_403_FORBIDDEN)
    
    def destroy(self, request, *args, **kwargs):
        """Supprimer une candidature"""
        candidature = self.get_object()
        user = request.user
        
        # Les admins peuvent supprimer toutes les candidatures
        if user.role == 'ADMIN':
            return super().destroy(request, *args, **kwargs)
        # Les stagiaires peuvent supprimer leurs propres candidatures
        elif user.role == 'STAGIAIRE' and candidature.stagiaire.user == user:
            return super().destroy(request, *args, **kwargs)
        else:
            return Response({
                'error': 'Vous n\'avez pas la permission de supprimer cette candidature'
            }, status=status.HTTP_403_FORBIDDEN)


class CandidatureAcceptView(APIView):
    """Vue pour accepter une candidature"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        candidature = get_object_or_404(Candidature, pk=pk)
        
        if request.user.role != 'ENTREPRISE' or candidature.offre.entreprise.user != request.user:
            return Response({
                'error': 'Permission refusée'
            }, status=status.HTTP_403_FORBIDDEN)
        
        candidature.statut = 'ACCEPTEE'
        candidature.save()
        
        return Response({
            'message': 'Candidature acceptée',
            'candidature': CandidatureSerializer(candidature).data
        }, status=status.HTTP_200_OK)


class CandidatureRejectView(APIView):
    """Vue pour refuser une candidature"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        candidature = get_object_or_404(Candidature, pk=pk)
        
        if request.user.role != 'ENTREPRISE' or candidature.offre.entreprise.user != request.user:
            return Response({
                'error': 'Permission refusée'
            }, status=status.HTTP_403_FORBIDDEN)
        
        candidature.statut = 'REFUSEE'
        candidature.save()
        
        return Response({
            'message': 'Candidature refusée',
            'candidature': CandidatureSerializer(candidature).data
        }, status=status.HTTP_200_OK)


class CandidaturesByOffreView(generics.ListAPIView):
    """Vue pour récupérer les candidatures d'une offre"""
    serializer_class = CandidatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        """Ajouter le request au contexte du serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        offre_id = self.kwargs['offre_id']
        offre = get_object_or_404(OffreStage, pk=offre_id)
        
        user = self.request.user
        
        # Vérifier les permissions
        if user.role == 'ENTREPRISE':
            if offre.entreprise.user != user:
                return Candidature.objects.none()
        elif user.role != 'ADMIN':
            return Candidature.objects.none()
        
        return Candidature.objects.filter(offre=offre).order_by('-date_candidature')


class MyCandidaturesView(generics.ListAPIView):
    """Vue pour récupérer les candidatures du stagiaire connecté"""
    serializer_class = CandidatureSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        """Ajouter le request au contexte du serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        if self.request.user.role != 'STAGIAIRE':
            return Candidature.objects.none()
        
        try:
            stagiaire = self.request.user.stagiaire_profile
        except AttributeError:
            # Si le stagiaire n'a pas de profil, retourner un queryset vide
            return Candidature.objects.none()
        
        return Candidature.objects.filter(stagiaire=stagiaire).order_by('-date_candidature')
