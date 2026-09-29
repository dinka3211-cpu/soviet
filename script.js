// ====== Telegram WebApp ======
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#1a1a2e');
    tg.setBackgroundColor('#1a1a2e');
    tg.disableVerticalSwipes?.();
}

// ====== Настройки ======
let settings = {
    musicVol: 0.5,
    sfxVol: 0.7,
    haptic: true,
    muted: false
};

// ====== Состояние игры ======
let state = {
    day: 1,
    timeOfDay: 'morning',
    sceneId: 'intro',
    affection: { alice: 0, lena: 0, uliana: 0, slavya: 0 },
    flags: {},
    achievements: [],
    unlocked: [], // премиум главы
    playtime: 0
};

let currentSlot = 1;
let saveTimer = null;

// ====== Аудио ======
const audio = {
    music: null,
    sfx: null,
    currentTrack: null
};

const TRACKS = {
    day: 'audio/day.mp3',
    night: 'audio/night.mp3',
    romantic: 'audio/romantic.mp3'
};

function playMusic(track) {
    if (audio.currentTrack === track || settings.muted) return;
    audio.currentTrack = track;
    if (audio.music) {
        audio.music.pause();
        audio.music = null;
    }
    audio.music = new Audio(TRACKS[track] || TRACKS.day);
    audio.music.loop = true;
    audio.music.volume = settings.musicVol;
    audio.music.play().catch(() => {});
}

function playClick() {
    if (settings.muted) return;
    audio.sfx = new Audio('audio/click.mp3');
    audio.sfx.volume = settings.sfxVol;
    audio.sfx.play().catch(() => {});
}

function toggleAudio() {
    settings.muted = !settings.muted;
    if (audio.music) {
        if (settings.muted) audio.music.pause();
        else audio.music.play().catch(() => {});
    }
    document.getElementById('audioBtn').textContent = settings.muted ? '🔇' : '🔊';
    saveSettings();
}

// ====== Haptic ======
function haptic(type = 'light') {
    if (!settings.haptic || !tg?.HapticFeedback) return;
    try {
        if (type === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
        else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
        else if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
    } catch(e) {}
}

// ====== Основная логика сцен ======
function showScene(id) {
    const scene = SCENES[id];
    if (!scene) return showEnding();

    state.sceneId = id;
    if (scene.onEnter) scene.onEnter();
    if (scene.achievement) unlockAchievement(scene.achievement);

    // Фон с картинкой или градиентом
    const bgEl = document.getElementById('bg');
    const img = new Image();
    img.onload = () => {
        bgEl.style.backgroundImage = `url(images/bg_${scene.bg}.jpg)`;
        bgEl.className = 'bg';
    };
    img.onerror = () => {
        bgEl.style.backgroundImage = '';
        bgEl.className = 'bg ' + (scene.bg || 'camp');
    };
    img.src = `images/bg_${scene.bg}.jpg`;

    // Персонаж
    const charEl = document.getElementById('character');
    const char2El = document.getElementById('character2');
    charEl.className = 'character';
    char2El.className = 'character second hidden';

    if (scene.character) {
        const ci = new Image();
        ci.onload = () => { charEl.style.backgroundImage = `url(images/${scene.character}.png)`; };
        ci.onerror = () => { charEl.style.backgroundImage = ''; };
        ci.src = `images/${scene.character}.png`;
        charEl.style.opacity = '1';
    } else {
        charEl.style.backgroundImage = '';
        charEl.style.opacity = '0';
    }

    if (scene.character2) {
        char2El.className = 'character second';
        char2El.style.backgroundImage = `url(images/${scene.character2}.png)`;
    }

    // Музыка
    if (scene.music) playMusic(scene.music);

    // Текст
    document.getElementById('speaker').textContent = scene.speaker || '';
    const textEl = document.getElementById('text');
    textEl.textContent = scene.text || '';
    textEl.style.animation = 'none';
    setTimeout(() => textEl.style.animation = 'fadeIn 0.3s', 10);

    // Выборы
    const choicesEl = document.getElementById('choices');
    choicesEl.innerHTML = '';

    if (scene.choices) {
        scene.choices.forEach(choice => {
            // Проверка "need" — показываем только если хватает симпатии
            if (choice.need) {
                const ok = Object.entries(choice.need).every(
                    ([k, v]) => (state.affection[k] || 0) >= v
                );
                if (!ok) return;
            }
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.onclick = () => makeChoice(choice);
            choicesEl.appendChild(btn);
        });
    } else if (scene.next) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = '▶ Продолжить';
        btn.onclick = () => { playClick(); showScene(scene.next); };
        choicesEl.appendChild(btn);
    } else {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = '▶ Завершить';
        btn.onclick = showEnding;
        choicesEl.appendChild(btn);
    }

    updateHUD();
    autoSave();
}

