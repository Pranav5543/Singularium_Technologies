# Smart Task Analyzer

A task management system that intelligently scores and prioritizes tasks based on multiple factors including urgency, importance, effort, and dependencies.

## Project Structure

```
task-analyzer/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── task_analyzer/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tasks/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── scoring.py
│   ├── urls.py
│   ├── serializers.py
│   └── tests.py
├── manage.py
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd task-analyzer
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run database migrations:

```bash
python manage.py migrate
```

5. Start the development server:

```bash
python manage.py runserver
```

6. Open `frontend/index.html` in your browser, or serve it via Django by configuring static files.

## API Endpoints

### POST `/api/tasks/analyze/`

Accepts a list of tasks and returns them sorted by priority score.

**Request Body:**

```json
[
  {
    "id": 1,
    "title": "Fix login bug",
    "due_date": "2025-11-30",
    "estimated_hours": 3,
    "importance": 8,
    "dependencies": []
  }
]
```

**Response:** Tasks sorted by priority with calculated scores and explanations.

### GET `/api/tasks/suggest/`

Returns the top 3 prioritized tasks from the database.

## Algorithm Explanation

The priority scoring algorithm evaluates tasks across four key dimensions to produce a final score:

### 1. Urgency Score (0-50 points)

Urgency is calculated based on the number of days until the due date:

- **Overdue tasks**: +50 points (highest priority)
- **Due today**: +30 points
- **Due within 10 days**: Uses a sliding scale where `score = (10 - days_remaining) * 2`
- **Due beyond 10 days**: 0 points

This ensures overdue tasks bubble to the top immediately, while upcoming deadlines receive proportional weight.

### 2. Importance Score (2-20 points)

The user-provided importance rating (1-10) is multiplied by 2 to give it appropriate weight in the final calculation. A task with importance 10 contributes 20 points, while importance 1 contributes only 2 points.

### 3. Effort/Quick Wins Score (0-15 points)

Lower effort tasks receive bonus points to encourage completing "quick wins":

- **≤ 2 hours**: +15 points (easy to knock out)
- **3-5 hours**: +5 points
- **> 5 hours**: 0 points

This prevents large tasks from indefinitely blocking progress.

### 4. Dependency Blocking Score (0-N\*5 points)

Tasks that block other tasks receive +5 points per dependent task. This ensures bottleneck tasks are prioritized to unblock downstream work.

### Circular Dependency Detection

The algorithm uses depth-first search (DFS) to detect circular dependencies before scoring. If a cycle is detected, the API returns an error rather than attempting to process invalid data.

### Final Score

```
priority_score = urgency + (importance * 2) + effort_bonus + (blocked_count * 5)
```

## Design Decisions

### Trade-offs Made

1. **Client-side sorting strategies**: Alternative sorting modes (Fastest Wins, High Impact, Deadline Driven) are implemented client-side rather than adding backend endpoints. This reduces API calls and provides instant feedback, though it means the backend always returns "Smart Balance" scores.

2. **Temporary IDs for analysis**: When tasks are submitted without IDs, the system assigns temporary sequential IDs. This allows dependency tracking without requiring database persistence for analysis-only operations.

3. **Fixed weight constants**: The algorithm uses fixed weights rather than user-configurable values. This simplifies the implementation while providing sensible defaults. Configurability could be added as a future enhancement.

4. **ManyToMany for dependencies**: Using Django's ManyToMany field for task dependencies provides clean ORM queries but means circular dependency detection must happen at the application level.

## Time Breakdown

| Section                            | Time Spent   |
| ---------------------------------- | ------------ |
| Backend Models & Serializers       | 30 min       |
| Priority Algorithm Design          | 45 min       |
| API Views & URL Configuration      | 30 min       |
| Frontend HTML/CSS Layout           | 45 min       |
| JavaScript Logic & API Integration | 45 min       |
| Sorting Strategies Implementation  | 20 min       |
| Unit Tests                         | 30 min       |
| Bonus Features (Matrix, Graph)     | 45 min       |
| Code Cleanup & Documentation       | 30 min       |
| **Total**                          | **~5 hours** |

## Bonus Challenges Completed

- **Eisenhower Matrix View**: Tasks are automatically categorized into a 2x2 grid based on urgency (due within 3 days) and importance (rating ≥ 7).

- **Dependency Graph Visualization**: Uses Mermaid.js to render a directed graph showing task dependencies. Circular dependencies are detected and flagged.

- **Unit Tests**: Comprehensive test coverage for:
  - Cycle detection (no cycle, simple cycle, complex cycle)
  - Priority scoring (overdue tasks, quick wins)
  - Task sorting behavior
  - Blocking boost calculation

## Future Improvements

Given more time, I would implement:

1. **Configurable Weights**: Allow users to adjust algorithm weights via API parameters or a settings panel.

2. **Date Intelligence**: Consider weekends and holidays when calculating urgency. A task due Monday should feel more urgent on Friday than one due Wednesday.

3. **Learning System**: Track which suggested tasks users actually complete and adjust weights based on feedback patterns.

4. **Task Persistence**: Add full CRUD operations so users can save, update, and delete tasks from the database.

5. **Authentication**: Add user accounts so each person has their own task list.

6. **Real-time Updates**: Use WebSockets to push score updates when task data changes.

## Running Tests

```bash
python manage.py test tasks
```
