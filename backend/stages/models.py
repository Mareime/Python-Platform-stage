"""
Modèles pour la gestion des stages
"""
from django.db import models
from django.contrib.auth import get_user_model
from accounts.models import Entreprise

User = get_user_model()


class OffreStage(models.Model):
    """Modèle pour les offres de stage"""
    
    TYPE_STAGE_CHOICES = [
        ('OBSERVATION', 'Stage d\'observation'),
        ('INITIATION', 'Stage d\'initiation'),
        ('PERFECTIONNEMENT', 'Stage de perfectionnement'),
        ('PFE', 'Projet de fin d\'études'),
    ]
    
    entreprise = models.ForeignKey(
        Entreprise, 
        on_delete=models.CASCADE, 
        related_name='offres',
        verbose_name="Entreprise"
    )
    titre = models.CharField(max_length=200, verbose_name="Titre du stage")
    type_stage = models.CharField(
        max_length=20, 
        choices=TYPE_STAGE_CHOICES,
        verbose_name="Type de stage"
    )
    domaine = models.CharField(max_length=100, verbose_name="Domaine")
    description = models.TextField(verbose_name="Description")
    competences_requises = models.TextField(
        verbose_name="Compétences requises",
        help_text="Séparées par des virgules"
    )
    duree = models.CharField(max_length=50, verbose_name="Durée")
    date_debut = models.DateField(verbose_name="Date de début")
    ville = models.CharField(max_length=100, verbose_name="Ville")
    remuneration = models.CharField(
        max_length=100, 
        verbose_name="Rémunération",
        blank=True
    )
    nombre_places = models.IntegerField(
        default=1,
        verbose_name="Nombre de places"
    )
    est_active = models.BooleanField(
        default=True,
        verbose_name="Offre active"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_limite = models.DateField(
        verbose_name="Date limite de candidature",
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Offre de stage"
        verbose_name_plural = "Offres de stage"
        ordering = ['-date_creation']
    
    def __str__(self):
        return f"{self.titre} - {self.entreprise.nom_entreprise}"
    
    def get_places_prises(self):
        """Retourne le nombre de places prises (candidatures acceptées)"""
        return self.candidatures.filter(statut='ACCEPTEE').count()
    
    def est_complete(self):
        """Vérifie si toutes les places sont prises"""
        return self.get_places_prises() >= self.nombre_places
    
    def est_expiree(self):
        """Vérifie si la date limite est passée"""
        if self.date_limite:
            from django.utils import timezone
            return timezone.now().date() > self.date_limite
        return False
    
    def est_disponible(self):
        """Vérifie si l'offre est disponible (active, non expirée, et avec places disponibles)"""
        return self.est_active and not self.est_expiree() and not self.est_complete()


class Candidature(models.Model):
    """Modèle pour les candidatures aux offres"""
    
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ACCEPTEE', 'Acceptée'),
        ('REFUSEE', 'Refusée'),
    ]
    
    offre = models.ForeignKey(
        OffreStage,
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name="Offre"
    )
    stagiaire = models.ForeignKey(
        'accounts.Stagiaire',
        on_delete=models.CASCADE,
        related_name='candidatures',
        verbose_name="Stagiaire"
    )
    lettre_motivation = models.TextField(
        verbose_name="Lettre de motivation",
        blank=True
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut"
    )
    date_candidature = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"
        ordering = ['-date_candidature']
        unique_together = ['offre', 'stagiaire']
    
    def __str__(self):
        return f"{self.stagiaire} - {self.offre.titre} ({self.get_statut_display()})"
