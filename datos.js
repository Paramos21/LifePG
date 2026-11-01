// LISTA DE HÁBITOS (P1 - P6)
const habits = [
  { id: 'h1', tag: 'P1', title: 'Estudiar Ingeniería', desc: '45-60 min', xp: 60, icon: 'fa-graduation-cap' },
  { id: 'h2', tag: 'P2', title: 'Trabajo Online', desc: 'Cumplir meta/jornada', xp: 50, icon: 'fa-laptop-code' },
  { id: 'h3', tag: 'P3', title: 'Aseo (Profundo / Express)', desc: '15-30+ min', xp: 40, icon: 'fa-broom' },
  { id: 'h4', tag: 'P4', title: 'Aprender Alemán', desc: '20-30 min', xp: 30, icon: 'fa-language' },
  { id: 'h5', tag: 'P5', title: 'Leer Libro', desc: '15 min / 10 páginas', xp: 20, icon: 'fa-book-open' },
  { id: 'h6', tag: 'P6', title: 'Hacer Ejercicio', desc: '30-45 min', xp: 40, icon: 'fa-dumbbell' }
];

// RECOMPENSAS DE LA TIENDA
const rewards = [
  { id: 'r1', title: '30-45 min Ocio libre', xp: 100, icon: 'fa-gamepad' },
  { id: 'r2', title: 'Sesión de Videojuegos', xp: 180, icon: 'fa-headset' },
  { id: 'r3', title: 'Tarde libre / Película / Serie', xp: 250, icon: 'fa-film' },
  { id: 'r4', title: 'Pedir Delivery', xp: 400, icon: 'fa-motorcycle' },
  { id: 'r5', title: 'Salida / Comida favorita', xp: 500, icon: 'fa-utensils' },
  { id: 'r6', title: 'Compra Relevante (Tecno, Ropa)', xp: 1200, icon: 'fa-bag-shopping' }
];

// INSIGNIAS Y LOGROS
const badges = [
  { id: 'b_first', title: 'Primer Paso', icon: 'fa-shoe-prints' },
  { id: 'b_lvl5', title: 'Ingeniero Sr.', icon: 'fa-award' },
  { id: 'b_boss', title: 'Cazador de Ramos', icon: 'fa-skull-crossbones' }
];

// AGENDA SEMANAL USACH
const scheduleData = {
  'Lunes': [
    { time: '09:50 - 12:45', name: 'Progra Lab / Física Lab', type: 'Lab' },
    { time: '13:50 - 18:15', name: 'Álgebra II, Cálculo II, Física II', type: 'Cátedra' }
  ],
  'Martes': [
    { time: '13:50 - 16:40', name: 'Física II, Programación', type: 'Cátedra' },
    { time: '16:55 - 18:15', name: 'Cálculo II', type: 'Cátedra' }
  ],
  'Miércoles': [
    { time: '15:20 - 16:40', name: 'Cálculo II', type: 'Cátedra' }
  ],
  'Jueves': [
    { time: '09:50 - 12:45', name: 'Química y Termodinámica, Progra Lab', type: 'Cátedra/Lab' },
    { time: '13:50 - 15:05', name: 'Álgebra II', type: 'Cátedra' },
    { time: '16:55 - 18:15', name: 'Cálculo II, Programación', type: 'Cátedra' }
  ],
  'Viernes': [
    { time: '09:50 - 12:45', name: 'Química y Termodinámica', type: 'Cátedra' },
    { time: '13:50 - 18:15', name: 'Cálculo II, Física II, Álgebra II', type: 'Cátedra' }
  ],
  'Sábado': [
    { time: '10:00 - 13:00', name: 'Estudio Intensivo / Repaso Semanal', type: 'Libre' },
    { time: '15:00 - 16:30', name: 'Aseo Profundo + Organización', type: 'Hogar' }
  ],
  'Domingo': [
    { time: '11:00 - 12:30', name: 'Aprender Alemán + Lectura', type: 'Desarrollo' },
    { time: '16:00 - 18:00', name: 'Planificación Semanal USACH', type: 'Gestión' }
  ]
};

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
