
const API_URL = "https://taskman-service.onrender.com/api/tasks";
const AUTH_HEADER = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 8o5XJovMEGwbhUNzAzcvNpi9CtqVllN7nFAevuLImJA"
};

document.addEventListener('DOMContentLoaded', function() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let todos = [];
    let currentFilter = 'all';

    async function fetchTodos() {
        const response = await fetch(API_URL, { headers: AUTH_HEADER });
        todos = await response.json();
        renderTodos();
    }

    async function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;

        const newTodo = {
            title: text,
            description: `Task: ${text}`,
            dueDate: new Date().toISOString(),
            status: "PENDING",
            priority: 2
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: AUTH_HEADER,
            body: JSON.stringify(newTodo)
        });

        const savedTodo = await response.json();
        todos.push(savedTodo);
        renderTodos();
        todoInput.value = '';
    }

    async function toggleTodo(e) {
        const id = e.target.getAttribute('data-id');
        const todo = todos.find(t => t.id === id);
        const endpoint = `${API_URL}/${id}/${todo.status === 'PENDING' ? 'done' : 'pending'}`;

        await fetch(endpoint, {
            method: "PATCH",
            headers: AUTH_HEADER
        });

        fetchTodos();
    }

    async function deleteTodo(e) {
        const id = e.target.getAttribute('data-id');
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: AUTH_HEADER
        });
        fetchTodos();
    }

    function renderTodos() {
        todoList.innerHTML = '';

        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return todo.status === 'PENDING';
            if (currentFilter === 'completed') return todo.status === 'DONE';
        });

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<div class="empty-state">No todos found</div>';
            return;
        }

        filteredTodos.forEach((todo) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            if (todo.status === 'DONE') li.classList.add('completed');

            li.innerHTML = `
                <input type="checkbox" ${todo.status === 'DONE' ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${todo.title || todo.text || 'Untitled Task'}</span>
                <button class="delete-btn" data-id="${todo.id}">Delete</button>
            `;

            todoList.appendChild(li);
        });

        document.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTodo);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTodo);
        });
    }

    function setFilter(e) {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    }

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', setFilter);
    });

    fetchTodos();
});
