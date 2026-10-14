// ==========================================================================
// RASYONEL EVREN - ANA UYGULAMA YÖNETİCİSİ (app.js)
// Sayfa yönlendirme, tam ekran, puan/yıldız kaydı ve konfeti animasyonu
// ==========================================================================

class App {
    constructor() {
        this.currentView = 'menu';
        this.mode = localStorage.getItem('rasyonel_mode') || 'individual'; // 'individual' or 'class'
        this.stats = JSON.parse(localStorage.getItem('rasyonel_stats')) || {
            m1: 0,
            m2: 0,
            m3: 0,
            m4: 0,
            score: 0
        };

        // Modülleri başlat
        this.modules = {
            m1: new window.NumberLineModule(this),
            m2: new window.DecimalLabModule(this),
            m3: new window.ComparisonModule(this),
            m4: new window.ProblemsModule(this)
        };

        this.init();
    }

    init() {
        this.bindGlobalEvents();
        this.updateHUD();
        this.initConfetti();
        this.switchView('menu');
    }

    bindGlobalEvents() {
        // Ses Butonu
        const btnMute = document.getElementById('btn-toggle-sound');
        btnMute?.addEventListener('click', () => {
            const isMuted = window.soundEngine.toggleMute();
            this.updateSoundIcon(isMuted);
        });
        this.updateSoundIcon(window.soundEngine.isMuted);

        // Tam Ekran Butonu (Akıllı Tahta İçin Çok Önemli)
        const btnFullscreen = document.getElementById('btn-fullscreen');
        btnFullscreen?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.toggleFullscreen();
        });

        // Mod Seçimi (Bireysel / Sınıf)
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetMode = e.currentTarget.dataset.mode;
                this.setMode(targetMode);
            });
        });

        // Modül Başlatma Kartları
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const modId = e.currentTarget.dataset.module;
                window.soundEngine.playClick();
                this.startModule(modId);
            });
        });

        // Kutlama Modalı Kapatma
        document.getElementById('modal-btn-close')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.closeModal();
            this.switchView('menu');
        });
    }

    setMode(mode) {
        window.soundEngine.playClick();
        this.mode = mode;
        localStorage.setItem('rasyonel_mode', mode);
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }

    updateSoundIcon(isMuted) {
        const soundIcon = document.getElementById('sound-icon');
        if (!soundIcon) return;
        if (isMuted) {
            soundIcon.innerHTML = `
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
            `;
        } else {
            soundIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.remove('active');
        });

        const target = document.getElementById(`${viewName}-view`);
        if (target) {
            target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        this.updateHUD();
    }

    startModule(modId) {
        this.switchView(`module${modId.replace('m', '')}`);
        if (this.modules[modId]) {
            this.modules[modId].start();
        }
    }

    completeModule(modId, starsEarned = 3) {
        window.soundEngine.playFanfare();
        this.stats[modId] = Math.max(this.stats[modId] || 0, starsEarned);
        this.stats.score += 150;
        localStorage.setItem('rasyonel_stats', JSON.stringify(this.stats));

        this.updateHUD();
        this.showVictoryModal(modId, starsEarned);
        this.triggerConfetti();
    }

    updateHUD() {
        const totalStars = (this.stats.m1 || 0) + (this.stats.m2 || 0) + (this.stats.m3 || 0) + (this.stats.m4 || 0);
        const starElem = document.getElementById('total-stars');
        const scoreElem = document.getElementById('total-score');
        if (starElem) starElem.textContent = `${totalStars} / 12 ⭐`;
        if (scoreElem) scoreElem.textContent = `${this.stats.score || 0} Puan`;

        // Modül kartlarındaki yıldızları güncelle
        ['m1', 'm2', 'm3', 'm4'].forEach(id => {
            const starsContainer = document.getElementById(`stars-${id}`);
            if (starsContainer) {
                const count = this.stats[id] || 0;
                starsContainer.innerHTML = '★'.repeat(count) + '☆'.repeat(3 - count);
            }
        });
    }

    showVictoryModal(modId, stars) {
        const titles = {
            m1: "Sayı Doğrusu Büyüteci Tamamlandı!",
            m2: "Ondalık ve Devir Laboratuvarı Tamamlandı!",
            m3: "Rasyonel Terazi Arenası Tamamlandı!",
            m4: "Gerçek Yaşam Dedektifi Tamamlandı!"
        };

        const modal = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');

        if (titleEl) titleEl.textContent = titles[modId] || "Tebrikler!";
        if (msgEl) msgEl.innerHTML = `Bu modüldeki tüm kazanımları başarıyla tamamladın ve <strong>${stars} Yıldız</strong> kazandın!`;

        modal?.classList.add('open');
    }

    closeModal() {
        document.getElementById('modal-overlay')?.classList.remove('open');
    }

    // ======================================================================
    // %100 YEREL CANVAS KONFETİ EFEKTİ
    // ======================================================================
    initConfetti() {
        this.canvas = document.getElementById('confetti-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animating = false;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    triggerConfetti() {
        if (!this.canvas || !this.ctx) return;
        this.particles = [];
        const colors = ['#38bdf8', '#34d399', '#fbbf24', '#f43f5e', '#a855f7'];

        for (let i = 0; i < 90; i++) {
            this.particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.5) * 16 - 3,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
                opacity: 1
            });
        }

        if (!this.animating) {
            this.animating = true;
            this.animateConfetti();
        }
    }

    animateConfetti() {
        if (!this.animating) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeCount = 0;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // yerçekimi
            p.rotation += p.rotSpeed;
            p.opacity -= 0.012;

            if (p.opacity > 0) {
                activeCount++;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                this.ctx.restore();
            }
        });

        if (activeCount > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.animating = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Uygulamayı başlat
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new App();
});
