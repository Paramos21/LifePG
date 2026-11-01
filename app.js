// Helper para fecha YYYY-MM-DD
function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Sintetizador Audio Web
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'check') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'uncheck') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'levelUp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start(); osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'bossHit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'buy') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
}

// Cargar y Guardar Estado
function loadState() {
  const today = new Date().toDateString();
  const defaultState = {
    xp: 0, streak: 0, streakFreeze: false, examMode: false,
    completedHabits: new Set(), bonusClaimed: false, lastDate: today,
    completedBonusDates: [],
    history: [], unlockedBadges: new Set(), bossesDefeated: 0,
    bosses: [
      { id: 'b1', name: 'Certamen 2: Cálculo II', maxHp: 300, hp: 300, xpReward: 200, icon: 'fa-calculator', defeated: false },
      { id: 'b2', name: 'Proyecto: Programación', maxHp: 200, hp: 200, xpReward: 150, icon: 'fa-code', defeated: false }
    ]
  };

  try {
    const saved = localStorage.getItem('lifepg_v8_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
          streak: parsed.streak || 0,
          streakFreeze: !!parsed.streakFreeze,
          examMode: !!parsed.examMode,
          completedHabits: new Set(Array.isArray(parsed.completedHabits) ? parsed.completedHabits : []),
          bonusClaimed: !!parsed.bonusClaimed,
          lastDate: parsed.lastDate || today,
          completedBonusDates: Array.isArray(parsed.completedBonusDates) ? parsed.completedBonusDates : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
          unlockedBadges: new Set(Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : []),
          bossesDefeated: parsed.bossesDefeated || 0,
          bosses: Array.isArray(parsed.bosses) && parsed.bosses.length > 0 ? parsed.bosses : defaultState.bosses
        };
      }
    }
  } catch (e) {}
  return defaultState;
}

let state = loadState();
let timerInterval = null, timeLeft = 25 * 60, isTimerRunning = false, currentPreset = 25;

window.onload = function init() {
  checkDailyReset();
  renderHabits();
  renderStreakCalendar();
  renderDaysSelector();
  renderSchedule(getCurrentDay());
  renderShop();
  renderBosses();
  checkBadges();
  renderBadges();
  renderHistory();
  checkBonusUI();
  updateUIElements();
  updateDashboard();
};

function saveState() {
  const dataToSave = {
    xp: state.xp,
    streak: state.streak,
    streakFreeze: state.streakFreeze,
    examMode: state.examMode,
    completedHabits: Array.from(state.completedHabits),
    bonusClaimed: state.bonusClaimed,
    lastDate: state.lastDate,
    completedBonusDates: state.completedBonusDates || [],
    history: state.history.slice(0, 10),
    unlockedBadges: Array.from(state.unlockedBadges),
    bosses: state.bosses,
    bossesDefeated: state.bossesDefeated
  };
  localStorage.setItem('lifepg_v8_state', JSON.stringify(dataToSave));
  updateDashboard();
}

function checkDailyReset() {
  const today = new Date().toDateString();
  if (state.lastDate !== today) {
    state.completedHabits.clear();
    state.bonusClaimed = false;
    state.lastDate = today;
    saveState();
  }
}

function switchTab(tabId) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
  const targetSec = document.getElementById(`sec-${tabId}`);
  if (targetSec) {
    targetSec.classList.remove('hidden');
    targetSec.classList.add('flex');
  }

  document.querySelectorAll('div.grid.grid-cols-5 > button').forEach(btn => {
    btn.className = "py-2 rounded-lg hover:text-white transition-all text-slate-400";
    if (btn.id === 'tab-btn-jefes') btn.classList.add('flex', 'items-center', 'justify-center', 'gap-1');
  });

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "py-2 rounded-lg bg-indigo-600 text-white shadow transition-all";
    if (tabId === 'jefes') activeBtn.classList.add('flex', 'items-center', 'justify-center', 'gap-1');
  }
}

