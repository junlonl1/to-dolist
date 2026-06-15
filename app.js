const categories = [
  { id: "A", code: "A", title: "最重要" },
  { id: "B", code: "B", title: "次重要" },
  { id: "C", code: "C", title: "没那么重要" },
  { id: "O", code: "其他", title: "其他事项" },
];

const storageKey = "priority-todos";
const board = document.querySelector("#board");
const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const categorySelect = document.querySelector("#todo-category");
const summary = document.querySelector("#summary");
const columnTemplate = document.querySelector("#column-template");
const todoTemplate = document.querySelector("#todo-template");

let todos = loadTodos();

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(storageKey, JSON.stringify(todos));
}

function render() {
  board.innerHTML = "";

  categories.forEach((category) => {
    const column = columnTemplate.content.firstElementChild.cloneNode(true);
    const list = column.querySelector(".todo-list");
    const categoryTodos = todos.filter((todo) => todo.category === category.id);

    column.dataset.category = category.id;
    column.querySelector(".category-code").textContent = category.code;
    column.querySelector("h2").textContent = category.title;
    column.querySelector(".count").textContent = categoryTodos.length;

    if (categoryTodos.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "暂无事项";
      list.append(empty);
    } else {
      categoryTodos.forEach((todo) => list.append(createTodoElement(todo)));
    }

    board.append(column);
  });

  const total = todos.length;
  const done = todos.filter((todo) => todo.done).length;
  summary.textContent = total === 0 ? "还没有待办" : `${done}/${total} 已完成`;
}

function createTodoElement(todo) {
  const item = todoTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = item.querySelector("input[type='checkbox']");
  const title = item.querySelector(".todo-title");
  const moveSelect = item.querySelector(".move-select");
  const deleteButton = item.querySelector(".delete-button");

  item.classList.toggle("is-done", todo.done);
  checkbox.checked = todo.done;
  title.textContent = todo.title;
  moveSelect.value = todo.category;

  checkbox.addEventListener("change", () => {
    updateTodo(todo.id, { done: checkbox.checked });
  });

  moveSelect.addEventListener("change", () => {
    updateTodo(todo.id, { category: moveSelect.value });
  });

  deleteButton.addEventListener("click", () => {
    todos = todos.filter((item) => item.id !== todo.id);
    saveTodos();
    render();
  });

  return item;
}

function updateTodo(id, patch) {
  todos = todos.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo));
  saveTodos();
  render();
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  todos.unshift({
    id: createId(),
    title,
    category: categorySelect.value,
    done: false,
    createdAt: Date.now(),
  });

  saveTodos();
  form.reset();
  categorySelect.value = "A";
  input.focus();
  render();
});

render();
