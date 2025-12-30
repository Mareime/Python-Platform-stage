"""
Serializers pour les notifications
"""
from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer pour les notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'message', 'is_read',
            'related_object_type', 'related_object_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

