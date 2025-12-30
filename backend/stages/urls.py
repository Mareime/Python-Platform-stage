"""
URLs pour la gestion des stages
"""
from django.urls import path
from .views import (
    OffreStageListCreateView,
    OffreStageDetailView,
    MyOffresView,
    CandidatureListCreateView,
    CandidatureDetailView,
    CandidatureAcceptView,
    CandidatureRejectView,
    CandidaturesByOffreView,
    MyCandidaturesView,
)

urlpatterns = [
    # Offres de stage
    path('offres/', OffreStageListCreateView.as_view(), name='offre-list-create'),
    path('offres/<int:pk>/', OffreStageDetailView.as_view(), name='offre-detail'),
    path('offres/my-offres/', MyOffresView.as_view(), name='my-offres'),
    
    # Candidatures
    path('candidatures/', CandidatureListCreateView.as_view(), name='candidature-list-create'),
    path('candidatures/<int:pk>/', CandidatureDetailView.as_view(), name='candidature-detail'),
    path('candidatures/<int:pk>/accept/', CandidatureAcceptView.as_view(), name='candidature-accept'),
    path('candidatures/<int:pk>/reject/', CandidatureRejectView.as_view(), name='candidature-reject'),
    path('candidatures/my-candidatures/', MyCandidaturesView.as_view(), name='my-candidatures'),
    path('candidatures/offre/<int:offre_id>/candidatures/', CandidaturesByOffreView.as_view(), name='candidatures-by-offre'),
]