function makeChoice(choice) {
    playClick();
    haptic('light');
    if (choice.effect) {
        for (const [key, val] of Object.entries(choice.effect)) {
            state.affection[key] = (state.affection[key] || 0) + val;
        }
    }
    showScene(choice.next);
}

function updateHUD() {
    document.getElementById('dayLabel').textContent = `День ${state.day}`;
    const t = { morning: 'Утро', day: 'День', evening: 'Вечер', night: 'Ночь' };
    document.getElementById('timeLabel').textContent = t[state.timeOfDay] || '';

    // Полосы симпатий
    document.querySelectorAll('.aff-item').forEach(el => {
        const hero = el.dataset.hero;
        const val = Math.max(0, Math.min(10, state.affection[hero] || 0));
        el.querySelector('.fill').style.width = (val * 10) + '%';
    });
}

// ====== Достижения ======
const ACHIEVEMENTS = {
    meet_alice:   { icon: '🔥', title: 'Знакомство с Алисой',   desc: 'Познакомился с рыжей бестией' },
    meet_lena:    { icon: '📖', title: 'Знакомство с Леной',    desc: 'Встретил застенчивую книжницу' },
    meet_uliana:  { icon: '⚡', title: 'Знакомство с Ульяной',  desc: 'Подружился с маленьким ураганом' },
    meet_slavya:  { icon: '💛', title: 'Знакомство со Славей',  desc: 'Встретил доброе сердце лагеря' },
    rehearsal_done: { icon: '🎭', title: 'Репетиция',           desc: 'Подготовился к конкурсу талантов' },
    romance_alice:  { icon: '💞', title: 'Роман с Алисой',      desc: 'Ночь на причале вдвоём' },
    romance_lena:   { icon: '💞', title: 'Роман с Леной',       desc: 'Получил книгу с номером телефона' },
    romance_uliana: { icon: '💞', title: 'Обещание Ульяне',     desc: 'Поклялся вернуться' },
    romance_slavya: { icon: '💞', title: 'Роман со Славей',     desc: 'Записка «Я буду ждать»' },
    all_heroes:     { icon: '🌟', title: 'Душа компании',       desc: 'Познакомился со всеми четырьмя' },
    perfect_run:    { icon: '👑', title: 'Идеальное лето',      desc: 'Максимум симпатии у всех' },
    ending_good:    { icon: '🎉', title: 'Хорошая концовка',    desc: 'Достиг хорошего финала' },
    ending_neutral: { icon: '🌤', title: 'Нейтральная концовка',desc: 'Достиг нейтрального финала' },
    ending_bad:     { icon: '🌧', title: 'Плохая концовка',     desc: 'Достиг плохого финала' }
};

function unlockAchievement(id) {
    if (state.achievements.includes(id)) return;
    state.achievements.push(id);
    const a = ACHIEVEMENTS[id];
    if (a) {
        showToast(`${a.icon} ${a.title}`);
        haptic('success');
    }
    saveProgress();
}

function checkSpecialAchievements() {
    // Все герои
    const met = ['meet_alice', 'meet_lena', 'meet_uliana', 'meet_slavya'];
    if (met.every(m => state.achievements.includes(m))) {
        unlockAchievement('all_heroes');
    }
    // Идеальное лето
    const a = state.affection;
    if (a.alice >= 8 && a.lena >= 8 && a.uliana >= 8 && a.slavya >= 8) {
        unlockAchievement('perfect_run');
    }
}

// ====== Концовка ======
function showEnding() {
    checkSpecialAchievements();
    const a = state.affection;
    const max = Math.max(a.alice, a.lena, a.uliana, a.slavya);
    let title, text, achId;

    if (max >= 6) {
        const hero = Object.keys(a).find(k => a[k] === max);
        const names = { alice: 'Алиса', lena: 'Лена', uliana: 'Ульяна', slavya: 'Славя' };
        title = `💖 Концовка: ${names[hero]}`;
        text = `Лето закончилось, но ты увёз с собой нечто большее, чем загар. ${names[hero]} обещала писать. И ты знаешь — это не пустые слова.\n\nФинал: хорошая концовка.`;
        achId = 'ending_good';
        playMusic('romantic');
    } else if (max >= 3) {
        title = '🌤 Нейтральная концовка';
        text = 'Ты провёл хорошее лето, нашёл друзей и запомнил каждый закат над озером. Но что-то осталось недосказанным...';
        achId = 'ending_neutral';
    } else {
        title = '🌧 Плохая концовка';
        text = 'Ты так и остался наблюдателем. Лето прошло мимо, оставив лишь лёгкое сожаление. Может, в следующий раз?';
        achId = 'ending_bad';
    }

    unlockAchievement(achId);

    document.getElementById('endingTitle').textContent = title;
    document.getElementById('endingText').textContent = text;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('ending').classList.add('active');

    if (audio.music) audio.music.pause();
    haptic('success');
    saveProgress();
}

