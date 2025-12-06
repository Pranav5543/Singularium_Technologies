from datetime import date, datetime


def detect_cycles(tasks_data):
    adj = {t['id']: t.get('dependencies', []) for t in tasks_data}
    visited = set()
    rec_stack = set()

    def dfs(node):
        visited.add(node)
        rec_stack.add(node)
        for neighbor in adj.get(node, []):
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        rec_stack.remove(node)
        return False

    for task_id in adj:
        if task_id not in visited:
            if dfs(task_id):
                return True
    return False


def calculate_priority_score(task):
    score = 0
    explanation = []

    today = date.today()
    due_date = task['due_date']
    if isinstance(due_date, str):
        due_date = datetime.strptime(due_date, "%Y-%m-%d").date()

    delta = (due_date - today).days

    if delta < 0:
        score += 50
        explanation.append("Overdue! Immediate attention required.")
    elif delta == 0:
        score += 30
        explanation.append("Due today.")
    else:
        urgency_score = max(0, (10 - delta)) * 2
        score += urgency_score
        if urgency_score > 0:
            explanation.append(f"Due in {delta} days.")

    imp = task.get('importance', 5)
    score += imp * 2
    explanation.append(f"Importance level {imp}.")

    hours = task.get('estimated_hours', 1)
    if hours <= 2:
        score += 15
        explanation.append("Quick win (< 2 hours).")
    elif hours <= 5:
        score += 5

    return {"score": score, "explanation": " ".join(explanation)}


def analyze_tasks(tasks_list):
    indexed_tasks = {}
    for i, t in enumerate(tasks_list):
        if 'id' not in t:
            t['id'] = i + 1
        tid = t['id']
        t['temp_id'] = tid
        indexed_tasks[tid] = t

    if detect_cycles(tasks_list):
        return {"error": "Circular dependency detected!"}

    results = []
    block_counts = {tid: 0 for tid in indexed_tasks}
    
    for t in tasks_list:
        for dep_id in t.get('dependencies', []):
            if dep_id in block_counts:
                block_counts[dep_id] += 1

    for t in tasks_list:
        analysis = calculate_priority_score(t)
        final_score = analysis['score']

        blocked_count = block_counts.get(t['temp_id'], 0)
        if blocked_count > 0:
            final_score += blocked_count * 5
            analysis['explanation'] += f" Blocks {blocked_count} other task(s)."

        t['priority_score'] = final_score
        t['explanation'] = analysis['explanation']
        results.append(t)

    results.sort(key=lambda x: x['priority_score'], reverse=True)
    return results
