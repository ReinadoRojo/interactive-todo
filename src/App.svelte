<script lang="ts">
  import { createTodosStore, type Todo } from "./lib/todos";
  import { mountTabs } from './lib/tabs';
  import { onMount } from "svelte";

  import type { LayersModel } from "@tensorflow/tfjs";
  import { suggestPriority, trainModel, use } from "./lib/ai";

  // Store for todos
  const todos = createTodosStore();

  // AI model & encoder
  let model: LayersModel | null = null;
  let encoder: use.UniversalSentenceEncoder | null = null;

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
    const data = formData.get("data")?.toString().trim();

    if (!task) return;
    // TODO: Save, calculate priority & order by priority.

    if (!model || !encoder) {
      console.warn("Model or encoder not loaded yet");
      return;
    }
    
    // Suggest priority
    let _priority = 0;
    
    suggestPriority(model, encoder, task, 0.5)
      .then((priority) => {
        console.log(`"AI ended task=${task} priority=${priority}"`);
        // _priority = priority;
      })
      .catch((err) => {
        console.error("Error suggesting priority:", err);
      });
    
    // To-do data (for edits)
    
    const existingTodo = data ? JSON.parse(data) as Todo : null;

    if (existingTodo) {
      todos.updateTodo(existingTodo.id, { task });

      e.currentTarget.reset();
      return;
    }

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

  onMount(async () => {
    mountTabs();
    const _encoder = await use.load();
    trainModel(_encoder).then((_model) => {
      console.log("Model trained");
      model = _model;
    });

    encoder = _encoder;
  })

  function edit(todo: Todo) {
    const inputEl = document.querySelector<HTMLInputElement>("input[name='todo']");
    const dataEl = document.querySelector<HTMLInputElement>("input[name='data']");

    if (!inputEl || !dataEl) return;

    inputEl.value = todo.task;
    dataEl.value = JSON.stringify(todo);

    inputEl.focus();
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

  function completeTodo(todo: Todo, completed: boolean) {
    todos.updateTodo(todo.id, { completed });
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
        <input type="hidden" name="data" value="">
      </form>
    </div>
    <div id="input-explain" data-tab="explain" class="hidden">
      <form onsubmit={() => {}}>
        <textarea name="explanation"></textarea>
        <button type="submit">Create Todo</button>
      </form>
    </div>
  </section>
  <section id="todos-section">
    <ul>
      {#each $todos as todo}
        <label for={`todo-${todo.id}`} class="todo" class:completed={todo.completed} data-id={todo.id} data-focused={todo.onFocus}>
          <div id="visuals">
            <input type="checkbox" bind:checked={todo.completed} id={`todo-${todo.id}`} onchange={(e) => {
              completeTodo(todo, e.currentTarget.checked);
            }}/>
            <span class:completed={todo.completed}>{todo.task}</span>
          </div>
          <div id="actions">
            <button onclick={() => edit(todo)} title="Edit Todo" disabled={todo.completed}>E</button>
            <button onclick={() => deleteTodo(todo)} title="Delete Todo" disabled={todo.completed}>D</button>
            <button onclick={() => focusTodo(todo)} title="Focus Todo" disabled={todo.completed}>F</button>
          </div>
        </label>
      {/each}
    </ul>
  </section>
  <section>
    <div id="loss-cont"></div>
  </section>
</main>