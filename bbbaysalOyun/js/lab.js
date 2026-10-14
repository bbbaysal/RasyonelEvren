// ==========================================================================
// MODÜL 2: ONDALIK VE DEVİR LABORATUVARI (MAT.7.1.2)
// Dinamik / Sonsuz Bölme ve Devir Algoritması Motoru
// ==========================================================================

class DecimalLabModule {
    constructor(app) {
        this.app = app;
        this.levels = [];
        this.currentLevelIdx = 0;
        this.currentStepIdx = 0;
        this.stage = 'division'; // 'division', 'alarm', 'periodBar', 'classify'
        this.selectedPeriodIndexes = new Set();
    }

    // Dinamik kesir ve tam uzun bölme hesaplama motoru
    generateDynamicLevels(count = 5) {
        const terminatingDens = [2, 4, 5, 8, 10, 20, 25];
        const repeatingDens = [3, 6, 7, 9, 11, 12, 15];
        const levels = [];

        for (let i = 0; i < count; i++) {
            // Sonlu ve Devirlileri sırayla veya dengeli üret
            const isRepeatingTarget = (i % 2 === 1);
            let num, den;

            if (isRepeatingTarget) {
                den = repeatingDens[Math.floor(Math.random() * repeatingDens.length)];
                // Basit kesir (1 ile den-1 arası)
                num = Math.floor(Math.random() * (den - 1)) + 1;
                // Eğer sadeleşip sonlu oluyorsa yeniden seç
                while (den % num === 0 && num !== 1) {
                    num = Math.floor(Math.random() * (den - 1)) + 1;
                }
            } else {
                den = terminatingDens[Math.floor(Math.random() * terminatingDens.length)];
                num = Math.floor(Math.random() * (den - 1)) + 1;
            }

            const simData = this.simulateLongDivision(num, den);
            levels.push(simData);
        }
        return levels;
    }

    // Gerçek Uzun Bölme Adımlarını, Kalanları ve Devir Basamaklarını Simüle Eden Algoritma
    simulateLongDivision(num, den) {
        const steps = [];
        const seenRemainders = new Map(); // remainder -> stepIndex
        let currentDividend = num * 10;
        let currentQuotient = "0,";
        let isRepeating = false;
        let periodStartStep = -1;
        let periodDigits = [];

        steps.push({
            desc: `${num}'nin içinde ${den} olmadığı için bölüme 0, yazarız ve ${num}'nin yanına 0 ekleriz (${num * 10}).`,
            currentDividend: currentDividend,
            quotient: "0,",
            rem: null
        });

        let rem = num;
        let stepCount = 0;
        const maxSteps = 5;

        while (stepCount < maxSteps) {
            stepCount++;
            const digit = Math.floor(currentDividend / den);
            const product = digit * den;
            rem = currentDividend % den;
            currentQuotient += digit;

            if (rem === 0) {
                steps.push({
                    desc: `${currentDividend} içinde ${den} -> ${digit} kere vardır (${digit} x ${den} = ${product}). Kalan: 0! Bölme işlemi bitti.`,
                    currentDividend: currentDividend,
                    factor: digit,
                    product: product,
                    quotient: currentQuotient,
                    rem: 0
                });
                isRepeating = false;
                break;
            }

            if (seenRemainders.has(rem)) {
                // Devir tespit edildi!
                isRepeating = true;
                periodStartStep = seenRemainders.get(rem);
                currentQuotient += "...";
                steps.push({
                    desc: `${currentDividend} içinde ${den} -> ${digit} kere (${product}). Kalan yine ${rem}! Aynı kalanlar tekrar ediyor.`,
                    currentDividend: currentDividend,
                    factor: digit,
                    product: product,
                    quotient: currentQuotient,
                    rem: rem
                });
                break;
            }

            seenRemainders.set(rem, stepCount);
            steps.push({
                desc: `${currentDividend} içinde ${den} -> ${digit} kere vardır (${digit} x ${den} = ${product}). Kalan: ${rem}.`,
                currentDividend: currentDividend,
                factor: digit,
                product: product,
                quotient: currentQuotient,
                rem: rem
            });

            currentDividend = rem * 10;
        }

        // Eğer 5 adımda bitmediyse ve sonlu değilse devirli sayalım
        if (rem !== 0 && !isRepeating) {
            isRepeating = true;
        }

        // Ekranda gösterilecek karakter dizisi (Örn: ['0', ',', '3'] veya ['0', ',', '8', '3'])
        // Devirli ise en az bir periyot basamağı
        const displayChars = currentQuotient.replace('...', '').split('');
        const targetPeriodIndices = new Set();

        if (isRepeating) {
            // Son eklenen rakamı veya tekrar eden grubu hedef yapalım
            const lastIdx = displayChars.length - 1;
            targetPeriodIndices.add(lastIdx);
        }

        return {
            num: num,
            den: den,
            isRepeating: isRepeating,
            steps: steps,
            displayChars: displayChars,
            targetPeriodIndices: targetPeriodIndices,
            finalResult: currentQuotient,
            type: isRepeating ? "Devirli Ondalık" : "Sonlu (Devirsiz)"
        };
    }

