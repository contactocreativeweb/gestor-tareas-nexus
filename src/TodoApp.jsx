import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trash2, Clock, CheckCircle2, Circle, Plus, ListTodo, Loader2, LogOut, User, Mail, Lock, X } from 'lucide-react';
import { differenceInSeconds } from 'date-fns';
import { db, auth } from './firebase';
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
  orderBy,
  where
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  GitBranch, 
  Share2, 
  Smartphone, 
  Apple, 
  Copy, 
  Moon, 
  Sun, 
  Monitor, 
  Download,
  Info
} from 'lucide-react';

// ─── Theme Toggle Component ──────────────────────────────────
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-electric-blue/30 transition-all group shadow-lg glass-card"
      title={isDark ? "Modo Claro" : "Modo Oscuro"}
    >
      {isDark ? (
        <Sun className="text-amber group-hover:scale-110 transition-transform" size={20} />
      ) : (
        <Moon className="text-electric-blue group-hover:scale-110 transition-transform" size={20} />
      )}
    </button>
  );
};

// ─── PWA Installer Component ────────────────────────────────
const PwaInstaller = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState('android');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else {
      setPlatform('android');
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Enlace copiado al portapapeles');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nexus Task Manager',
          text: 'Gestiona tus tareas de forma eficiente con Nexus.',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error al compartir', err);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full mb-8">
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button
          onClick={handleInstall}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-electric-blue text-black font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-all outline outline-1 outline-electric-blue/50"
        >
          <Download size={18} />
          Instalar App
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-lg"
          title="Compartir App"
        >
          <GitBranch size={18} />
          Compartir
        </button>
      </div>

      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-md overflow-hidden"
          >
            <div className="p-6 rounded-3xl glass-card border-electric-blue/20 bg-electric-blue/5">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                {platform === 'ios' ? <Apple size={20} /> : <Smartphone size={20} />}
                Pasos para Instalar
              </h4>
              
              <div className="space-y-4">
                {platform === 'ios' ? (
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">1</span>
                      <p>Abre este enlace en <span className="font-bold text-electric-blue">Safari</span></p>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">2</span>
                      <p>Toca el icono de <span className="font-bold">Compartir</span> (flecha arriba)</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">3</span>
                      <p>Selecciona <span className="font-bold">"Agregar a inicio"</span></p>
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">1</span>
                      <p>Abre este enlace en <span className="font-bold text-electric-blue">Chrome</span></p>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">2</span>
                      <p>Toca los tres puntos <span className="font-bold text-xl leading-none">⋮</span> del navegador</p>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-electric-blue/20 border border-electric-blue/50 flex items-center justify-center text-xs font-bold text-electric-blue flex-shrink-0">3</span>
                      <p>Selecciona <span className="font-bold">"Agregar a la pantalla principal"</span></p>
                    </li>
                  </ul>
                )}
                
                <div className="pt-4 border-t border-electric-blue/30 flex flex-col gap-3">
                  <p className="text-xs text-center font-bold text-electric-blue">Copia este enlace y ábrelo en tu navegador:</p>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      readOnly 
                      value={window.location.href} 
                      className="flex-1 bg-black/10 dark:bg-black/40 border border-electric-blue/50 rounded-xl px-3 py-2.5 text-xs font-mono truncate focus:outline-none focus:border-electric-blue" 
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-2.5 flex-shrink-0 flex items-center justify-center gap-2 rounded-xl bg-electric-blue text-black hover:bg-electric-blue-hover text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
                    >
                      <Copy size={16} /> COPIAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const getPriorityDot = (priority) => {
  switch (priority) {
    case 'Baja': return 'bg-emerald-green shadow-[0_0_8px_var(--color-emerald-green)]';
    case 'Media': return 'bg-amber shadow-[0_0_8px_var(--color-amber)]';
    case 'Alta': return 'bg-neon-red shadow-[0_0_8px_var(--color-neon-red)]';
    default: return 'bg-gray-400';
  }
};

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
      className={`relative p-5 rounded-3xl glass-card transition-all duration-500 overflow-hidden ${glowClass} ${currentBadgeClass}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 animate-pulse ${getPriorityDot(task.priority)}`} title={`Prioridad ${task.priority}`} />
            <div className="flex items-center gap-2 flex-wrap">
              {task.taskNumber && (
                <span className="text-xs font-mono bg-electric-blue/10 text-electric-blue/70 px-2 py-1 rounded-md">#{task.taskNumber}</span>
              )}
              <h3 className="text-xl font-semibold dark:text-white text-slate-800">{task.title}</h3>
            </div>
          </div>
          {task.description && (
            <p className="text-sm dark:text-gray-400 text-slate-500 pl-6 leading-relaxed">{task.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 pl-6 flex-wrap">
            {task.deadline && <Countdown deadline={task.deadline} />}
            {isCurrent && (
              <div className="text-neon-violet text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-ping" />
                Trabajando en ello
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => onToggleFocus(task.id)}
            className={`p-2 rounded-xl transition-all duration-300 ${isFocused ? 'bg-electric-blue text-black shadow-[0_0_15px_var(--color-electric-blue)]' : 'bg-white/5 text-gray-400 hover:text-electric-blue hover:bg-white/10'}`}
            title="Modo Focus"
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

// ─── Auth Modal Component ───────────────────────────────────
const AuthModal = ({ onClose, onAuthSuccess }) => {
  // ... (unchanged)
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      if (err.message.includes('auth/invalid-credential')) setError('Credenciales inválidas');
      else if (err.message.includes('auth/email-already-in-use')) setError('El correo ya está registrado');
      else if (err.message.includes('auth/weak-password')) setError('La contraseña es muy débil');
      else setError("Error al autenticar. Revisa tus datos.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (type) => {
    const provider = type === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      onAuthSuccess();
    } catch (err) {
      setError(`Error al conectar con ${type === 'google' ? 'Google' : 'Facebook'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="max-w-md w-full p-8 rounded-3xl glass-card relative overflow-hidden" >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/20 rounded-full blur-[80px] pointer-events-none" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={24} /></button>
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-electric-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-electric-blue/20"><User className="text-electric-blue" size={32} /></div>
          <h2 className="text-3xl font-black">{isLogin ? 'Iniciar Sesión' : 'Crea tu Cuenta'}</h2>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Regístrate para guardar y sincronizar tus tareas</p>
        </div>
        <div className="space-y-3 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => signInWithProvider('google')} type="button" className="py-3.5 rounded-2xl font-bold bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><GoogleIcon /> GOOGLE</button>
            <button onClick={() => signInWithProvider('facebook')} type="button" className="py-3.5 rounded-2xl font-bold bg-[#1877F2] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"><FacebookIcon /> FACEBOOK</button>
          </div>
          <div className="flex items-center gap-4 py-2"><div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" /><span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">O utiliza tu correo</span><div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" /></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5"><label className="text-xs text-slate-400 uppercase tracking-widest font-bold ml-2">Correo Electrónico</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all" required /></div>
            </div>
            <div className="space-y-1.5"><label className="text-xs text-slate-400 uppercase tracking-widest font-bold ml-2">Contraseña</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all" required /></div>
            </div>
            {error && <p className="text-neon-red text-sm text-center font-medium bg-neon-red/10 py-2 rounded-xl">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold bg-electric-blue text-black hover:bg-electric-blue-hover transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 group disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'ENTRAR' : 'REGISTRARME')}</button>
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors py-2">{isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────
export default function TodoApp() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Nuevo estado para feedback de guardado
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [taskNumber, setTaskNumber] = useState('');
  const [priority, setPriority] = useState('Media');

  // ── Auth Listener ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Real-time Firestore listener ──
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, TASKS_COL), 
      where('userId', '==', user.uid), 
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, 
      (snapshot) => {
        setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Listener Error:", error);
        // Si el índice sigue construyéndose, o si hay un error, lo registramos.
        // onSnapshot suele reintentar automáticamente al recuperar conexión.
      }
    );

    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setCurrentTaskId(snap.data().currentTaskId ?? null);
    });

    return () => unsub();
  }, [user]);

  const handleAddTask = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setSaving(true);

    const newTask = {
      userId: user.uid,
      title,
      description,
      deadline,
      taskNumber,
      priority,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, TASKS_COL), newTask);
      
      // Delay de 2 segundos solicitado para asegurar visibilidad tras construcción de índice
      setTimeout(() => {
        setTitle(''); 
        setDescription(''); 
        setDeadline(''); 
        setTaskNumber(''); 
        setPriority('Media');
        setSaving(false);
      }, 2000);

    } catch (err) {
      console.error("Error adding task:", err);
      setSaving(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  // Guardado automático tras login
  useEffect(() => {
    if (user && title.trim() && showAuthModal === false) {
      handleAddTask();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!user) return;
    if (focusedTaskId === id) setFocusedTaskId(null);
    if (currentTaskId === id) await persistCurrentTask(null);
    await deleteDoc(doc(db, TASKS_COL, id));
  };

  const persistCurrentTask = async (id) => {
    if (!user) return;
    setCurrentTaskId(id);
    await setDoc(doc(db, 'users', user.uid), { currentTaskId: id }, { merge: true });
  };

  const toggleFocus = (id) => setFocusedTaskId(prev => prev === id ? null : id);
  const toggleCurrent = (id) => persistCurrentTask(currentTaskId === id ? null : id);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-electric-blue" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen relative">
      <AnimatePresence>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4 mb-8">
        <ThemeToggle />
        <div className="z-50">
          {user ? (
            <div className="flex items-center gap-3 glass-card rounded-2xl p-1.5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User className="text-electric-blue" size={18} />}
              </div>
              <div className="hidden sm:block px-2">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">CONECTADO</p>
                <p className="text-xs dark:text-white text-slate-800 font-bold leading-none max-w-[150px] truncate">{user.displayName || user.email.split('@')[0]}</p>
              </div>
              <button onClick={() => signOut(auth)} className="p-2.5 rounded-xl text-gray-500 hover:text-neon-red hover:bg-neon-red/10 transition-all border border-transparent hover:border-neon-red/20" title="Cerrar Sesión">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5 text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-electric-blue transition-all">
              <User size={16} /> ACCEDER
            </button>
          )}
        </div>
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight flex items-center justify-center gap-4">
          <ListTodo className="text-electric-blue drop-shadow-[0_0_15px_var(--color-electric-blue)]" size={40} />
          Nexus
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-3 font-light tracking-wide">Mantén el enfoque. Sé productivo.</p>
      </header>

      <PwaInstaller />

      <form onSubmit={handleAddTask} className="glass-card rounded-3xl p-6 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div className="md:col-span-2">
            <input type="text" placeholder="¿Qué necesitas hacer? *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 dark:text-white text-slate-800 text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all" required />
          </div>
          <div className="md:col-span-2">
            <textarea placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 dark:text-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all min-h-[100px] resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 dark:text-gray-400 uppercase tracking-wider font-semibold ml-2">Fecha y Hora Límite</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 dark:text-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 dark:text-gray-400 uppercase tracking-wider font-semibold ml-2">Nº Tarea (Opcional)</label>
              <input type="text" placeholder="Ej. T-123" value={taskNumber} onChange={(e) => setTaskNumber(e.target.value)} className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 dark:text-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 dark:text-gray-400 uppercase tracking-wider font-semibold ml-2">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 dark:text-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all appearance-none cursor-pointer">
                <option value="Baja" className="dark:bg-black bg-white">🟢 Baja</option>
                <option value="Media" className="dark:bg-black bg-white">🟡 Media</option>
                <option value="Alta" className="dark:bg-black bg-white">🔴 Alta</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2 mt-2">
            <button 
              type="submit" 
              disabled={!title.trim() || saving} 
              className="w-full py-4 rounded-2xl font-bold tracking-wide text-black bg-electric-blue hover:bg-electric-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 group"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  GUARDANDO TAREA...
                </>
              ) : (
                <>
                  <Plus className="group-hover:rotate-90 transition-transform duration-300" />
                  AÑADIR TAREA
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {loading && user ? (
          <div className="flex justify-center items-center py-16 gap-3 text-gray-500">
            <Loader2 size={28} className="animate-spin text-electric-blue" />
            <span>Cargando tus tareas...</span>
          </div>
        ) : (
          <AnimatePresence>
            {!user || (tasks.length === 0 && !saving) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500 flex flex-col items-center gap-4">
                <div className="p-6 rounded-full bg-white/5 border border-white/10">
                  <CheckCircle2 size={40} className="text-gray-600" />
                </div>
                <p className="text-lg">Tus tareas aparecerán aquí cuando las guardes.</p>
              </motion.div>
            ) : (
              tasks.map(task => (
                <TaskItem key={task.id} task={task} onDelete={handleDelete} isFocused={focusedTaskId === task.id} isAnyFocused={focusedTaskId !== null} onToggleFocus={toggleFocus} isCurrent={currentTaskId === task.id} onSetCurrent={toggleCurrent} />
              ))
            )}
          </AnimatePresence>
        )}
      </div>
      <footer className="mt-20 py-8 border-t border-slate-200 dark:border-white/10 text-center">
        <p className="text-slate-500 dark:text-gray-500 text-sm font-medium">
          © Creativeweb IA 2026 - Todos los Derechos Reservados
        </p>
      </footer>
    </div>
  );
}
