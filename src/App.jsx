import React from 'react';
import TodoApp from './TodoApp';

function App() {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-primary)] dark:bg-slate-950 overflow-x-hidden selection:bg-electric-blue selection:text-black text-[var(--text-primary)] transition-colors duration-400">
      <TodoApp />
    </div>
  );
}

export default App;