function updateDashboard() {
  const level = Math.floor(state.xp / 500) + 1;
  const currentLevelXp = state.xp % 500;
  const nextLevelXp = 500;
  const percentage = Math.max(0, (currentLevelXp / nextLevelXp) * 100);

  const lvlEl = document.getElementById('user-level');
  const xpEl = document.getElementById('user-xp');
  const nxtEl = document.getElementById('next-level-xp');
  const barEl = document.getElementById('xp-bar');
  const strkEl = document.getElementById('streak-count');
  const balEl = document.getElementById('shop-balance');

  if (lvlEl) lvlEl.innerText = level;
  if (xpEl) xpEl.innerText = state.xp;
  if (nxtEl) nxtEl.innerText = level * 500;
  if (barEl) barEl.style.width = `${percentage}%`;
  if (strkEl) strkEl.innerText = state.completedBonusDates ? state.completedBonusDates.length : 0;
  if (balEl) balEl.innerText = `${state.xp} XP Disp.`;

  if (!window.currentLevel) window.currentLevel = level;
  if (level > window.currentLevel) {
    playSound('levelUp');
    window.currentLevel = level;
  }
  checkBadges();
}

function toggleFreeze() {
  state.streakFreeze = !state.streakFreeze;
  saveState();
  updateUIElements();
}

function toggleExamMode() {
  state.examMode = !state.examMode;
  saveState();
  updateUIElements();
  renderHabits();
}

function updateUIElements() {
  const btnFreeze = document.getElementById('btn-freeze');
  const freezeStatus = document.getElementById('freeze-status');
  if (btnFreeze && freezeStatus) {
    if (state.streakFreeze) {
      btnFreeze.className = "flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-2.5 py-1.5 rounded-xl text-xs font-bold transition";
      freezeStatus.innerText = "On";
    } else {
      btnFreeze.className = "flex items-center gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1.5 rounded-xl text-xs font-bold transition hover:bg-cyan-500/20";
      freezeStatus.innerText = "Off";
    }
  }

  const btnExam = document.getElementById('btn-exam-mode');
  if (btnExam) {
    if (state.examMode) {
      btnExam.className = "px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow";
      btnExam.innerText = "Activo";
    } else {
      btnExam.className = "px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 transition";
      btnExam.innerText = "Inactivo";
    }
  }
}

// Hábitos
function renderHabits() {
  const container = document.getElementById('habits-container');
  if (!container || typeof habits === 'undefined') return;

  container.innerHTML = habits.map(h => {
    const checked = state.completedHabits.has(h.id);
    const earnedXp = (h.id === 'h1' && state.examMode) ? h.xp * 2 : h.xp;
    
    return `
      <div id="habit-card-${h.id}" onclick="toggleHabit('${h.id}')" class="habit-card flex items-center justify-between p-3 rounded-xl border cursor-pointer ${checked ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${checked ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'}">
            <i class="fa-solid ${h.icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold flex items-center gap-1.5 ${checked ? 'line-through text-indigo-300' : 'text-slate-200'}">
              ${h.title} <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-400 font-semibold">${h.tag}</span>
            </h3>
            <p class="text-xs text-slate-400">${h.desc}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold ${checked ? 'text-indigo-400' : 'text-indigo-500'}">+${earnedXp} XP</span>
          <div class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 text-transparent'}">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
      </div>
    `;
  }).join('');
  checkBonusUI();
}

function toggleHabit(id) {
  if (typeof habits === 'undefined') return;
  const habit = habits.find(h => h.id === id);
  if (!habit) return;

  const earnedXp = (id === 'h1' && state.examMode) ? habit.xp * 2 : habit.xp;
  const cardEl = document.getElementById(`habit-card-${id}`);

  if (state.completedHabits.has(id)) {
    state.completedHabits.delete(id);
    state.xp = Math.max(0, state.xp - earnedXp);
    playSound('uncheck');

    if (id === 'h1') healBosses(30);
  } else {
    state.completedHabits.add(id);
    state.xp += earnedXp;
    playSound('check');

    if (cardEl) {
      cardEl.classList.add('habit-pop');
      setTimeout(() => cardEl.classList.remove('habit-pop'), 350);
    }

    if (id === 'h1') damageBosses(30);
  }
  
  saveState();
  renderHabits();
}

