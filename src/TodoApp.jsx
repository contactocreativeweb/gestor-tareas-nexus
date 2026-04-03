import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trash2, Clock, CheckCircle2, Circle, Plus, ListTodo, Loader2 } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { db } from './firebase';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

const TASKS_COL = 'tasks';
const META_DOC = 'meta/appState';

const getPriorityDot = (priority) => {
  switch (priority) {
    case 'Baja': return 'bg-emerald-green shadow-[0_0_8px_var(--color-emerald-green)]';
    case 'Media': return 'bg-amber shadow-[0_0_8px_var(--color-amber)]';
    case 'Alta': return 'bg-neon-red shadow-[0_0_8px_var(--color-neon-red)]';
    default: return 'bg-gray-400';
  }
};

// ─── Countdown Component ───────────────────────────────────
const Countdown = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!deadline) { setTimeLeft('Sin límite'); return; }
    const tick = () => {
      const secs = differenceInSeconds(new Date(deadline), new Date());
      if (secs <= 0) { setTimeLeft('¡Tiempo expirado!'); setIsExpired(true); return; }
      const d = Math.floor(secs / 86400);
      const h = Math.floor((secs % 86400) / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setTimeLeft(`${d > 0 ? d + 'd ' : ''}${(h > 0 || d > 0) ? h + 'h ' : ''}${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${isExpired ? 'text-neon-red' : 'text-electric-blue'}`}>
      <Clock size={14} />
      <span className="font-mono tracking-wider">{timeLeft}</span>
    </div>
  );
};

// ─── Task Card ─────────────────────────────────────────────
const TaskItem = ({ task, onDelete, isFocused, onToggleFocus, isAnyFocused, isCurrent, onSetCurrent }) => {
  const glowClass = isFocused
    ? 'ring-2 ring-electric-blue shadow-[0_0_20px_rgba(0,229,255,0.5)]'
    : 'border border-white/10 hover:border-white/20';
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
            <div className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${getPriorityDot(task.priority)}`} title={`Prioridad ${task.priority}`} />
            <div className="flex items-center gap-2 flex-wrap">
              {task.taskNumber && (
                <span className="text-xs font-mono bg-white/10 text-white/70 px-2 py-1 rounded-md">#{task.taskNumber}</span>
              )}
              <h3 className="text-xl font-semibold text-white">{task.title}</h3>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-gray-400 pl-6 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 pl-6 flex-wrap">
            {task.deadline && <Countdown deadline={task.deadline} />}
            {isCurrent && (
              <div className="text-neon-violet text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-ping" />
                Working On It
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => onToggleFocus(task.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${isFocused ? 'bg-electric-blue text-black shadow-[0_0_15px_var(--color-electric-blue)]' : 'bg-white/5 text-gray-400 hover:text-electric-blue hover:bg-white/10'}`}
            title="Focus Mode"
          >
            <Target size={20} />
          </button>
          <button
            onClick={() => onSetCurrent(task.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${isCurrent ? 'text-neon-violet drop-shadow-[0_0_8px_var(--color-neon-violet)]' : 'text-gray-500 hover:text-neon-violet'}`}
            title="Marcar como tarea en progreso"
          >
            {isCurrent ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
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

// ─── Main App ──────────────────────────────────────────────
export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [priority, setPriority] = useState('Media');

  // ── Real-time Firestore listener ──
  useEffect(() => {
    const q = query(collection(db, TASKS_COL), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Load current task state
    getDoc(doc(db, 'meta', 'appState')).then(snap => {
      if (snap.exists()) setCurrentTaskId(snap.data().currentTaskId ?? null);
    });

    return () => unsub();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      title,
      description,
      deadline,
      taskNumber,
      priority,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, TASKS_COL), newTask);
    setTitle(''); setDescription(''); setDeadline(''); setTaskNumber(''); setPriority('Media');
  };

  const handleDelete = async (id) => {
    if (focusedTaskId === id) setFocusedTaskId(null);
    if (currentTaskId === id) await persistCurrentTask(null);
    await deleteDoc(doc(db, TASKS_COL, id));
  };

  const persistCurrentTask = async (id) => {
    setCurrentTaskId(id);
    await setDoc(doc(db, 'meta', 'appState'), { currentTaskId: id }, { merge: true });
  };

  const toggleFocus = (id) => setFocusedTaskId(prev => prev === id ? null : id);
  const toggleCurrent = (id) => persistCurrentTask(currentTaskId === id ? null : id);

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
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="¿Qué necesitas hacer? *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all shadow-inner"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold ml-2">Nº Tarea (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. T-123"
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
                <option value="Baja" className="bg-black">🟢 Baja</option>
                <option value="Media" className="bg-black">🟡 Media</option>
                <option value="Alta" className="bg-black">🔴 Alta</option>
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
        {loading ? (
          <div className="flex justify-center items-center py-16 gap-3 text-gray-500">
            <Loader2 size={28} className="animate-spin text-electric-blue" />
            <span>Cargando tareas...</span>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
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
        )}
      </div>
    </div>
  );
}
