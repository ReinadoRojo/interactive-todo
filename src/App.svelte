<script lang="ts">
  import { createTodosStore, type Todo } from "./lib/todos";
  import { mountTabs } from './lib/tabs';
  import { onMount } from "svelte";

  // Store for todos
  const todos = createTodosStore();

  // Random placeholder
  const random_tasks = ["Example 1", "Example 2", "Example 3", "Example 4"];
  const selected_placeholder = $derived.by(() => {
    const i = Math.floor(Math.random() * random_tasks.length);
    return random_tasks[i];
  })

  // Submit handler
  function submit(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const task = formData.get("todo")?.toString().trim();
    if (!task) return;
    // TODO: Save, calculate priority & order by priority.
    
    todos.addTodo({
      id: new Date().getTime(),
      task,
      completed: false,
      onFocus: false,
      priority: 0,
    });
    // Reset form as last step.
    e.currentTarget.reset();
  }

  function explainSubmit(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const explanation = formData.get("explanation")?.toString().trim();
    if (!explanation) return;
  }

  onMount(() => {
    mountTabs();
  })

  function edit(todo: Todo) {
    // TODO: move todo info to the input section
  }
  function deleteTodo(todo: Todo) {
    todos.removeTodo(todo.id);
    console.log("Deleted todo:", todo);
  }
  function focusTodo(todo: Todo) {
    todos.setFocus(todo.id, !todo.onFocus);

    document.body.dataset.focus = !todo.onFocus ? "true" : "false";
    
    const todoEl = document.querySelector<HTMLDivElement>("div[class='todo'][data-id='" + todo.id + "']");

    if(!todoEl) {
      return;
    }
    
    // Set focus styles
    todoEl.dataset.focused = todo.onFocus ? "true" : "false";

    // Scroll to the todo
    todoEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
</script>

<main>
  <section id="header-section">
    <h1>🧠 Smart To-do</h1>
  </section>
  <section id="input-section">
    <header id="input-header">
      <button data-selected="true" data-tab-button="add" class="tab-button">Add a to-do</button>
      <button data-selected="false" data-tab-button="explain" class="tab-button">Explain & create a to-do</button>
    </header>
    <div id="input-todo" data-tab="add">
      <form onsubmit={submit}>
        <input type="text" name="todo" placeholder={selected_placeholder}>
        <button type="submit">Add Todo</button>
      </form>
    </div>
    <div id="input-explain" data-tab="explain" class="hidden">
      <form onsubmit={explainSubmit}>
        <textarea name="explanation"></textarea>
        <button type="submit">Create Todo</button>
      </form>
    </div>
  </section>
  <section id="todos-section">
    <ul>
      {#each $todos as todo}
        <div class="todo" data-id={todo.id} data-focused={todo.onFocus}>
          <div id="visuals">
            <input type="checkbox" bind:checked={todo.completed} id={`todo-${todo.id}`} />
            <label for={`todo-${todo.id}`}>
              <span class:completed={todo.completed}>{todo.task}</span>
            </label>
          </div>
          <div id="actions">
            <button onclick={() => edit(todo)}>E</button>
            <button onclick={() => deleteTodo(todo)}>D</button>
            <button onclick={() => focusTodo(todo)}>F</button>
          </div>
        </div>
      {/each}
    </ul>
  </section>
</main>