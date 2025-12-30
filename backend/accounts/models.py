"""
Modèles pour la gestion des utilisateurs
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager personnalisé pour le modèle User"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Créer et enregistrer un utilisateur"""
        if not email:
            raise ValueError("L'email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Créer et enregistrer un superutilisateur"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le superutilisateur doit avoir is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le superutilisateur doit avoir is_superuser=True')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur de base"""
    
    ROLE_CHOICES = [
        ('STAGIAIRE', 'Stagiaire'),
        ('ENTREPRISE', 'Entreprise'),
        ('ADMIN', 'Administrateur'),
    ]
    
    email = models.EmailField(unique=True, verbose_name="Email")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, verbose_name="Rôle")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Stagiaire(models.Model):
    """Profil stagiaire"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stagiaire_profile')
    nom = models.CharField(max_length=100, verbose_name="Nom")
    prenom = models.CharField(max_length=100, verbose_name="Prénom")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    date_naissance = models.DateField(verbose_name="Date de naissance", null=True, blank=True)
    adresse = models.TextField(verbose_name="Adresse", blank=True)
    ville = models.CharField(max_length=100, verbose_name="Ville", blank=True)
    niveau_etude = models.CharField(max_length=100, verbose_name="Niveau d'études", blank=True)
    domaine = models.CharField(max_length=100, verbose_name="Domaine d'études", blank=True)
    cv_file = models.FileField(upload_to='cvs/', verbose_name="CV (PDF)", null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Stagiaire"
        verbose_name_plural = "Stagiaires"
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Entreprise(models.Model):
    """Profil entreprise"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='entreprise_profile')
    nom_entreprise = models.CharField(max_length=200, verbose_name="Nom de l'entreprise")
    secteur_activite = models.CharField(max_length=100, verbose_name="Secteur d'activité")
    telephone = models.CharField(max_length=20, verbose_name="Téléphone")
    adresse = models.TextField(verbose_name="Adresse")
    ville = models.CharField(max_length=100, verbose_name="Ville")
    site_web = models.URLField(verbose_name="Site web", blank=True)
    description = models.TextField(verbose_name="Description de l'entreprise", blank=True)
    contact_nom = models.CharField(max_length=100, verbose_name="Nom du contact")
    contact_prenom = models.CharField(max_length=100, verbose_name="Prénom du contact")
    contact_fonction = models.CharField(max_length=100, verbose_name="Fonction du contact", blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
    
    def __str__(self):
        return self.nom_entreprise
