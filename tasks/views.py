from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .scoring import analyze_tasks
from .models import Task
from .serializers import TaskSerializer


class AnalyzeTasksView(APIView):
    def post(self, request):
        tasks_data = request.data
        if not isinstance(tasks_data, list):
            return Response({"error": "Expected a list of tasks"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskSerializer(data=tasks_data, many=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        analyzed_results = analyze_tasks(tasks_data)

        if isinstance(analyzed_results, dict) and "error" in analyzed_results:
            return Response(analyzed_results, status=status.HTTP_400_BAD_REQUEST)

        return Response(analyzed_results, status=status.HTTP_200_OK)


class SuggestTasksView(APIView):
    def get(self, request):
        tasks = Task.objects.all()
        serializer = TaskSerializer(tasks, many=True)
        data = serializer.data

        analyzed_results = analyze_tasks(data)

        if isinstance(analyzed_results, dict) and "error" in analyzed_results:
            return Response(analyzed_results, status=status.HTTP_400_BAD_REQUEST)

        return Response(analyzed_results[:3], status=status.HTTP_200_OK)
