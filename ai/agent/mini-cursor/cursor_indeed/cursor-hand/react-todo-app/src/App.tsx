import React, { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  edited?: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✨ Todo List</h1>
          <p className="text-gray-600">Organize your tasks with style</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={addTodo}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Completed
            </button>
          </div>

          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">No tasks found. Add one above!</p>
            ) : (
              filteredTodos.map(todo => (
                <div
                  key={todo.id}
                  className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} hover:shadow-md`}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3 cursor-pointer"
                  />
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span
                        className={`block ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                      >
                        {todo.text}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 ml-2">
                    {editingId !== todo.id && (
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        aria-label="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600 flex justify-between items-center">
            <span>
              {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
            </span>
            {todos.length > 0 && (
              <button
                onClick={() => setTodos(todos.filter(todo => !todo.completed))}
                className="text-blue-600 hover:underline"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm">
          <p>Drag and drop to reorder list</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