// ====== Сохранения (слоты) ======
function getSaveKey(slot) { return `camp_save_${slot}`; }

function saveToSlot(slot = currentSlot) {
    const data = JSON.stringify({
        state,
        timestamp: Date.now(),
        day: state.day,
        scene: state.sceneId
    });
    if (tg?.CloudStorage) {
        tg.CloudStorage.setItem(getSaveKey(slot), data, () => {
            showToast('💾 Сохранено');
        });
    } else {
        localStorage.setItem(getSaveKey(slot), data);
        showToast('💾 Сохранено');
    }
    haptic('light');
}

function autoSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveToSlot(currentSlot), 800);
}

function loadSlot(slot, callback) {
    const key = getSaveKey(slot);
    if (tg?.CloudStorage) {
        tg.CloudStorage.getItem(key, (err, val) => callback(val));
    } else {
        callback(localStorage.getItem(key));
    }
}

function showSaveMenu() {
    const list = document.getElementById('slotsList');
    list.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const el = document.createElement('div');
        el.className = 'slot';
        el.innerHTML = `<div class="slot-info"><div class="slot-title">Слот ${i}</div><div class="slot-meta">Загрузка...</div></div>`;
        list.appendChild(el);

        loadSlot(i, (val) => {
            const meta = el.querySelector('.slot-meta');
            if (val) {
                const d = JSON.parse(val);
                const date = new Date(d.timestamp).toLocaleDateString();
                meta.textContent = `День ${d.day} · ${date}`;
                el.querySelector('.slot-info').onclick = () => {
                    state = d.state;
                    startFromState();
                };
                const actions = document.createElement('div');
                actions.className = 'slot-actions';
                const del = document.createElement('button');
                del.className = 'mini-btn';
                del.textContent = '🗑';
                del.onclick = (e) => {
                    e.stopPropagation();
                    deleteSlot(i);
                    showSaveMenu();
                };
                actions.appendChild(del);
                el.appendChild(actions);
            } else {
                meta.textContent = 'Пусто — нажми, чтобы начать';
                el.querySelector('.slot-info').onclick = () => {
                    currentSlot = i;
                    startNewGame();
                };
            }
        });
    }

    document.getElementById('saveMenu').classList.add('active');
}

function deleteSlot(slot) {
    if (tg?.CloudStorage) {
        tg.CloudStorage.removeItem(getSaveKey(slot), () => {});
    } else {
        localStorage.removeItem(getSaveKey(slot));
    }
}

function startFromState() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game').classList.add('active');
    closeModal('saveMenu');
    showScene(state.sceneId);
}

// ====== Пауза ======
function showPauseMenu() {
    document.getElementById('pauseMenu').classList.add('active');
}

// ====== Галерея ======
function showGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    const heroes = [
        { id: 'alice', icon: '🔥', name: 'Алиса' },
        { id: 'lena', icon: '📖', name: 'Лена' },
        { id: 'uliana', icon: '⚡', name: 'Ульяна' },
        { id: 'slavya', icon: '💛', name: 'Славя' }
    ];
    heroes.forEach(h => {
        const unlocked = state.achievements.includes('meet_' + h.id);
        const el = document.createElement('div');
        el.className = 'gallery-item' + (unlocked ? '' : ' locked');
        el.textContent = unlocked ? h.icon : '❓';
        el.title = unlocked ? h.name : 'Заблокировано';
        grid.appendChild(el);
    });
    for (let i = 0; i < 5; i++) {
        const el = document.createElement('div');
        el.className = 'gallery-item locked';
        el.textContent = '❓';
        grid.appendChild(el);
    }
    document.getElementById('gallery').classList.add('active');
}

// ====== Достижения UI ======
function showAchievements() {
    const list = document.getElementById('achList');
    list.innerHTML = '';
    Object.entries(ACHIEVEMENTS).forEach(([id, a]) => {
        const unlocked = state.achievements.includes(id);
        const el = document.createElement('div');
        el.className = 'ach' + (unlocked ? '' : ' locked');
        el.innerHTML = `
            <div class="ach-icon">${unlocked ? a.icon : '🔒'}</div>
            <div class="ach-info">
                <b>${a.title}</b>
                <small>${a.desc}</small>
            </div>
        `;
        list.appendChild(el);
    });
    document.getElementById('achievements').classList.add('active');
}

