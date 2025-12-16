<script lang="ts">
    import type { EventHandler } from "svelte/elements";

  type Todo = {
    id: number;
    task: string;
    completed: boolean;
    onFocus: boolean;
    priority: number;
  }

  const todos = $state<Todo[]>([]);

  const random_tasks = ["Example 1", "Example 2", "Example 3", "Example 4"];
  const selected_placeholder = $derived.by(() => {
    const i = Math.floor(Math.random() * random_tasks.length);
    return random_tasks[i];
  })

  function submit(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
    e.preventDefault();

    const new_todo: Todo = {
      id: todos.length + 1,
      task: e.currentTarget.todo.value,
      completed: false,
      onFocus: false,
      priority: 0
    };
    todos.push(new_todo);

    // TODO: Save, calculate priority & order by priority.

    // Reset form as last step.
    e.currentTarget.reset();
  }
</script>

<main>
  <section>
    <h1>Smart To-do</h1>
  </section>
  <section>
    <div class="">
      <form onsubmit={submit}>
        <input type="text" name="todo" placeholder={selected_placeholder}>
        <button type="submit">Add Todo</button>
      </form>
    </div>
  </section>
  <section>
    <ul>
      {#each todos as todo}
        <li>
          {todo.id} | {todo.completed} | {todo.task}
        </li>
      {/each}
    </ul>
  </section>
</main>