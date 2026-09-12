/**
 * Storage & Presets Manager
 */

const STORAGE_KEY_TIMERS = 'chronos_countdown_timers_v1';
const STORAGE_KEY_SETTINGS = 'chronos_countdown_settings_v1';
const STORAGE_KEY_ACTIVE = 'chronos_active_timer_id';

export function getDefaultPresets() {
  const now = new Date();
  
  // Next New Year
  const nextYear = now.getFullYear() + 1;
  const newYearDate = new Date(nextYear, 0, 1, 0, 0, 0);

  // Next Weekend (Saturday 00:00)
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const weekendDate = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
  weekendDate.setHours(0, 0, 0, 0);

  // Apple-style Launch Event (in 3 days 10:00 AM)
  const launchDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  launchDate.setHours(10, 0, 0, 0);

  // Focus Session (25 minutes)
  const pomodoroDate = new Date(now.getTime() + 25 * 60 * 1000);

  return [
    {
      id: 'preset_launch',
      title: '🚀 Nova OS 2.0 Product Launch',
      category: 'Launch',
      targetDate: launchDate.toISOString(),
      startDate: now.toISOString(),
      theme: 'cosmic',
      displayMode: 'flip',
      tickSound: 'mechanical',
      ambientSound: 'space',
      isPreset: true
    },
    {
      id: 'preset_newyear',
      title: `🎉 New Year ${nextYear} Global Countdown`,
      category: 'Celebration',
      targetDate: newYearDate.toISOString(),
      startDate: now.toISOString(),
      theme: 'cyberpunk',
      displayMode: 'ring',
      tickSound: 'blip',
      ambientSound: 'none',
      isPreset: true
    },
    {
      id: 'preset_weekend',
      title: '🏖️ Weekend Freedom',
      category: 'Life',
      targetDate: weekendDate.toISOString(),
      startDate: now.toISOString(),
      theme: 'lofi',
      displayMode: 'kinetic',
      tickSound: 'pulse',
      ambientSound: 'rain',
      isPreset: true
    },
    {
      id: 'preset_pomodoro',
      title: '🧠 Deep Focus Sprint (25m)',
      category: 'Focus',
      targetDate: pomodoroDate.toISOString(),
      startDate: now.toISOString(),
      theme: 'zen',
      displayMode: 'ring',
      tickSound: 'mechanical',
      ambientSound: 'zen',
      isPreset: true
    }
  ];
}

export class StorageManager {
  constructor() {
    this.timers = this.loadTimers();
    this.activeId = this.loadActiveId();
    this.settings = this.loadSettings();
  }

  loadTimers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TIMERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load timers from localStorage:', e);
    }
    const defaults = getDefaultPresets();
    this.saveTimers(defaults);
    return defaults;
  }

  saveTimers(timers) {
    try {
      localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timers));
      this.timers = timers;
    } catch (e) {
      console.warn('Failed to save timers to localStorage:', e);
    }
  }

  getActiveTimer() {
    const active = this.timers.find(t => t.id === this.activeId);
    return active || this.timers[0] || getDefaultPresets()[0];
  }

  setActiveTimerId(id) {
    this.activeId = id;
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    } catch (e) {}
  }

  loadActiveId() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved && this.timers.some(t => t.id === saved)) {
        return saved;
      }
    } catch (e) {}
    return this.timers[0]?.id || 'preset_launch';
  }

  addTimer(timer) {
    const newTimer = {
      id: 'timer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      startDate: new Date().toISOString(),
      ...timer
    };
    this.timers.unshift(newTimer);
    this.saveTimers(this.timers);
    this.setActiveTimerId(newTimer.id);
    return newTimer;
  }

  updateTimer(id, updates) {
    this.timers = this.timers.map(t => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    this.saveTimers(this.timers);
  }

  deleteTimer(id) {
    this.timers = this.timers.filter(t => t.id !== id);
    if (this.timers.length === 0) {
      this.timers = getDefaultPresets();
    }
    if (this.activeId === id) {
      this.setActiveTimerId(this.timers[0].id);
    }
    this.saveTimers(this.timers);
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      soundEnabled: true,
      volume: 0.7,
      theme: 'cosmic',
      displayMode: 'flip'
    };
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    } catch (e) {}
  }
}