function checkBonusUI() {
  const hasP1 = state.completedHabits.has('h1');
  const hasP2 = state.completedHabits.has('h2');
  const hasP3 = state.completedHabits.has('h3');
  
  const banner = document.getElementById('bonus-banner');
  const btnClaim = document.getElementById('btn-claim-bonus');
  const iconDone = document.getElementById('bonus-icon');

  const todayStr = getTodayStr();

  if (hasP1 && hasP2 && hasP3) {
    if (!state.completedBonusDates.includes(todayStr)) {
      state.completedBonusDates.push(todayStr);
    }
  } else {
    const idx = state.completedBonusDates.indexOf(todayStr);
    if (idx > -1) {
      state.completedBonusDates.splice(idx, 1);
    }
  }

  renderStreakCalendar();

  if (!banner || !btnClaim || !iconDone) return;

  if (state.bonusClaimed) {
    banner.className = "rounded-2xl p-4 border flex items-center justify-between transition-all bg-emerald-950/30 border-emerald-500/30 text-emerald-400";
    btnClaim.classList.add('hidden');
    iconDone.classList.remove('hidden', 'text-slate-600', 'fa-circle-xmark');
    iconDone.classList.add('text-emerald-500', 'fa-circle-check');
  } else if (hasP1 && hasP2 && hasP3) {
    banner.className = "rounded-2xl p-4 border flex items-center justify-between transition-all bg-amber-950/30 border-amber-500/50 text-amber-200";
    btnClaim.classList.remove('hidden');
    iconDone.classList.add('hidden');
  } else {
    banner.className = "rounded-2xl p-4 border flex items-center justify-between transition-all bg-slate-800/40 border-slate-700/50 text-slate-400";
    btnClaim.classList.add('hidden');
    iconDone.classList.remove('hidden', 'text-emerald-500', 'fa-circle-check');
    iconDone.classList.add('text-slate-600', 'fa-circle-xmark');
  }
}

function claimBonus() {
  if (!state.bonusClaimed) {
    state.bonusClaimed = true;
    state.xp += 30;
    playSound('levelUp');
    saveState();
    checkBonusUI();
  }
}

