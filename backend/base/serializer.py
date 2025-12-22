from rest_framework import serializers

class GeneralLeaderboardSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    point = serializers.IntegerField()
    class_room = serializers.CharField()
    ranking = serializers.IntegerField()