    start() {
        this.levels = this.generateDynamicLevels(5);
        this.currentLevelIdx = 0;
        this.loadLevel(this.currentLevelIdx);
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        this.currentStepIdx = 0;
        this.stage = 'division';
        this.selectedPeriodIndexes.clear();
        this.render();
    }

    getCurrentTask() {
        return this.levels[this.currentLevelIdx];
    }

    render() {
        const container = document.getElementById('module2-view');
        if (!container) return;

        const task = this.getCurrentTask();

        container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-back" id="m2-btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Ana Menü
                </button>
                <div class="game-stage-info">
                    <div class="stage-step">BÖLÜM 2 • GÖREV ${this.currentLevelIdx + 1} / ${this.levels.length}</div>
                    <div class="stage-title">Ondalık ve Devir Laboratuvarı</div>
                </div>
                <div class="hud-pill stars">
                    <span>🎲 Görev ${this.currentLevelIdx + 1}</span>
                </div>
            </div>

            <div class="game-play-area">
                <div class="target-display">
                    <span class="target-badge">RASYONEL SAYI İNCELEMESİ</span>
                    <div class="target-fraction">
                        <div class="fraction-box">
                            <span class="numerator">${task.num}</span>
                            <span class="denominator">${task.den}</span>
                        </div>
                    </div>
                </div>

                <div class="lab-container">
                    <!-- Sol Taraf: Uzun Bölme Tahtası -->
                    <div class="division-board" id="m2-division-board">
                        <div class="division-header-wrap">
                            <span style="color: var(--cyan); font-weight: bold;">${task.num}</span>
                            <span style="color: var(--text-muted);">÷</span>
                            <span style="color: var(--primary); font-weight: bold;">${task.den}</span>
                            <span>=</span>
                            <span id="m2-quotient-display" style="color: var(--emerald); font-weight: bold;">
                                ${this.getCurrentQuotient()}
                            </span>
                        </div>

                        <div id="m2-steps-log">
                            ${this.renderStepsLog()}
                        </div>

                        <div class="remainder-alert" id="m2-remainder-alert">
                            <div style="font-weight: 900; font-size: 1.15rem; margin-bottom: 6px;">⚠️ DİKKAT: DEVİR ALARMI!</div>
                            <div>Kalan tekrar etti! Bölme işlemi sonsuza kadar aynı rakamları üretecektir.</div>
                        </div>
                    </div>

                    <!-- Sağ Taraf: Laboratuvar Kontrol Paneli -->
                    <div class="lab-tools-panel">
                        <div class="step-prompt-box" id="m2-prompt">
                            ${this.getPromptText()}
                        </div>

                        <div id="m2-interactive-controls">
                            ${this.renderInteractiveControls()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    getCurrentQuotient() {
        const task = this.getCurrentTask();
        if (this.currentStepIdx === 0) return "?";
        return task.steps[Math.min(this.currentStepIdx - 1, task.steps.length - 1)].quotient;
    }

    renderStepsLog() {
        const task = this.getCurrentTask();
        let html = '';
        for (let i = 0; i < this.currentStepIdx; i++) {
            const step = task.steps[i];
            html += `
                <div class="division-step-row" style="animation: fadeIn 0.3s ease;">
                    <span style="color: var(--cyan); font-weight: bold;">[Adım ${i + 1}]</span>
                    <span>${step.desc}</span>
                </div>
            `;
        }
        return html;
    }

    getPromptText() {
        const task = this.getCurrentTask();
        if (this.stage === 'division') {
            return `Payı (${task.num}) paydaya (${task.den}) bölmek için <strong>"Bölme Adımını Çalıştır"</strong> butonuna bas ve kalanları gözlemle.`;
        } else if (this.stage === 'alarm') {
            return `Bölme işleminde kalan tekrar etti! Bu rasyonel sayının ondalık açılımı devirlidir.`;
        } else if (this.stage === 'periodBar') {
            return `Aşağıdaki sayının <strong>devreden (sürekli tekrarlayan) rakamına</strong> dokunarak üstüne Devir Çizgisi yerleştir!`;
        } else if (this.stage === 'classify') {
            return `Sonuç olarak bu rasyonel sayının ondalık gösterim türü nedir?`;
        }
    }

    renderInteractiveControls() {
        const task = this.getCurrentTask();
        if (this.stage === 'division') {
            return `
                <button class="action-btn btn-cyan" id="m2-btn-step" style="width: 100%;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Bölme Adımını İlerlet
                </button>
            `;
        } else if (this.stage === 'alarm') {
            return `
                <button class="action-btn btn-amber" id="m2-btn-to-bar" style="width: 100%;">
                    Devir Çizgisi Aracını Aç →
                </button>
            `;
        } else if (this.stage === 'periodBar') {
            const rawChars = task.displayChars;

            return `
                <div class="repeating-bar-tool">
                    ${rawChars.map((ch, idx) => `
                        <span class="repeating-digit ${this.selectedPeriodIndexes.has(idx) ? 'active-period' : ''}" data-idx="${idx}">
                            ${ch}
                        </span>
                    `).join('')}
                </div>
                <div style="font-size: 0.9rem; color: var(--text-secondary); text-align: center; margin-bottom: 16px;">
                    (Devreden rakamın üstüne tıklayarak devir çizgisini çek)
                </div>
                <button class="action-btn btn-primary" id="m2-btn-confirm-bar" style="width: 100%;">
                    Çizgiyi Onayla
                </button>
            `;
        } else if (this.stage === 'classify') {
            return `
                <div class="options-grid">
                    <button class="option-btn m2-classify-btn" data-type="Sonlu (Devirsiz)">
                        Sonlu (Devirsiz) Ondalık
                    </button>
                    <button class="option-btn m2-classify-btn" data-type="Devirli Ondalık">
                        Devirli Ondalık
                    </button>
                </div>
            `;
        }
    }

    bindEvents() {
        document.getElementById('m2-btn-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.app.switchView('menu');
        });

        if (this.stage === 'division') {
            document.getElementById('m2-btn-step')?.addEventListener('click', () => {
                this.advanceDivisionStep();
            });
        } else if (this.stage === 'alarm') {
            document.getElementById('m2-btn-to-bar')?.addEventListener('click', () => {
                window.soundEngine.playClick();
                this.stage = 'periodBar';
                this.render();
            });
        } else if (this.stage === 'periodBar') {
            document.querySelectorAll('.repeating-digit').forEach(elem => {
                elem.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.dataset.idx);
                    window.soundEngine.playClick();
                    if (this.selectedPeriodIndexes.has(idx)) {
                        this.selectedPeriodIndexes.delete(idx);
                    } else {
                        this.selectedPeriodIndexes.add(idx);
                    }
                    this.render();
                });
            });

