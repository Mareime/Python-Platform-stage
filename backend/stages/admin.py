"""
Configuration de l'interface d'administration pour les stages
"""
from django.contrib import admin
from .models import OffreStage, Candidature


@admin.register(OffreStage)
class OffreStageAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour les offres de stage"""
    list_display = ['titre', 'entreprise', 'type_stage', 'domaine', 'ville', 
                    'date_debut', 'est_active', 'date_creation']
    list_filter = ['type_stage', 'domaine', 'ville', 'est_active', 'date_creation']
    search_fields = ['titre', 'description', 'entreprise__nom_entreprise']
    ordering = ['-date_creation']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Entreprise', {'fields': ('entreprise',)}),
        ('Informations générales', {
            'fields': ('titre', 'type_stage', 'domaine', 'description')
        }),
        ('Détails', {
            'fields': ('competences_requises', 'duree', 'date_debut', 
                      'date_limite', 'ville', 'remuneration', 'nombre_places')
        }),
        ('Statut', {'fields': ('est_active',)}),
        ('Dates', {'fields': ('date_creation', 'date_modification')}),
    )


@admin.register(Candidature)
class CandidatureAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour les candidatures"""
    list_display = ['stagiaire', 'offre', 'statut', 'date_candidature']
    list_filter = ['statut', 'date_candidature']
    search_fields = ['stagiaire__nom', 'stagiaire__prenom', 'offre__titre']
    ordering = ['-date_candidature']
    readonly_fields = ['date_candidature', 'date_modification']
    
    fieldsets = (
        ('Informations', {'fields': ('offre', 'stagiaire')}),
        ('Candidature', {'fields': ('lettre_motivation', 'statut')}),
        ('Dates', {'fields': ('date_candidature', 'date_modification')}),
    )
