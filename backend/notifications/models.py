"""
Modèles pour les notifications
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """Modèle pour les notifications"""
    
    TYPE_CHOICES = [
        ('NOUVELLE_CANDIDATURE', 'Nouvelle candidature'),
        ('CANDIDATURE_ACCEPTEE', 'Candidature acceptée'),
        ('CANDIDATURE_REFUSEE', 'Candidature refusée'),
        ('OFFRE_VALIDEE', 'Offre validée'),
        ('OFFRE_REFUSEE', 'Offre refusée'),
        ('NOUVEAU_STAGIAIRE', 'Nouveau stagiaire inscrit'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Utilisateur"
    )
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        verbose_name="Type de notification"
    )
    title = models.CharField(max_length=200, verbose_name="Titre")
    message = models.TextField(verbose_name="Message")
    is_read = models.BooleanField(default=False, verbose_name="Lu")
    related_object_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="Type d'objet lié"
    )
    related_object_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="ID de l'objet lié"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"