// ====== Настройки ======
function showSettings() {
    document.getElementById('musicVol').value = settings.musicVol * 100;
    document.getElementById('sfxVol').value = settings.sfxVol * 100;
    document.getElementById('hapticToggle').checked = settings.haptic;
    document.getElementById('settings').classList.add('active');
}

function saveSettings() {
    settings.musicVol = document.getElementById('musicVol').value / 100;
    settings.sfxVol = document.getElementById('sfxVol').value / 100;
    settings.haptic = document.getElementById('hapticToggle').checked;
    if (audio.music) audio.music.volume = settings.musicVol;
    if (tg?.CloudStorage) {
        tg.CloudStorage.setItem('camp_settings', JSON.stringify(settings), () => {});
    } else {
        localStorage.setItem('camp_settings', JSON.stringify(settings));
    }
    showToast('⚙ Настройки сохранены');
}

function loadSettings(cb) {
    if (tg?.CloudStorage) {
        tg.CloudStorage.getItem('camp_settings', (err, val) => {
            if (val) settings = { ...settings, ...JSON.parse(val) };
            cb();
        });
    } else {
        const val = localStorage.getItem('camp_settings');
        if (val) settings = { ...settings, ...JSON.parse(val) };
        cb();
    }
}

// ====== Магазин (Telegram Stars) ======
function showShop() {
    document.getElementById('shopModal').classList.add('active');
}

function buyChapter(chapterId, stars) {
    if (!tg) return showToast('Магазин доступен только в Telegram');

    // Проверка, есть ли уже
    if (state.unlocked.includes(chapterId)) {
        return showToast('Уже куплено!');
    }

    // Отправляем данные в бота через sendData
    tg.sendData(JSON.stringify({
        action: 'buy',
        chapter: chapterId,
        stars: stars
    }));

    showToast('⭐ Открываю оплату...');
}

// Обработка возврата после оплаты (бот вызовет tg.sendData с результатом)
function handlePurchaseResult(data) {
    try {
        const d = JSON.parse(data);
        if (d.success && d.chapter) {
            state.unlocked.push(d.chapter);
            unlockAchievement('unlocked_' + d.chapter);
            showToast('✅ Глава открыта!');
            saveProgress();
        }
    } catch(e) {}
}

// ====== Тост ======
let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ====== Модалки ======
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ====== Сохранение основного прогресса (для галереи/ачивок) ======
function saveProgress() {
    const key = 'camp_meta';
    const data = JSON.stringify({
        achievements: state.achievements,
        unlocked: state.unlocked
    });
    if (tg?.CloudStorage) {
        tg.CloudStorage.setItem(key, data, () => {});
    } else {
        localStorage.setItem(key, data);
    }
}

function loadMeta(cb) {
    const key = 'camp_meta';
    if (tg?.CloudStorage) {
        tg.CloudStorage.getItem(key, (err, val) => {
            if (val) {
                const d = JSON.parse(val);
                state.achievements = d.achievements || [];
                state.unlocked = d.unlocked || [];
            }
            cb();
        });
    } else {
        const val = localStorage.getItem(key);
        if (val) {
            const d = JSON.parse(val);
            state.achievements = d.achievements || [];
            state.unlocked = d.unlocked || [];
        }
        cb();
    }
}

// ====== Управление игрой ======
function startNewGame() {
    state = {
        day: 1,
        timeOfDay: 'morning',
        sceneId: 'intro',
        affection: { alice: 0, lena: 0, uliana: 0, slavya: 0 },
        flags: {},
        achievements: state.achievements, // сохраняем мета-прогресс
        unlocked: state.unlocked,
        playtime: 0
    };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('game').classList.add('active');
    closeModal('saveMenu');
    showScene('intro');
    haptic('medium');
}

function restartGame() {
    if (audio.music) audio.music.pause();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('splash').classList.add('active');
}

// ====== Инициализация ======
window.addEventListener('load', () => {
    loadSettings(() => {
        document.getElementById('audioBtn').textContent = settings.muted ? '🔇' : '🔊';
    });
    loadMeta(() => {});

    // Обработка возврата из Telegram Stars
    tg?.onEvent?.('viewportChanged', () => {});
    if (tg?.initDataUnsafe?.start_param) {
        const param = tg.initDataUnsafe.start_param;
        if (param.startsWith('purchase_')) {
            const chapter = param.replace('purchase_', '');
            state.unlocked.push(chapter);
            showToast('✅ Покупка подтверждена!');
            saveProgress();
        }
    }

    // Автозапуск музыки при первом тапе
    const startAudio = () => {
        if (!audio.currentTrack) playMusic('day');
        document.removeEventListener('touchstart', startAudio);
        document.removeEventListener('click', startAudio);
    };
    document.addEventListener('touchstart', startAudio);
    document.addEventListener('click', startAudio);
});

// Хоткеи для отладки (в браузере)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    }
});