// Renders del Calendario de Racha
function renderStreakCalendar() {
  const gridEl = document.getElementById('streak-calendar-grid');
  const monthYearEl = document.getElementById('calendar-month-year');
  if (!gridEl) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  if (monthYearEl) monthYearEl.innerText = `${monthNames[month]} ${year}`;

  const dayHeaders = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  let html = dayHeaders.map(d => `<div class="py-1 text-slate-500 font-bold">${d}</div>`).join('');

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div></div>`;
  }

  const todayNum = now.getDate();
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isCompleted = state.completedBonusDates && state.completedBonusDates.includes(dateStr);
    const isToday = day === todayNum;

    let bgClass = 'bg-slate-800/40 text-slate-400';
    let borderClass = isToday ? 'border border-indigo-500/60' : 'border border-slate-700/30';
    let content = day;

    if (isCompleted) {
      bgClass = 'bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/50 shadow-sm shadow-amber-500/20';
      content = `<i class="fa-solid fa-fire text-[9px] text-amber-400"></i> ${day}`;
    }

    html += `<div class="py-1.5 rounded-lg flex items-center justify-center gap-0.5 ${bgClass} ${borderClass}">${content}</div>`;
  }

  gridEl.innerHTML = html;
}

// Pomodoro Focus
function updateTimerDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;
  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  display.innerText = `${m}:${s}`;
}

function setTimerPreset(minutes) {
  if (isTimerRunning) return;
  currentPreset = minutes;
  timeLeft = minutes * 60;
  updateTimerDisplay();
}

function toggleTimer() {
  const btn = document.getElementById('btn-timer-start');
  if (!btn) return;

  if (isTimerRunning) {
    clearInterval(timerInterval);
    isTimerRunning = false;
    btn.innerText = "Reanudar";
    btn.className = "flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow transition";
  } else {
    isTimerRunning = true;
    btn.innerText = "Pausar";
    btn.className = "flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow transition";
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        completePomodoro();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isTimerRunning = false;
  timeLeft = currentPreset * 60;
  updateTimerDisplay();
  const btn = document.getElementById('btn-timer-start');
  if (btn) {
    btn.innerText = "Iniciar";
    btn.className = "flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow transition";
  }
}

function completePomodoro() {
  resetTimer();
  playSound('levelUp');
  if (currentPreset >= 25) {
    state.xp += 20;
    damageBosses(25);
    saveState();
    alert(`¡Sesión de ${currentPreset} min completada! Ganaste 20 XP y dañaste a los jefes.`);
  } else {
    alert("¡Descanso terminado! Volvamos al trabajo.");
  }
}

// Jefes & Batallas
function renderBosses() {
  const container = document.getElementById('bosses-container');
  const badge = document.getElementById('boss-badge');
  if (!container) return;

  if (!state.bosses || state.bosses.length === 0) {
    container.innerHTML = `
      <div class="glass-card rounded-2xl p-6 text-center text-slate-400">
        <i class="fa-solid fa-trophy text-4xl text-amber-500 mb-3"></i>
        <p class="text-sm font-bold text-slate-200">¡Sin Jefes Activos!</p>
        <p class="text-xs mt-1">Crea un jefe o evaluación con el botón superior.</p>
      </div>
    `;
    if (badge) badge.classList.add('hidden');
    return;
  }

  if (badge) badge.classList.remove('hidden');

  container.innerHTML = state.bosses.map(boss => {
    const hpPercent = Math.max(0, (boss.hp / boss.maxHp) * 100);
    const isLowHp = hpPercent < 30;
    const isDefeated = boss.hp <= 0;
    
    return `
      <div class="glass-card rounded-2xl p-4 flex flex-col gap-3 border ${isDefeated ? 'border-slate-800 opacity-60' : isLowHp ? 'border-rose-500/50' : 'border-slate-700/50'}">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-lg bg-rose-950/50 text-rose-400 flex items-center justify-center text-lg border border-rose-500/20">
              <i class="fa-solid ${boss.icon || 'fa-skull'}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-200 ${isDefeated ? 'line-through text-slate-400' : ''}">${boss.name}</h3>
              <p class="text-xs text-rose-400 font-semibold">${isDefeated ? '¡Derrotado!' : `HP: ${boss.hp} / ${boss.maxHp}`}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              Botín: ${boss.xpReward} XP
            </div>
            <button onclick="resetBossHp('${boss.id}')" title="Restaurar HP a 100%" class="text-slate-500 hover:text-emerald-400 text-xs p-1.5 transition">
              <i class="fa-solid fa-heart-pulse"></i>
            </button>
            <button onclick="deleteBoss('${boss.id}')" title="Eliminar Jefe" class="text-slate-500 hover:text-rose-400 text-xs p-1.5 transition">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
          <div class="bg-gradient-to-r from-rose-600 to-rose-400 h-3 rounded-full transition-all duration-500" style="width: ${hpPercent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function damageBosses(dmgAmount) {
  if (!state.bosses || state.bosses.length === 0) return;
  playSound('bossHit');

  state.bosses.forEach(boss => {
    if (boss.hp > 0) {
      boss.hp = Math.max(0, boss.hp - dmgAmount);
      if (boss.hp === 0 && !boss.defeated) {
        boss.defeated = true;
        state.xp += boss.xpReward;
        state.bossesDefeated = (state.bossesDefeated || 0) + 1;
        setTimeout(() => alert(`¡JEFE DERROTADO: ${boss.name}! +${boss.xpReward} XP`), 200);
      }
    }
  });

  saveState();
  renderBosses();
}

