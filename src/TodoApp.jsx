import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trash2, Clock, CheckCircle2, Circle, Plus, ListTodo } from 'lucide-react';
import { formatDistanceToNowStrict, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';

// Utility para generar semáforo
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Baja': return 'text-emerald-green drop-shadow-[0_0_5px_var(--color-emerald-green)]';
    case 'Media': return 'text-amber drop-shadow-[0_0_5px_var(--color-amber)]';
    case 'Alta': return 'text-neon-red drop-shadow-[0_0_5px_var(--color-neon-red)]';
    default: return 'text-gray-400';
  }
};

const getPriorityDot = (priority) => {
  switch (priority) {
    case 'Baja': return 'bg-emerald-green shadow-[0_0_8px_var(--color-emerald-green)]';
    case 'Media': return 'bg-amber shadow-[0_0_8px_var(--color-amber)]';
    case 'Alta': return 'bg-neon-red shadow-[0_0_8px_var(--color-neon-red)]';
    default: return 'bg-gray-400';
  }
};

// Componente individual de Tarea
const TaskItem = ({ 
  task, 
  onDelete, 
  isFocused, 
  onToggleFocus, 
  isAnyFocused,
  isCurrent,
  onSetCurrent 
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!task.deadline) {
      setTimeLeft('Sin límite');
      return;
    }

    const interval = setInterval(() => {
      const secondsLeft = differenceInSeconds(new Date(task.deadline), new Date());
      if (secondsLeft <= 0) {
        setTimeLeft('¡Tiempo expirado!');
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const days = Math.floor(secondsLeft / (3600 * 24));
        const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}m ${seconds}s`;
        
        setTimeLeft(timeString);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [task.deadline]);

  const opacityClass = isAnyFocused && !isFocused ? 'opacity-40 scale-95' : 'opacity-100 scale-100';
  const glowClass = isFocused ? 'ring-2 ring-electric-blue shadow-[0_0_20px_rgba(0,229,255,0.5)]' : 'border border-white/10 hover:border-white/20';
  const currentBadgeClass = isCurrent ? 'ring-1 ring-neon-violet shadow-[0_0_10px_rgba(138,43,226,0.3)] bg-neon-violet/10' : '';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isAnyFocused && !isFocused ? 0.4 : 1, y: 0, scale: isAnyFocused && !isFocused ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className={`relative p-5 rounded-3xl bg-white/5 backdrop-blur-md transition-all duration-500 overflow-hidden ${glowClass} ${currentBadgeClass}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 flex flex-col gap-2">
          
          <div className="flex items-center gap-3">
            {/* Semáforo de Urgencia */}
            <div className={`w-3 h-3 rounded-full ${getPriorityDot(task.priority)} flex-shrink-0 animate-pulse`} title={`Prioridad ${task.priority}`} />
            
            <div className="flex items-center gap-2 flex-wrap">
              {task.taskNumber && (
                <span className="text-xs font-mono bg-white/10 text-white/70 px-2 py-1 rounded-md">
                  #{task.taskNumber}
                </span>
              )}
              <h3 className={`text-xl font-semibold text-white ${isExpired ? 'line-through text-white/50' : ''}`}>
                {task.title}
              </h3>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-400 pl-6 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-2 pl-6">
            {task.deadline && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${isExpired ? 'text-neon-red' : 'text-electric-blue'}`}>
                <Clock size={14} />
                <span className="font-mono tracking-wider">{timeLeft}</span>
              </div>
            )}
            {isCurrent && (
              <div className="text-neon-violet text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-ping" />
                Working On It
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {/* Botón Target - Modo Focus */}
          <button 
            onClick={() => onToggleFocus(task.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${isFocused ? 'bg-electric-blue text-black shadow-[0_0_15px_var(--color-electric-blue)]' : 'bg-white/5 text-gray-400 hover:text-electric-blue hover:bg-white/10'}`}
            title="Focus Mode"
          >
            <Target size={20} />
          </button>
          
          {/* Check de Tarea Actual */}
          <button 
            onClick={() => onSetCurrent(task.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${isCurrent ? 'text-neon-violet drop-shadow-[0_0_8px_var(--color-neon-violet)]' : 'text-gray-500 hover:text-neon-violet'}`}
            title="Marcar como tarea en progreso"
          >
            {isCurrent ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>

          {/* Botón Eliminar */}
          <button 
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-xl text-gray-500 hover:text-neon-red hover:bg-neon-red/10 transition-colors"
            title="Eliminar Tarea"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [priority, setPriority] = useState('Media');
  
  const API_URL = 'http://localhost:3000/api/tasks';

  // Obtener datos del Backend
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
        if (data.currentTaskId) setCurrentTaskId(data.currentTaskId);
      })
      .catch(err => console.error('Error fetching tasks API:', err));
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      title,
      description,
      deadline,
      taskNumber,
      priority,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setTasks([newTask, ...tasks]);
    
    // Backend API request
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask })
      });
    } catch (error) {
      console.error('Failed to save to backend:', error);
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setDeadline('');
    setTaskNumber('');
    setPriority('Media');
  };

  const handleDelete = async (id) => {
    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== id));
    if (focusedTaskId === id) setFocusedTaskId(null);
    if (currentTaskId === id) setCurrentTaskId(null);

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete in backend:', error);
    }
  };

  const toggleFocus = (id) => {
    setFocusedTaskId(prev => prev === id ? null : id);
  };

  const toggleCurrent = async (id) => {
    const newCurrentId = currentTaskId === id ? null : id;
    setCurrentTaskId(newCurrentId);

    try {
      await fetch(`${API_URL}/current`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentTaskId: newCurrentId })
      });
    } catch (error) {
      console.error('Failed to set current task in backend:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-12 text-center mt-6">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 tracking-tight flex items-center justify-center gap-4">
          <ListTodo className="text-electric-blue drop-shadow-[0_0_15px_var(--color-electric-blue)]" size={40} />
          Gestor de Tareas
        </h1>
        <p className="text-gray-400 mt-3 font-light tracking-wide">Stay focused. Stay productive.</p>
      </header>

      <form onSubmit={handleAddTask} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-12 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo del form */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div className="md:col-span-2">
            <input 
              type="text" 
              placeholder="¿Qué necesitas hacer? *" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>

          <div className="md:col-span-2">
            <textarea 
              placeholder="Descripción (opcional)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all min-h-[100px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-2">Fecha y Hora Límite</label>
            <input 
              type="datetime-local" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all color-scheme-dark"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-2">Nº Tarea (Opcional)</label>
              <input 
                type="text" 
                placeholder="# Ej. T-123" 
                value={taskNumber}
                onChange={(e) => setTaskNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all"
              />
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-2">Prioridad</label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all appearance-none cursor-pointer"
              >
                <option value="Baja" className="bg-black text-emerald-green">🟢 Baja</option>
                <option value="Media" className="bg-black text-amber">🟡 Media</option>
                <option value="Alta" className="bg-black text-neon-red">🔴 Alta</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 mt-2">
            <button 
              type="submit"
              disabled={!title.trim()}
              className="w-full py-4 rounded-2xl font-bold tracking-wide text-black bg-electric-blue hover:bg-electric-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 group"
            >
              <Plus className="group-hover:rotate-90 transition-transform duration-300" />
              AÑADIR TAREA
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500 flex flex-col items-center gap-4"
            >
              <div className="p-6 rounded-full bg-white/5 border border-white/10">
                <CheckCircle2 size={40} className="text-gray-600" />
              </div>
              <p className="text-lg">Tu mente está despejada. No hay tareas pendientes.</p>
            </motion.div>
          ) : (
            tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onDelete={handleDelete}
                isFocused={focusedTaskId === task.id}
                isAnyFocused={focusedTaskId !== null}
                onToggleFocus={toggleFocus}
                isCurrent={currentTaskId === task.id}
                onSetCurrent={toggleCurrent}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
