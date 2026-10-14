// ==========================================================================
// MODÜL 3: RASYONEL TERAZİ VE SIRALAMA ARENASI (MAT.7.1.3)
// Dinamik / Sonsuz Terazi ve Karşılaştırma Üreteci
// ==========================================================================

class ComparisonModule {
    constructor(app) {
        this.app = app;
        this.levels = [];
        this.currentLevelIdx = 0;
        this.userChoice = null;
        this.isEvaluated = false;
    }

    // Her oyunda 5 farklı pedagojik kategoride rastgele rasyonel sayı çifti üretir
    generateDynamicLevels(count = 5) {
        const levels = [];

        // Kategori 1: Payda Eşitlemeli Pozitif Kesirler
        const p1_den1 = [3, 4, 5][Math.floor(Math.random() * 3)];
        const p1_mult = [2, 3][Math.floor(Math.random() * 2)];
        const p1_den2 = p1_den1 * p1_mult;
        const p1_num1 = Math.floor(Math.random() * (p1_den1 - 1)) + 1;
        const p1_num2 = Math.floor(Math.random() * (p1_den2 - 1)) + 1;
        levels.push(this.createComparisonItem(
            p1_num1, p1_den1, p1_num2, p1_den2,
            `Payda Eşitleme: Ortak payda ${p1_den2} yapılarak paylar kıyaslanabilir.`
        ));

        // Kategori 2: Negatif Rasyonel Sayılar (Sayı Doğrusunda Konum)
        const neg_den1 = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
        const neg_den2 = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const neg_num1 = -(Math.floor(Math.random() * (neg_den1 - 1)) + 1);
        const neg_num2 = -(Math.floor(Math.random() * (neg_den2 - 1)) + 1);
        levels.push(this.createComparisonItem(
            neg_num1, neg_den1, neg_num2, neg_den2,
            `Negatif Sayılarda Sayı Doğrusu: 0'a daha yakın (daha sağda) olan sayı daima daha büyüktür.`
        ));

        // Kategori 3: Denk Kesirler (Eşitlik '=')
        const eq_baseNum = Math.floor(Math.random() * 3) + 1;
        const eq_baseDen = eq_baseNum + Math.floor(Math.random() * 3) + 1;
        const eq_mult = [2, 3][Math.floor(Math.random() * 2)];
        levels.push(this.createComparisonItem(
            eq_baseNum, eq_baseDen, eq_baseNum * eq_mult, eq_baseDen * eq_mult,
            `Denk Kesirler: İkinci kesir ${eq_mult} ile sadeleştirilirse ilk kesre eşit olduğu görülür.`
        ));

        // Kategori 4: Bütüne Yakınlık (1 tam olmasına 1 birim kesir kalanlar)
        const dens = [5, 6, 7, 8, 9, 10, 12].sort(() => Math.random() - 0.5);
        const dA = dens[0];
        const dB = dens[1];
        levels.push(this.createComparisonItem(
            dA - 1, dA, dB - 1, dB,
            `Bütüne Yakınlık: Her iki kesrin de 1 tam olmasına 1 birim kesir kalmıştır. Eksikliği daha küçük olan kesir 1'e daha yakındır ve büyüktür.`
        ));

        // Kategori 5: Tam Sayı ile Rasyonel Sayı (Paydası 1 olan rasyonel sayı)
        const intVal = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        const frNum = intVal * 2 + (Math.random() > 0.5 ? 1 : -1);
        levels.push(this.createComparisonItem(
            frNum, 2, intVal, 1,
            `Tam Sayı Dönüşümü: Tam sayılar paydası 1 olan rasyonel sayılardır (${intVal} = ${intVal}/1).`
        ));

        return levels.sort(() => Math.random() - 0.5);
    }

    createComparisonItem(num1, den1, num2, den2, strategyText) {
        const val1 = num1 / den1;
        const val2 = num2 / den2;
        let symbol = '=';
        if (val1 < val2) symbol = '<';
        else if (val1 > val2) symbol = '>';

        return {
            left: { num: num1, den: den1 },
            right: { num: num2, den: den2 },
            correctSymbol: symbol,
            strategy: strategyText,
            leftVal: val1,
            rightVal: val2
        };
    }

    start() {
        this.levels = this.generateDynamicLevels(5);
        this.currentLevelIdx = 0;
        this.loadLevel(this.currentLevelIdx);
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        this.userChoice = null;
        this.isEvaluated = false;
        this.render();
    }

    getCurrentTask() {
        return this.levels[this.currentLevelIdx];
    }

