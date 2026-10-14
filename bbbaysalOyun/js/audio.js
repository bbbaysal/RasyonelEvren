// ==========================================================================
// RASYONEL EVREN: SES MOTORU (Web Audio API)
// 100% Çevrimdışı - Hiçbir harici ses dosyasına veya internete gerek duymaz!
// ==========================================================================

class SoundFX {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('rasyonel_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('rasyonel_muted', this.isMuted);
        return this.isMuted;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15, startDelay = 0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + startDelay;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(gainVal, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Buton tıklama sesi (Pop)
    playClick() {
        this.playTone(600, 'sine', 0.08, 0.1);
    }

    // Doğru cevap melodisi (Major Üçlü akor)
    playSuccess() {
        if (this.isMuted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'triangle', 0.22, 0.18, idx * 0.08);
        });
    }

    // Hatalı işlem / Yanlış cevap (Tok bas titreşim)
    playError() {
        if (this.isMuted) return;
        this.init();
        this.playTone(200, 'sawtooth', 0.25, 0.18);
        this.playTone(150, 'sawtooth', 0.25, 0.18, 0.12);
    }

    // Büyüteç / Lazer mutlak değer tarama sesi
    playLaser() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Devir alarmı
    playAlarm() {
        if (this.isMuted) return;
        this.init();
        this.playTone(880, 'square', 0.12, 0.12, 0);
        this.playTone(880, 'square', 0.12, 0.12, 0.18);
    }

    // Terazi sallanma sesi
    playTilt() {
        this.playTone(320, 'triangle', 0.2, 0.15);
    }

    // Bölüm tamamlama kutlaması (Fanfare)
    playFanfare() {
        if (this.isMuted) return;
        this.init();
        const melody = [
            { f: 523.25, d: 0.12, t: 0 },
            { f: 523.25, d: 0.12, t: 0.14 },
            { f: 523.25, d: 0.12, t: 0.28 },
            { f: 659.25, d: 0.35, t: 0.42 },
            { f: 783.99, d: 0.5, t: 0.78 }
        ];
        melody.forEach(item => {
            this.playTone(item.f, 'triangle', item.d, 0.22, item.t);
        });
    }
}

window.soundEngine = new SoundFX();