function healBosses(healAmount) {
  if (!state.bosses || state.bosses.length === 0) return;

  state.bosses.forEach(boss => {
    const wasDefeated = boss.defeated || boss.hp <= 0;
    boss.hp = Math.min(boss.maxHp, boss.hp + healAmount);

    if (wasDefeated && boss.hp > 0) {
      boss.defeated = false;
      state.xp = Math.max(0, state.xp - boss.xpReward);
      state.bossesDefeated = Math.max(0, (state.bossesDefeated || 0) - 1);
    }
  });

  saveState();
  renderBosses();
}

// Restaurar vida del jefe individual al 100%
function resetBossHp(id) {
  if (!state.bosses) return;
  const boss = state.bosses.find(b => b.id === id);
  if (boss) {
    if (confirm(`¿Quieres restaurar la vida de "${boss.name}" al 100% (${boss.maxHp} HP)?`)) {
      if (boss.defeated) {
        boss.defeated = false;
        state.xp = Math.max(0, state.xp - boss.xpReward);
        state.bossesDefeated = Math.max(0, (state.bossesDefeated || 0) - 1);
      }
      boss.hp = boss.maxHp;
      saveState();
      renderBosses();
    }
  }
}

function toggleBossForm() {
  const form = document.getElementById('add-boss-form');
  if (form) form.classList.toggle('hidden');
}

function addNewBoss() {
  const nameInput = document.getElementById('new-boss-name');
  const hpInput = document.getElementById('new-boss-hp');
  const xpInput = document.getElementById('new-boss-xp');
  const iconInput = document.getElementById('new-boss-icon');

  if (!nameInput || !hpInput || !xpInput) return;

  const name = nameInput.value.trim();
  const hp = parseInt(hpInput.value);
  const xp = parseInt(xpInput.value);
  const icon = iconInput ? iconInput.value : 'fa-skull';

  if (!name || isNaN(hp) || hp <= 0 || isNaN(xp) || xp < 0) {
    alert("Por favor completa los campos correctamente.");
    return;
  }

  const newBoss = {
    id: 'b_' + Date.now(),
    name: name,
    maxHp: hp,
    hp: hp,
    xpReward: xp,
    icon: icon,
    defeated: false
  };

  if (!state.bosses) state.bosses = [];
  state.bosses.push(newBoss);
  saveState();
  renderBosses();

  nameInput.value = '';
  hpInput.value = '';
  xpInput.value = '';
  toggleBossForm();
}

function deleteBoss(id) {
  if (confirm("¿Estás seguro de eliminar este jefe?")) {
    state.bosses = state.bosses.filter(b => b.id !== id);
    saveState();
    renderBosses();
  }
}

// Horarios
function getCurrentDay() {
  if (typeof daysOfWeek === 'undefined') return 'Lunes';
  const dayIndex = new Date().getDay();
  return dayIndex === 0 ? 'Domingo' : daysOfWeek[dayIndex - 1];
}

function renderDaysSelector() {
  const container = document.getElementById('day-selector');
  if (!container || typeof daysOfWeek === 'undefined') return;

  container.innerHTML = daysOfWeek.map(day => `
    <button onclick="renderSchedule('${day}')" id="day-btn-${day}" class="day-btn text-xs font-bold px-3 py-2 rounded-xl transition-all ${day === getCurrentDay() ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'}">
      ${day.substring(0,3)}
    </button>
  `).join('');
}

