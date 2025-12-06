from django.test import TestCase
from datetime import date, timedelta
from .scoring import calculate_priority_score, detect_cycles, analyze_tasks


class AlgorithmTests(TestCase):
    def test_detect_cycles_no_cycle(self):
        tasks = [
            {'id': 1, 'dependencies': [2]},
            {'id': 2, 'dependencies': []}
        ]
        self.assertFalse(detect_cycles(tasks))

    def test_detect_cycles_simple_cycle(self):
        tasks = [
            {'id': 1, 'dependencies': [2]},
            {'id': 2, 'dependencies': [1]}
        ]
        self.assertTrue(detect_cycles(tasks))

    def test_detect_cycles_complex_cycle(self):
        tasks = [
            {'id': 1, 'dependencies': [2]},
            {'id': 2, 'dependencies': [3]},
            {'id': 3, 'dependencies': [1]}
        ]
        self.assertTrue(detect_cycles(tasks))

    def test_priority_score_overdue(self):
        task = {
            'title': 'Overdue Task',
            'due_date': date.today() - timedelta(days=1),
            'estimated_hours': 5,
            'importance': 5,
            'dependencies': []
        }
        result = calculate_priority_score(task)
        self.assertGreaterEqual(result['score'], 50)
        self.assertIn("Overdue", result['explanation'])

    def test_priority_score_quick_win(self):
        task = {
            'title': 'Quick Win',
            'due_date': date.today() + timedelta(days=10),
            'estimated_hours': 1,
            'importance': 5,
            'dependencies': []
        }
        result = calculate_priority_score(task)
        self.assertGreaterEqual(result['score'], 25)
        self.assertIn("Quick win", result['explanation'])

    def test_analyze_tasks_sorting(self):
        tasks = [
            {
                'id': 1,
                'title': 'Important Task',
                'due_date': date.today() + timedelta(days=5),
                'estimated_hours': 10,
                'importance': 10,
                'dependencies': []
            },
            {
                'id': 2,
                'title': 'Quick Win',
                'due_date': date.today() + timedelta(days=5),
                'estimated_hours': 1,
                'importance': 5,
                'dependencies': []
            }
        ]
        results = analyze_tasks(tasks)
        self.assertEqual(results[0]['id'], 2)
        self.assertEqual(results[1]['id'], 1)

    def test_analyze_tasks_blocking_boost(self):
        tasks = [
            {
                'id': 1,
                'title': 'Blocker',
                'due_date': date.today() + timedelta(days=10),
                'estimated_hours': 5,
                'importance': 5,
                'dependencies': []
            },
            {
                'id': 2,
                'title': 'Blocked',
                'due_date': date.today() + timedelta(days=10),
                'estimated_hours': 5,
                'importance': 5,
                'dependencies': [1]
            }
        ]
        results = analyze_tasks(tasks)
        self.assertEqual(results[0]['id'], 1)
        self.assertIn("Blocks 1 other task(s)", results[0]['explanation'])