            document.getElementById('m2-btn-confirm-bar')?.addEventListener('click', () => {
                this.checkPeriodBar();
            });
        } else if (this.stage === 'classify') {
            document.querySelectorAll('.m2-classify-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = e.currentTarget.dataset.type;
                    this.checkClassify(type, e.currentTarget);
                });
            });
        }
    }

    advanceDivisionStep() {
        const task = this.getCurrentTask();
        window.soundEngine.playClick();

        if (this.currentStepIdx < task.steps.length) {
            this.currentStepIdx++;
            this.render();

            if (this.currentStepIdx === task.steps.length) {
                if (task.isRepeating) {
                    window.soundEngine.playAlarm();
                    setTimeout(() => {
                        this.stage = 'alarm';
                        this.render();
                        const alertBoxAfter = document.getElementById('m2-remainder-alert');
                        if (alertBoxAfter) alertBoxAfter.style.display = 'block';
                    }, 400);
                } else {
                    window.soundEngine.playSuccess();
                    setTimeout(() => {
                        this.stage = 'classify';
                        this.render();
                    }, 600);
                }
            }
        }
    }

    checkPeriodBar() {
        const task = this.getCurrentTask();
        let isCorrect = false;

        // Seçilen indekslerden en az biri doğru devir hedefinde mi
        task.targetPeriodIndices.forEach(targetIdx => {
            if (this.selectedPeriodIndexes.has(targetIdx)) {
                isCorrect = true;
            }
        });

        if (isCorrect && this.selectedPeriodIndexes.size > 0) {
            window.soundEngine.playSuccess();
            setTimeout(() => {
                this.stage = 'classify';
                this.render();
            }, 600);
        } else {
            window.soundEngine.playError();
        }
    }

    checkClassify(selectedType, btnElement) {
        const task = this.getCurrentTask();
        if (selectedType === task.type) {
            window.soundEngine.playSuccess();
            btnElement.style.background = 'var(--emerald)';
            setTimeout(() => {
                if (this.currentLevelIdx + 1 < this.levels.length) {
                    this.loadLevel(this.currentLevelIdx + 1);
                } else {
                    this.app.completeModule('m2', 3);
                }
            }, 700);
        } else {
            window.soundEngine.playError();
            btnElement.style.background = 'var(--rose)';
            setTimeout(() => {
                btnElement.style.background = '';
            }, 700);
        }
    }
}

window.DecimalLabModule = DecimalLabModule;