function renderSchedule(selectedDay) {
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.className = "day-btn text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-slate-400 transition-all";
  });
  const activeBtn = document.getElementById(`day-btn-${selectedDay}`);
  if (activeBtn) activeBtn.className = "day-btn text-xs font-bold px-3 py-2 rounded-xl bg-indigo-600 text-white transition-all shadow";

  const container = document.getElementById('schedule-container');
  if (!container || typeof scheduleData === 'undefined') return;

  const classes = scheduleData[selectedDay] || [];
  if (classes.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-400 text-center py-4">Sin actividades programadas.</p>`;
    return;
  }

  container.innerHTML = classes.map(cls => {
    let typeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (cls.type === 'Lab') typeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    else if (cls.type === 'Libre') typeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    else if (cls.type === 'Hogar' || cls.type === 'Gestión') typeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

    return `
      <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div class="text-xs font-bold text-slate-400 whitespace-nowrap mt-0.5">${cls.time}</div>
        <div>
          <div class="text-sm font-bold text-slate-200">${cls.name}</div>
          <div class="text-[10px] uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block border ${typeColor}">
            ${cls.type}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Tienda
function renderShop() {
  const container = document.getElementById('shop-container');
  if (!container || typeof rewards === 'undefined') return;

  container.innerHTML = rewards.map(r => {
    const canAfford = state.xp >= r.xp;
    return `
      <div class="glass-card rounded-2xl p-4 flex justify-between items-center border border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg text-indigo-400">
            <i class="fa-solid ${r.icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-200">${r.title}</h3>
            <p class="text-xs font-bold ${canAfford ? 'text-emerald-400' : 'text-slate-500'}"><i class="fa-solid fa-coins"></i> ${r.xp} XP</p>
          </div>
        </div>
        <button onclick="buyReward('${r.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${canAfford ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">
          Canjear
        </button>
      </div>
    `;
  }).join('');
}

function buyReward(id) {
  if (typeof rewards === 'undefined') return;
  const reward = rewards.find(r => r.id === id);
  if (!reward) return;

  if (state.xp >= reward.xp) {
    state.xp -= reward.xp;
    playSound('buy');
    
    const date = new Date().toLocaleDateString('es-CL');
    state.history.unshift({ title: reward.title, xp: reward.xp, date: date });
    saveState();
    
    renderShop();
    renderHistory();
    alert(`¡Has canjeado: ${reward.title}! Disfruta tu recompensa.`);
  } else {
    alert("XP insuficiente.");
  }
}

function renderHistory() {
  const container = document.getElementById('redemption-history');
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = `<span class="text-slate-500 italic">Aún no has canjeado recompensas.</span>`;
    return;
  }

  container.innerHTML = state.history.map(item => `
    <div class="flex justify-between items-center py-1.5 border-b border-slate-700/50 last:border-0">
      <span class="text-slate-300">${item.title}</span>
      <span class="text-rose-400 font-bold">-${item.xp} XP</span>
    </div>
  `).join('');
}

function checkBadges() {
  let changed = false;
  const level = Math.floor(state.xp / 500) + 1;

  if (state.completedHabits.size > 0 && !state.unlockedBadges.has('b_first')) {
    state.unlockedBadges.add('b_first');
    changed = true;
  }
  if (level >= 5 && !state.unlockedBadges.has('b_lvl5')) {
    state.unlockedBadges.add('b_lvl5');
    changed = true;
  }
  if (state.bossesDefeated > 0 && !state.unlockedBadges.has('b_boss')) {
    state.unlockedBadges.add('b_boss');
    changed = true;
  }

  if (changed) {
    saveState();
    renderBadges();
  }
}

function renderBadges() {
  const container = document.getElementById('badges-container');
  if (!container || typeof badges === 'undefined') return;

  container.innerHTML = badges.map(b => {
    const unlocked = state.unlockedBadges.has(b.id);
    return `
      <div class="flex flex-col items-center text-center p-2 rounded-xl border ${unlocked ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-slate-800/30 border-slate-700/30 opacity-50'}">
        <div class="w-10 h-10 rounded-full mb-1 flex items-center justify-center text-lg ${unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}">
          <i class="fa-solid ${b.icon}"></i>
        </div>
        <div class="text-[10px] font-bold ${unlocked ? 'text-slate-200' : 'text-slate-500'} leading-tight">${b.title}</div>
      </div>
    `;
  }).join('');
}

// Botones de Reinicio
function resetXPOnly() {
  if (confirm("¿Seguro que quieres reiniciar tus XP acumuladas a 0? (Tus hábitos completados hoy no se borrarán)")) {
    state.xp = 0;
    saveState();
    renderShop();
  }
}

function resetAllData() {
  if (confirm("¿Estás seguro de que deseas borrar TODO tu progreso? Esta acción no se puede deshacer.")) {
    localStorage.removeItem('lifepg_v8_state');
    location.reload();
  }
}
