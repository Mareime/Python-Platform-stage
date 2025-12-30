"""
Serializers pour la gestion des stages
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
import re
from .models import OffreStage, Candidature
from accounts.serializers import EntrepriseSerializer, StagiaireSerializer
from accounts.models import Stagiaire


class OffreStageSerializer(serializers.ModelSerializer):
    """Serializer pour les offres de stage"""
    entreprise = EntrepriseSerializer(read_only=True)
    entreprise_id = serializers.IntegerField(write_only=True, required=False)
    places_prises = serializers.SerializerMethodField()
    est_disponible = serializers.SerializerMethodField()
    est_expiree = serializers.SerializerMethodField()
    est_complete = serializers.SerializerMethodField()
    
    class Meta:
        model = OffreStage
        fields = [
            'id', 'entreprise', 'entreprise_id', 'titre', 'type_stage',
            'domaine', 'description', 'competences_requises', 'duree',
            'date_debut', 'ville', 'remuneration', 'nombre_places',
            'est_active', 'date_creation', 'date_modification', 'date_limite',
            'places_prises', 'est_disponible', 'est_expiree', 'est_complete'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification', 'places_prises', 
                            'est_disponible', 'est_expiree', 'est_complete']
    
    def get_places_prises(self, obj):
        if hasattr(obj, 'places_prises'):
            return obj.places_prises
        return obj.get_places_prises()
    
    def get_est_disponible(self, obj):
        return obj.est_disponible()
    
    def get_est_expiree(self, obj):
        return obj.est_expiree()
    
    def get_est_complete(self, obj):
        places_prises = self.get_places_prises(obj)
        return places_prises >= obj.nombre_places if obj.nombre_places else False
    
    def validate_date_debut(self, value):
        """Valider que la date de début n'est pas dans le passé"""
        # Pour l'admin, permettre les dates dans le passé
        request = self.context.get('request')
        if request and request.user and request.user.role == 'ADMIN':
            return value
        if value and value < timezone.now().date():
            raise serializers.ValidationError("La date de début ne peut pas être dans le passé")
        return value

    def validate_date_limite(self, value):
        """Valider que la date limite n'est pas dans le passé"""
        # Pour l'admin, permettre les dates dans le passé
        request = self.context.get('request')
        if request and request.user and request.user.role == 'ADMIN':
            return value
        if value:
            today = timezone.now().date()
            if value < today:
                raise serializers.ValidationError("La date limite ne peut pas être dans le passé")
        return value
    
    def validate(self, data):
        """Validation globale"""
        request = self.context.get('request')
        is_admin = request and request.user and request.user.role == 'ADMIN'
        
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')
        date_limite = data.get('date_limite')

        # Pour l'admin, sauter certaines validations de dates
        if not is_admin:
            # Check if date_debut is in the past
            if date_debut and date_debut < timezone.now().date():
                raise serializers.ValidationError({'date_debut': "La date de début ne peut pas être dans le passé"})

            # Check if date_limite is in the past
            if date_limite and date_limite < timezone.now().date():
                raise serializers.ValidationError({'date_limite': "La date limite ne peut pas être dans le passé"})

        # Check that date_limite is after or equal to date_debut
        if date_limite and date_debut and date_limite < date_debut:
            raise serializers.ValidationError({'date_limite': "La date limite doit être après ou égale à la date de début"})

        # Check that date_fin is after date_debut
        if date_fin and date_debut and date_fin < date_debut:
            raise serializers.ValidationError({'date_fin': "La date de fin doit être après la date de début"})

        # Check that duration matches the period between date_debut and date_fin
        if date_debut and date_fin:
            difference = (date_fin - date_debut).days + 1
            if difference <= 0:
                raise serializers.ValidationError({'date_fin': "La date de fin doit être après la date de début"})

            duree_str = data.get('duree', '').lower()
            if duree_str:
                match = re.match(r'(\d+)\s*(mois|semaines|jours|month|weeks|days)?', duree_str)
                if match:
                    value = int(match.group(1))
                    unit = match.group(2)

                    expected_days = 0
                    if 'mois' in unit or 'month' in unit:
                        expected_days = value * 30
                    elif 'semaine' in unit or 'week' in unit:
                        expected_days = value * 7
                    elif 'jour' in unit or 'day' in unit:
                        expected_days = value

                    # Allow a small tolerance for month/week calculations
                    tolerance = 5 if 'mois' in unit or 'month' in unit else (2 if 'semaine' in unit or 'week' in unit else 0)
                    if abs(difference - expected_days) > tolerance:
                        raise serializers.ValidationError({
                            'duree': f"La durée '{duree_str}' ne correspond pas à la période entre la date de début et la date de fin ({difference} jours)."
                        })
                else:
                    raise serializers.ValidationError({'duree': "Format de durée invalide. Utilisez 'X mois', 'X semaines' ou 'X jours'."})

        return data
    
    def create(self, validated_data):
        """Créer une offre de stage"""
        entreprise_id = validated_data.pop('entreprise_id', None)
        if entreprise_id:
            from accounts.models import Entreprise
            validated_data['entreprise'] = Entreprise.objects.get(id=entreprise_id)
        return super().create(validated_data)


class OffreStageAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les offres de stage - permet de modifier tous les champs"""
    entreprise = EntrepriseSerializer(read_only=True)
    entreprise_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = OffreStage
        fields = [
            'id', 'entreprise', 'entreprise_id', 'titre', 'type_stage',
            'domaine', 'description', 'competences_requises', 'duree',
            'date_debut', 'ville', 'remuneration', 'nombre_places',
            'est_active', 'date_creation', 'date_modification', 'date_limite'
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']
    
    def validate(self, data):
        """Validation globale - moins stricte pour l'admin"""
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')
        date_limite = data.get('date_limite')

        # Check that date_limite is after or equal to date_debut
        if date_limite and date_debut and date_limite < date_debut:
            raise serializers.ValidationError({'date_limite': "La date limite doit être après ou égale à la date de début"})

        # Check that date_fin is after date_debut
        if date_fin and date_debut and date_fin < date_debut:
            raise serializers.ValidationError({'date_fin': "La date de fin doit être après la date de début"})

        return data


class StagiaireWithUserSerializer(serializers.ModelSerializer):
    """Serializer pour le stagiaire avec l'email de l'utilisateur"""
    user = serializers.SerializerMethodField()
    cv_file = serializers.SerializerMethodField()
    
    class Meta:
        model = Stagiaire
        fields = ['id', 'nom', 'prenom', 'telephone', 'date_naissance',
                 'adresse', 'ville', 'niveau_etude', 'domaine', 'cv_file', 'user']
    
    def get_user(self, obj):
        """Récupérer l'email de l'utilisateur"""
        if obj.user:
            return {'id': obj.user.id, 'email': obj.user.email}
        return None
    
    def get_cv_file(self, obj):
        """Récupérer l'URL du CV"""
        if obj.cv_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv_file.url)
            return obj.cv_file.url
        return None


class CandidatureSerializer(serializers.ModelSerializer):
    """Serializer pour les candidatures"""
    offre = OffreStageSerializer(read_only=True)
    offre_id = serializers.IntegerField(write_only=True, required=False)
    stagiaire = serializers.SerializerMethodField()
    stagiaire_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Candidature
        fields = [
            'id', 'offre', 'offre_id', 'stagiaire', 'stagiaire_id',
            'lettre_motivation', 'statut', 'date_candidature', 'date_modification'
        ]
        read_only_fields = ['id', 'date_candidature', 'date_modification']
    
    def get_stagiaire(self, obj):
        """Récupérer les informations du stagiaire avec l'email"""
        if obj.stagiaire:
            request = self.context.get('request')
            serializer = StagiaireWithUserSerializer(obj.stagiaire, context={'request': request})
            return serializer.data
        return None
    
    def create(self, validated_data):
        """Créer une candidature"""
        offre_id = validated_data.pop('offre_id', None)
        stagiaire_id = validated_data.pop('stagiaire_id', None)
        
        if not offre_id:
            raise serializers.ValidationError({'offre_id': 'Ce champ est requis lors de la création'})
        
        from stages.models import OffreStage
        from accounts.models import Stagiaire
        
        validated_data['offre'] = OffreStage.objects.get(id=offre_id)
        if stagiaire_id:
            validated_data['stagiaire'] = Stagiaire.objects.get(id=stagiaire_id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Mettre à jour une candidature"""
        # Ne pas permettre la modification de l'offre ou du stagiaire lors de la mise à jour
        validated_data.pop('offre_id', None)
        validated_data.pop('stagiaire_id', None)
        return super().update(instance, validated_data)


class CandidatureAdminSerializer(serializers.ModelSerializer):
    """Serializer admin pour les candidatures - permet de modifier tous les champs"""
    offre = OffreStageSerializer(read_only=True)
    offre_id = serializers.IntegerField(write_only=True, required=False)
    stagiaire = serializers.SerializerMethodField()
    stagiaire_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Candidature
        fields = [
            'id', 'offre', 'offre_id', 'stagiaire', 'stagiaire_id',
            'lettre_motivation', 'statut', 'date_candidature', 'date_modification'
        ]
        read_only_fields = ['id', 'date_candidature', 'date_modification']
    
    def get_stagiaire(self, obj):
        """Récupérer les informations du stagiaire avec l'email"""
        if obj.stagiaire:
            request = self.context.get('request')
            serializer = StagiaireWithUserSerializer(obj.stagiaire, context={'request': request})
            return serializer.data
        return None
    
    def update(self, instance, validated_data):
        """Mettre à jour une candidature - admin peut modifier offre et stagiaire"""
        offre_id = validated_data.pop('offre_id', None)
        stagiaire_id = validated_data.pop('stagiaire_id', None)
        
        if offre_id:
            from stages.models import OffreStage
            instance.offre = OffreStage.objects.get(id=offre_id)
        
        if stagiaire_id:
            from accounts.models import Stagiaire
            instance.stagiaire = Stagiaire.objects.get(id=stagiaire_id)
        
        return super().update(instance, validated_data)