    render() {
        const container = document.getElementById('module3-view');
        if (!container) return;

        const task = this.getCurrentTask();

        container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-back" id="m3-btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Ana Menü
                </button>
                <div class="game-stage-info">
                    <div class="stage-step">BÖLÜM 3 • GÖREV ${this.currentLevelIdx + 1} / ${this.levels.length}</div>
                    <div class="stage-title">Rasyonel Terazi ve Sıralama</div>
                </div>
                <div class="hud-pill stars">
                    <span>🎲 Karşılaştırma ${this.currentLevelIdx + 1}</span>
                </div>
            </div>

            <div class="game-play-area">
                <div class="balance-stage">
                    <div class="balance-svg-wrap">
                        <svg id="m3-balance-svg" viewBox="0 0 600 240" width="100%" height="100%">
                            <polygon points="260,230 340,230 310,90 290,90" fill="#334155" stroke="#475569" stroke-width="2"/>
                            <circle cx="300" cy="90" r="10" fill="#06b6d4"/>

                            <g id="m3-beam-group" class="balance-beam">
                                <line x1="80" y1="90" x2="520" y2="90" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
                                
                                <line x1="120" y1="90" x2="80" y2="160" stroke="#64748b" stroke-width="2"/>
                                <line x1="120" y1="90" x2="160" y2="160" stroke="#64748b" stroke-width="2"/>
                                <path d="M 60 160 Q 120 185 180 160 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
                                
                                <line x1="480" y1="90" x2="440" y2="160" stroke="#64748b" stroke-width="2"/>
                                <line x1="480" y1="90" x2="520" y2="160" stroke="#64748b" stroke-width="2"/>
                                <path d="M 420 160 Q 480 185 540 160 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>

                                <foreignObject x="65" y="105" width="110" height="55">
                                    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; justify-content:center; align-items:center; height:100%; font-size:1.4rem; font-weight:bold; color:#ffffff;">
                                        ${this.formatFractionObj(task.left)}
                                    </div>
                                </foreignObject>

                                <foreignObject x="425" y="105" width="110" height="55">
                                    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex; justify-content:center; align-items:center; height:100%; font-size:1.4rem; font-weight:bold; color:#ffffff;">
                                        ${this.formatFractionObj(task.right)}
                                    </div>
                                </foreignObject>
                            </g>
                        </svg>
                    </div>

                    <div class="symbol-dropzone" id="m3-symbol-slot">
                        ${this.userChoice || '?'}
                    </div>
                </div>

                <div class="step-prompt-box">
                    <strong>Hangi sembol gelmelidir?</strong> Doğru karşılaştırma sembolünü seç ve terazinin dengesini gözlemle!
                </div>

                <div class="comparison-symbols-dock">
                    <button class="symbol-choice-btn" data-sym="<">&lt;</button>
                    <button class="symbol-choice-btn" data-sym="=">=</button>
                    <button class="symbol-choice-btn" data-sym=">">&gt;</button>
                </div>

                <div class="strategy-tips-card" id="m3-strategy-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <div>
                        <div style="font-weight: 800; color: var(--amber); margin-bottom: 2px;">Akıl Yürütme Stratejisi:</div>
                        <div id="m3-strategy-text">${this.isEvaluated ? task.strategy : 'İpucu: Paydaları eşitleyebilir, bütüne yakınlığı inceleyebilir veya sayı doğrusundaki konumlarını düşünebilirsin.'}</div>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    ${this.isEvaluated ? `
                        <button class="action-btn btn-emerald" id="m3-btn-next">
                            ${this.currentLevelIdx + 1 < this.levels.length ? 'Sonraki Karşılaştırma →' : 'Tebrikler! Bölümü Bitir'}
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    formatFractionObj(f) {
        if (f.den === 1) {
            return `<span>${f.num}</span>`;
        }
        const sign = f.num < 0 ? '-' : '';
        const absNum = Math.abs(f.num);
        return `<span>${sign}</span><div class="fraction-box"><span class="numerator">${absNum}</span><span class="denominator">${f.den}</span></div>`;
    }

    bindEvents() {
        document.getElementById('m3-btn-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.app.switchView('menu');
        });

        document.querySelectorAll('.symbol-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sym = e.currentTarget.dataset.sym;
                this.makeChoice(sym);
            });
        });

        document.getElementById('m3-btn-next')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            if (this.currentLevelIdx + 1 < this.levels.length) {
                this.loadLevel(this.currentLevelIdx + 1);
            } else {
                this.app.completeModule('m3', 3);
            }
        });
    }

    makeChoice(sym) {
        if (this.isEvaluated) return;

        const task = this.getCurrentTask();
        this.userChoice = sym;

        const slot = document.getElementById('m3-symbol-slot');
        if (slot) slot.textContent = sym;

        const beam = document.getElementById('m3-beam-group');

        window.soundEngine.playTilt();
        if (task.leftVal > task.rightVal) {
            beam.style.transform = 'rotate(-12deg)';
        } else if (task.leftVal < task.rightVal) {
            beam.style.transform = 'rotate(12deg)';
        } else {
            beam.style.transform = 'rotate(0deg)';
        }

        if (sym === task.correctSymbol) {
            window.soundEngine.playSuccess();
            this.isEvaluated = true;
            slot.style.borderColor = 'var(--emerald)';
            slot.style.color = 'var(--emerald)';
            this.render();
            const beamAfter = document.getElementById('m3-beam-group');
            if (beamAfter) {
                if (task.leftVal > task.rightVal) beamAfter.style.transform = 'rotate(-12deg)';
                else if (task.leftVal < task.rightVal) beamAfter.style.transform = 'rotate(12deg)';
                else beamAfter.style.transform = 'rotate(0deg)';
            }
        } else {
            window.soundEngine.playError();
            slot.style.borderColor = 'var(--rose)';
            slot.style.color = 'var(--rose)';
            setTimeout(() => {
                beam.style.transform = 'rotate(0deg)';
                slot.textContent = '?';
                slot.style.borderColor = 'var(--amber)';
                slot.style.color = 'var(--amber)';
            }, 1000);
        }
    }
}

window.ComparisonModule = ComparisonModule;
