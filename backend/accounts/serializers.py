"""
Serializers pour la gestion des utilisateurs
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Stagiaire, Entreprise

User = get_user_model()


class StagiaireSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Stagiaire"""
    user = serializers.SerializerMethodField()
    cv_file_url = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Stagiaire
        fields = [
            'id', 'nom', 'prenom', 'telephone', 'date_naissance',
            'adresse', 'ville', 'niveau_etude', 'domaine', 'cv_file', 'cv_file_url',
            'date_creation', 'date_modification', 'user'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'user', 'cv_file_url']
    
    def get_user(self, obj):
        """Récupérer l'email de l'utilisateur"""
        if obj.user:
            return {'id': obj.user.id, 'email': obj.user.email, 'is_active': obj.user.is_active}
        return None
    
    def get_cv_file_url(self, obj):
        """Récupérer l'URL du CV"""
        if obj.cv_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv_file.url)
            return obj.cv_file.url
        return None


class StagiaireAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour le profil Stagiaire - permet de modifier tous les champs"""
    user = serializers.SerializerMethodField()
    cv_file_url = serializers.SerializerMethodField(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    user_email = serializers.EmailField(write_only=True, required=False)
    user_is_active = serializers.BooleanField(write_only=True, required=False)
    
    class Meta:
        model = Stagiaire
        fields = [
            'id', 'nom', 'prenom', 'telephone', 'date_naissance',
            'adresse', 'ville', 'niveau_etude', 'domaine', 'cv_file', 'cv_file_url',
            'date_creation', 'date_modification', 'user', 'user_id', 'user_email', 'user_is_active'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'cv_file_url']
    
    def get_user(self, obj):
        """Récupérer l'email de l'utilisateur"""
        if obj.user:
            return {'id': obj.user.id, 'email': obj.user.email, 'is_active': obj.user.is_active, 'role': obj.user.role}
        return None
    
    def get_cv_file_url(self, obj):
        """Récupérer l'URL du CV"""
        if obj.cv_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv_file.url)
            return obj.cv_file.url
        return None
    
    def update(self, instance, validated_data):
        """Mettre à jour le stagiaire et éventuellement l'utilisateur associé"""
        user_id = validated_data.pop('user_id', None)
        user_email = validated_data.pop('user_email', None)
        user_is_active = validated_data.pop('user_is_active', None)
        
        # Mettre à jour le stagiaire
        instance = super().update(instance, validated_data)
        
        # Mettre à jour l'utilisateur si nécessaire
        if instance.user:
            if user_email is not None:
                instance.user.email = user_email
            if user_is_active is not None:
                instance.user.is_active = user_is_active
            if user_id is not None and user_id != instance.user.id:
                # Changer l'utilisateur associé (rare mais possible pour admin)
                instance.user = User.objects.get(id=user_id)
            instance.user.save()
        
        return instance


class EntrepriseSerializer(serializers.ModelSerializer):
    """Serializer pour le profil Entreprise"""
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Entreprise
        fields = [
            'id', 'nom_entreprise', 'secteur_activite', 'telephone',
            'adresse', 'ville', 'site_web', 'description',
            'contact_nom', 'contact_prenom', 'contact_fonction',
            'date_creation', 'date_modification', 'user'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'user']
    
    def get_user(self, obj):
        """Récupérer l'email de l'utilisateur"""
        if obj.user:
            return {'id': obj.user.id, 'email': obj.user.email, 'is_active': obj.user.is_active}
        return None


class EntrepriseAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour le profil Entreprise - permet de modifier tous les champs"""
    user = serializers.SerializerMethodField()
    user_id = serializers.IntegerField(write_only=True, required=False)
    user_email = serializers.EmailField(write_only=True, required=False)
    user_is_active = serializers.BooleanField(write_only=True, required=False)
    
    class Meta:
        model = Entreprise
        fields = [
            'id', 'nom_entreprise', 'secteur_activite', 'telephone',
            'adresse', 'ville', 'site_web', 'description',
            'contact_nom', 'contact_prenom', 'contact_fonction',
            'date_creation', 'date_modification', 'user', 'user_id', 'user_email', 'user_is_active'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
    
    def get_user(self, obj):
        """Récupérer l'email de l'utilisateur"""
        if obj.user:
            return {'id': obj.user.id, 'email': obj.user.email, 'is_active': obj.user.is_active, 'role': obj.user.role}
        return None
    
    def update(self, instance, validated_data):
        """Mettre à jour l'entreprise et éventuellement l'utilisateur associé"""
        user_id = validated_data.pop('user_id', None)
        user_email = validated_data.pop('user_email', None)
        user_is_active = validated_data.pop('user_is_active', None)
        
        # Mettre à jour l'entreprise
        instance = super().update(instance, validated_data)
        
        # Mettre à jour l'utilisateur si nécessaire
        if instance.user:
            if user_email is not None:
                instance.user.email = user_email
            if user_is_active is not None:
                instance.user.is_active = user_is_active
            if user_id is not None and user_id != instance.user.id:
                # Changer l'utilisateur associé (rare mais possible pour admin)
                instance.user = User.objects.get(id=user_id)
            instance.user.save()
        
        return instance


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour l'utilisateur avec profil"""
    stagiaire_profile = StagiaireSerializer(read_only=True)
    entreprise_profile = EntrepriseSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'is_active', 'date_joined', 
                  'stagiaire_profile', 'entreprise_profile']
        read_only_fields = ['id', 'date_joined']


class RegisterStagiaireSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un stagiaire"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100)
    telephone = serializers.CharField(max_length=20)
    # date_naissance = serializers.DateField(required=False, allow_null=True)
    adresse = serializers.CharField(required=False, allow_blank=True)
    ville = serializers.CharField(max_length=100, required=False, allow_blank=True)
    niveau_etude = serializers.CharField(max_length=100, required=False, allow_blank=True)
    domaine = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    class Meta:
        model = User
        # Tous les champs déclarés explicitement doivent être dans fields
        fields = ['email', 'password', 'password_confirm', 'nom', 'prenom', 'telephone', 
                  'adresse', 'ville', 'niveau_etude', 'domaine']
    
    def validate(self, data):
        """Valider que les mots de passe correspondent"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        """Créer un utilisateur stagiaire avec son profil"""
        validated_data.pop('password_confirm')
        nom = validated_data.pop('nom')
        prenom = validated_data.pop('prenom')
        telephone = validated_data.pop('telephone')
        # date_naissance n'est pas utilisé pour l'instant (commenté dans le serializer)
        # date_naissance = validated_data.pop('date_naissance', None)
        adresse = validated_data.pop('adresse', '')
        ville = validated_data.pop('ville', '')
        niveau_etude = validated_data.pop('niveau_etude', '')
        domaine = validated_data.pop('domaine', '')
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role='STAGIAIRE'
        )
        
        # Créer le profil stagiaire
        Stagiaire.objects.create(
            user=user,
            nom=nom,
            prenom=prenom,
            telephone=telephone,
            # date_naissance=date_naissance,  # Commenté car le champ est désactivé
            adresse=adresse,
            ville=ville,
            niveau_etude=niveau_etude,
            domaine=domaine
        )
        
        return user


class RegisterEntrepriseSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'une entreprise"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    nom_entreprise = serializers.CharField(max_length=200)
    secteur_activite = serializers.CharField(max_length=100)
    telephone = serializers.CharField(max_length=20)
    adresse = serializers.CharField()
    ville = serializers.CharField(max_length=100)
    contact_nom = serializers.CharField(max_length=100)
    contact_prenom = serializers.CharField(max_length=100)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'nom_entreprise',
            'secteur_activite', 'telephone', 'adresse', 'ville',
            'contact_nom', 'contact_prenom'
        ]
    
    def validate(self, data):
        """Valider que les mots de passe correspondent"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data
    
    def create(self, validated_data):
        """Créer un utilisateur entreprise avec son profil"""
        validated_data.pop('password_confirm')
        
        # Extraire les données du profil entreprise
        entreprise_data = {
            'nom_entreprise': validated_data.pop('nom_entreprise'),
            'secteur_activite': validated_data.pop('secteur_activite'),
            'telephone': validated_data.pop('telephone'),
            'adresse': validated_data.pop('adresse'),
            'ville': validated_data.pop('ville'),
            'contact_nom': validated_data.pop('contact_nom'),
            'contact_prenom': validated_data.pop('contact_prenom'),
        }
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role='ENTREPRISE'
        )
        
        # Créer le profil entreprise
        Entreprise.objects.create(user=user, **entreprise_data)
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
