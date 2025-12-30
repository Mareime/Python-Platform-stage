"""
Configuration de l'interface d'administration
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Stagiaire, Entreprise


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Configuration de l'admin pour le modèle User"""
    list_display = ['email', 'role', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['email']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations', {'fields': ('role',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Stagiaire)
class StagiaireAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour le modèle Stagiaire"""
    list_display = ['nom', 'prenom', 'telephone', 'ville', 'niveau_etude', 'date_creation']
    list_filter = ['niveau_etude', 'ville', 'date_creation']
    search_fields = ['nom', 'prenom', 'telephone', 'domaine']
    ordering = ['-date_creation']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Utilisateur', {'fields': ('user',)}),
        ('Informations personnelles', {
            'fields': ('nom', 'prenom', 'date_naissance', 'telephone')
        }),
        ('Adresse', {'fields': ('adresse', 'ville')}),
        ('Formation', {'fields': ('niveau_etude', 'domaine')}),
        ('CV', {'fields': ('cv_file',)}),
        ('Dates', {'fields': ('date_creation', 'date_modification')}),
    )


@admin.register(Entreprise)
class EntrepriseAdmin(admin.ModelAdmin):
    """Configuration de l'admin pour le modèle Entreprise"""
    list_display = ['nom_entreprise', 'secteur_activite', 'ville', 'contact_nom', 'date_creation']
    list_filter = ['secteur_activite', 'ville', 'date_creation']
    search_fields = ['nom_entreprise', 'secteur_activite', 'contact_nom']
    ordering = ['-date_creation']
    readonly_fields = ['date_creation', 'date_modification']
    
    fieldsets = (
        ('Utilisateur', {'fields': ('user',)}),
        ('Informations entreprise', {
            'fields': ('nom_entreprise', 'secteur_activite', 'description', 'site_web')
        }),
        ('Coordonnées', {'fields': ('telephone', 'adresse', 'ville')}),
        ('Contact', {
            'fields': ('contact_nom', 'contact_prenom', 'contact_fonction')
        }),
        ('Dates', {'fields': ('date_creation', 'date_modification')}),
    )
