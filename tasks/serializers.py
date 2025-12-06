from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    dependency_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, write_only=True
    )

    class Meta:
        model = Task
        fields = ['id', 'title', 'due_date', 'estimated_hours', 'importance', 'dependencies', 'dependency_ids']
        extra_kwargs = {
            'dependencies': {'read_only': True}
        }

    def create(self, validated_data):
        dep_ids = validated_data.pop('dependency_ids', [])
        task = Task.objects.create(**validated_data)
        if dep_ids:
            task.dependencies.set(dep_ids)
        return task
