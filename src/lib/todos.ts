import { writable } from "svelte/store";

export type Todo = {
    id: number;
    task: string;
    completed: boolean;
    onFocus: boolean;
    priority: number;
}

export function createTodosStore() {
    const { subscribe, set, update } = writable<Todo[]>([]);

    return {
        subscribe,
        addTodo: (todo: Todo) => update(t => ([...t, todo])),
        removeTodo: (id: number) => update(t => t.filter(todo => todo.id !== id)),
        toggleComplete: (id: number) => update(t => t.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
        setFocus: (id: number, focus: boolean) => update(t => t.map(todo => todo.id === id ? { ...todo, onFocus: focus } : todo)),
        setPriority: (id: number, priority: number) => update(t => t.map(todo => todo.id === id ? { ...todo, priority } : todo)),
        clear: () => set([]),
        updateTodo: (id: number, newTodoObject: Partial<Todo>) => update(t => t.map(todo => todo.id === id ? { ...todo, ...newTodoObject } : todo)),
    }
}