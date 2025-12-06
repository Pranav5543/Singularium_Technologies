let tasks = [];let tasks = [];

let lastAnalyzedData = null;

document.addEventListener('DOMContentLoaded', () => {

document.addEventListener('DOMContentLoaded', () => {    const singleTaskForm = document.getElementById('single-task-form');

    const singleTaskForm = document.getElementById('single-task-form');    const bulkInput = document.getElementById('bulk-input');

    const bulkInput = document.getElementById('bulk-input');    const analyzeBtn = document.getElementById('analyze-btn');

    const analyzeBtn = document.getElementById('analyze-btn');    const loadSampleBtn = document.getElementById('load-sample-btn');

    const loadSampleBtn = document.getElementById('load-sample-btn');    const sortStrategy = document.getElementById('sort-strategy');

    const sortStrategy = document.getElementById('sort-strategy');    const resultsContainer = document.getElementById('results-container');

    const resultsContainer = document.getElementById('results-container');

    // Handle Single Task Addition

    singleTaskForm.addEventListener('submit', (e) => {    singleTaskForm.addEventListener('submit', (e) => {

        e.preventDefault();        e.preventDefault();

        const title = document.getElementById('title').value;        const title = document.getElementById('title').value;

        const dueDate = document.getElementById('due_date').value;        const dueDate = document.getElementById('due_date').value;

        const hours = parseInt(document.getElementById('estimated_hours').value);        const hours = parseInt(document.getElementById('estimated_hours').value);

        const importance = parseInt(document.getElementById('importance').value);        const importance = parseInt(document.getElementById('importance').value);

        const depStr = document.getElementById('dependencies').value;        const depStr = document.getElementById('dependencies').value;

                

        const dependencies = depStr         const dependencies = depStr ? depStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];

            ? depStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))         

            : [];        // Generate a temporary ID (simple counter or random)

                const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

        const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

        const newTask = {

        tasks.push({            id,

            id,            title,

            title,            due_date: dueDate,

            due_date: dueDate,            estimated_hours: hours,

            estimated_hours: hours,            importance,

            importance,            dependencies

            dependencies        };

        });

        tasks.push(newTask);

        updateBulkInput();        updateBulkInput();

        singleTaskForm.reset();        singleTaskForm.reset();

    });        // Set default date again if needed

    });

    analyzeBtn.addEventListener('click', async () => {

        try {    // Handle Analyze Button

            const rawData = bulkInput.value;    analyzeBtn.addEventListener('click', async () => {

            if (rawData) {        // Parse bulk input in case user edited it manually

                tasks = JSON.parse(rawData);        try {

            }            const rawData = bulkInput.value;

        } catch (e) {            if (rawData) {

            alert("Invalid JSON in bulk input!");                tasks = JSON.parse(rawData);

            return;            }

        }        } catch (e) {

            alert("Invalid JSON in bulk input!");

        if (tasks.length === 0) {            return;

            alert("No tasks to analyze!");        }

            return;

        }        if (tasks.length === 0) {

            alert("No tasks to analyze!");

        try {            return;

            const response = await fetch('/api/tasks/analyze/', {        }

                method: 'POST',

                headers: { 'Content-Type': 'application/json' },        // Call API

                body: JSON.stringify(tasks)        try {

            });            const response = await fetch('/api/tasks/analyze/', {

                method: 'POST',

            const data = await response.json();                headers: {

                    'Content-Type': 'application/json'

            if (response.ok) {                },

                renderTasks(data);                body: JSON.stringify(tasks)

            } else {            });

                alert("Error: " + (data.error || JSON.stringify(data)));

            }            const data = await response.json();

        } catch (e) {

            console.error(e);            if (response.ok) {

            alert("Network error!");                renderTasks(data);

        }            } else {

    });                alert("Error: " + (data.error || JSON.stringify(data)));

            }

    loadSampleBtn.addEventListener('click', () => {        } catch (e) {

        const today = new Date().toISOString().split('T')[0];            console.error(e);

        tasks = [            alert("Network error!");

            { id: 1, title: "Fix Critical Bug", due_date: today, estimated_hours: 4, importance: 10, dependencies: [] },        }

            { id: 2, title: "Write Documentation", due_date: "2025-12-01", estimated_hours: 2, importance: 6, dependencies: [1] },    });

            { id: 3, title: "Update Dependencies", due_date: "2025-11-30", estimated_hours: 1, importance: 4, dependencies: [] },

            { id: 4, title: "Plan Q1 Roadmap", due_date: "2025-12-10", estimated_hours: 8, importance: 9, dependencies: [] }    // Handle Load Sample

        ];    loadSampleBtn.addEventListener('click', () => {

        updateBulkInput();        const today = new Date().toISOString().split('T')[0];

    });        const sampleTasks = [

            { id: 1, title: "Fix Critical Bug", due_date: today, estimated_hours: 4, importance: 10, dependencies: [] },

    sortStrategy.addEventListener('change', () => {            { id: 2, title: "Write Documentation", due_date: "2025-12-01", estimated_hours: 2, importance: 6, dependencies: [1] },

        if (lastAnalyzedData) {            { id: 3, title: "Update Dependencies", due_date: "2025-11-30", estimated_hours: 1, importance: 4, dependencies: [] },

            renderTasks(lastAnalyzedData);            { id: 4, title: "Plan Q1 Roadmap", due_date: "2025-12-10", estimated_hours: 8, importance: 9, dependencies: [] }

        }        ];

    });        tasks = sampleTasks;

        updateBulkInput();

    function updateBulkInput() {    });

        bulkInput.value = JSON.stringify(tasks, null, 2);    

    }    // Handle Sort Strategy Change (Client-side re-sort for responsiveness)

    sortStrategy.addEventListener('change', () => {

    function renderTasks(data) {        // We need the analyzed data to resort properly if we want to use scores.

        lastAnalyzedData = data;        // But if we change strategy, we might want to re-analyze with different weights?

        resultsContainer.innerHTML = '';        // For this assignment, let's just re-sort the *already analyzed* list if possible, 

                // OR just trigger the analyze button again if the backend handled strategies.

        const strategy = sortStrategy.value;        // Since the backend currently only has one "Smart" strategy, we can implement 

        let sortedData = [...data];        // the other simple strategies client-side or just re-request.

                

        switch(strategy) {        // Let's trigger the analyze button to refresh (simpler) 

            case 'fastest':        // BUT wait, the backend returns the "Smart" score. 

                sortedData.sort((a, b) => a.estimated_hours - b.estimated_hours);        // If we want "Fastest Wins", we should sort by estimated_hours ascending.

                break;        // If "High Impact", sort by importance descending.

            case 'impact':        // If "Deadline", sort by due_date ascending.

                sortedData.sort((a, b) => b.importance - a.importance);        

                break;        // So we can just sort the DOM elements or re-render if we stored the last result.

            case 'deadline':        // Let's store last result.

                sortedData.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));        if (window.lastAnalyzedData) {

                break;            renderTasks(window.lastAnalyzedData);

            default:        }

                sortedData.sort((a, b) => b.priority_score - a.priority_score);    });

        }

    function updateBulkInput() {

        sortedData.forEach(task => {        bulkInput.value = JSON.stringify(tasks, null, 2);

            const card = document.createElement('div');    }

            card.className = `task-card priority-${getPriorityClass(task.priority_score)}`;

                function renderTasks(data) {

            card.innerHTML = `        window.lastAnalyzedData = data; // Store for re-sorting

                <div class="score-badge">${Math.round(task.priority_score)}</div>        resultsContainer.innerHTML = '';

                <div class="task-title">${task.title}</div>        

                <div class="task-meta">        const strategy = sortStrategy.value;

                    <span>📅 ${task.due_date}</span>        let sortedData = [...data];

                    <span>⏱ ${task.estimated_hours}h</span>        

                    <span>⭐ ${task.importance}/10</span>        if (strategy === 'fastest') {

                </div>            sortedData.sort((a, b) => a.estimated_hours - b.estimated_hours);

                <div class="task-explanation">${task.explanation}</div>        } else if (strategy === 'impact') {

            `;            sortedData.sort((a, b) => b.importance - a.importance);

            resultsContainer.appendChild(card);        } else if (strategy === 'deadline') {

        });            sortedData.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

        } else {

        renderVisualizations(data);            // Smart Balance (Default) - already sorted by backend score

    }            sortedData.sort((a, b) => b.priority_score - a.priority_score);

        }

    function getPriorityClass(score) {

        if (score >= 40) return 'high';        sortedData.forEach(task => {

        if (score >= 20) return 'medium';            const card = document.createElement('div');

        return 'low';            card.className = `task-card priority-${getPriorityClass(task.priority_score)}`;

    }            

            card.innerHTML = `

    function renderVisualizations(tasks) {                <div class="score-badge">${Math.round(task.priority_score)}</div>

        const q1 = document.getElementById('matrix-q1');                <div class="task-title">${task.title}</div>

        const q2 = document.getElementById('matrix-q2');                <div class="task-meta">

        const q3 = document.getElementById('matrix-q3');                    <span>📅 ${task.due_date}</span>

        const q4 = document.getElementById('matrix-q4');                    <span>⏱ ${task.estimated_hours}h</span>

                            <span>⭐ ${task.importance}/10</span>

        [q1, q2, q3, q4].forEach(el => el.innerHTML = '');                </div>

                        <div class="task-explanation">

        const today = new Date();                    ${task.explanation}

                        </div>

        tasks.forEach(task => {            `;

            const dueDate = new Date(task.due_date);            resultsContainer.appendChild(card);

            const daysUntil = (dueDate - today) / (1000 * 60 * 60 * 24);        });

            const isUrgent = daysUntil <= 3;

            const isImportant = task.importance >= 7;        renderVisualizations(data);

                }

            const el = document.createElement('div');

            el.className = 'mini-task';    function getPriorityClass(score) {

            el.textContent = task.title;        if (score >= 40) return 'high';

            el.title = task.title;        if (score >= 20) return 'medium';

                    return 'low';

            if (isUrgent && isImportant) q1.appendChild(el);    }

            else if (!isUrgent && isImportant) q2.appendChild(el);

            else if (isUrgent && !isImportant) q3.appendChild(el);    function renderVisualizations(tasks) {

            else q4.appendChild(el);        // 1. Eisenhower Matrix

        });        const q1 = document.getElementById('matrix-q1');

                const q2 = document.getElementById('matrix-q2');

        const graphContainer = document.getElementById('dependency-graph');        const q3 = document.getElementById('matrix-q3');

        let mermaidDef = "graph TD;\n";        const q4 = document.getElementById('matrix-q4');

        let hasEdges = false;        

                [q1, q2, q3, q4].forEach(el => el.innerHTML = '');

        tasks.forEach(task => {        

            const safeId = `t${task.id}`;        const today = new Date();

            const safeTitle = task.title.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 15);        

            mermaidDef += `${safeId}["${safeTitle}"];\n`;        tasks.forEach(task => {

                        const dueDate = new Date(task.due_date);

            if (task.dependencies && task.dependencies.length > 0) {            const daysUntil = (dueDate - today) / (1000 * 60 * 60 * 24);

                task.dependencies.forEach(depId => {            const isUrgent = daysUntil <= 3; // Due within 3 days

                    mermaidDef += `t${depId} --> ${safeId};\n`;            const isImportant = task.importance >= 7;

                    hasEdges = true;            

                });            const el = document.createElement('div');

            }            el.className = 'mini-task';

        });            el.textContent = task.title;

                    el.title = task.title;

        if (!hasEdges && tasks.length > 0) {            

            mermaidDef += `style t${tasks[0].id} fill:#333;\n`;            if (isUrgent && isImportant) q1.appendChild(el);

        }            else if (!isUrgent && isImportant) q2.appendChild(el);

            else if (isUrgent && !isImportant) q3.appendChild(el);

        graphContainer.innerHTML = mermaidDef;            else q4.appendChild(el);

        graphContainer.removeAttribute('data-processed');        });

        mermaid.init(undefined, graphContainer);        

    }        // 2. Dependency Graph (Mermaid)

});        const graphContainer = document.getElementById('dependency-graph');

        let mermaidDef = "graph TD;\n";
        let hasEdges = false;
        
        tasks.forEach(task => {
            // Sanitize title for ID
            const safeId = `t${task.id}`;
            const safeTitle = task.title.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 15);
            mermaidDef += `${safeId}["${safeTitle}"];\n`;
            
            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach(depId => {
                    // Find if dep exists in our list (it might be a partial list)
                    // If we just use IDs, mermaid handles it
                    mermaidDef += `t${depId} --> ${safeId};\n`;
                    hasEdges = true;
                });
            }
        });
        
        if (!hasEdges && tasks.length > 0) {
             mermaidDef += `style t${tasks[0].id} fill:#333;\n`; // Just to have something valid
        }

        graphContainer.innerHTML = mermaidDef;
        graphContainer.removeAttribute('data-processed'); // Reset mermaid
        mermaid.init(undefined, graphContainer);
    }
});
