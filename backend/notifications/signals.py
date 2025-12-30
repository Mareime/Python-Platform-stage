"""
Signaux pour créer automatiquement des notifications
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Notification
from stages.models import Candidature, OffreStage
from accounts.models import Stagiaire, Entreprise


@receiver(post_save, sender=Candidature)
def create_candidature_notification(sender, instance, created, **kwargs):
    """Créer une notification lorsqu'une candidature est créée"""
    if created:
        # Notifier l'entreprise propriétaire de l'offre
        entreprise_user = instance.offre.entreprise.user
        Notification.objects.create(
            user=entreprise_user,
            type='NOUVELLE_CANDIDATURE',
            title='Nouvelle candidature',
            message=f"Une nouvelle candidature a été reçue pour l'offre '{instance.offre.titre}'",
            related_object_type='offre',
            related_object_id=instance.offre.id
        )
    else:
        # Si le statut a changé, notifier le stagiaire
        if instance.statut in ['ACCEPTEE', 'REFUSEE']:
            stagiaire_user = instance.stagiaire.user
            statut_message = 'acceptée' if instance.statut == 'ACCEPTEE' else 'refusée'
            type_notification = 'CANDIDATURE_ACCEPTEE' if instance.statut == 'ACCEPTEE' else 'CANDIDATURE_REFUSEE'
            
            Notification.objects.create(
                user=stagiaire_user,
                type=type_notification,
                title=f'Candidature {statut_message}',
                message=f"Votre candidature pour l'offre '{instance.offre.titre}' a été {statut_message}",
                related_object_type='offre',
                related_object_id=instance.offre.id
            )


@receiver(post_save, sender=OffreStage)
def create_offre_notification(sender, instance, created, **kwargs):
    """Créer une notification lorsqu'une offre est validée ou refusée par l'admin"""
    if not created:
        # Vérifier si l'offre a été validée ou refusée (changement de est_active)
        # Note: Cette logique peut être améliorée avec un champ de statut dédié
        entreprise_user = instance.entreprise.user
        
        # Si l'offre devient inactive, on peut considérer qu'elle a été refusée
        # Si elle devient active après avoir été inactive, on peut considérer qu'elle a été validée
        # Pour l'instant, on ne crée pas de notification automatique pour les offres
        # car cela nécessiterait de suivre l'état précédent
        pass


@receiver(post_save, sender=Stagiaire)
def create_stagiaire_notification(sender, instance, created, **kwargs):
    """Créer une notification aux entreprises lorsqu'un nouveau stagiaire s'inscrit"""
    if created:
        # Notifier toutes les entreprises qui ont des offres actives
        # Optionnellement, on peut filtrer par domaine si le stagiaire a un domaine spécifié
        entreprises = Entreprise.objects.all()
        
        # Si le stagiaire a un domaine spécifié, notifier seulement les entreprises
        # qui ont des offres actives dans ce domaine
        if instance.domaine:
            entreprises = entreprises.filter(
                offres__domaine=instance.domaine,
                offres__est_active=True
            ).distinct()
        else:
            # Sinon, notifier toutes les entreprises qui ont des offres actives
            entreprises = entreprises.filter(
                offres__est_active=True
            ).distinct()
        
        # Créer une notification pour chaque entreprise concernée
        for entreprise in entreprises:
            # Éviter les doublons : vérifier qu'une notification similaire n'existe pas déjà
            # dans les dernières minutes
            recent_notification = Notification.objects.filter(
                user=entreprise.user,
                type='NOUVEAU_STAGIAIRE',
                related_object_id=instance.id,
                created_at__gte=timezone.now() - timedelta(minutes=5)
            ).exists()
            
            if not recent_notification:
                domaine_info = f" dans le domaine {instance.domaine}" if instance.domaine else ""
                Notification.objects.create(
                    user=entreprise.user,
                    type='NOUVEAU_STAGIAIRE',
                    title='Nouveau stagiaire inscrit',
                    message=f"Un nouveau stagiaire {instance.prenom} {instance.nom}{domaine_info} vient de s'inscrire sur la plateforme.",
                    related_object_type='stagiaire',
                    related_object_id=instance.id
                )

