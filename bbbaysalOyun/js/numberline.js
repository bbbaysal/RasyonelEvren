// ==========================================================================
// MODÜL 1: SAYI DOĞRUSU BÜYÜTECİ (MAT.7.1.1)
// Dinamik / Sonsuz Rastgele Soru Motoru
// ==========================================================================

class NumberLineModule {
    constructor(app) {
        this.app = app;
        this.levels = [];
        this.currentLevelIdx = 0;
        this.currentStep = 1; // 1: Tam sayı seçimi, 2: Parçalara bölme, 3: Bayrak dikme, 4: Mutlak Değer
        this.userChosenMinInt = null;
        this.userChosenParts = 0;
        this.userChosenPoint = null;
    }

    // Her oyun başlangıcında yepyeni ve rastgele 5 hedef üretir
    generateDynamicLevels(count = 5) {
        const levels = [];
        const denominators = [2, 3, 4, 5, 6, 8];

        for (let i = 0; i < count; i++) {
            const den = denominators[Math.floor(Math.random() * denominators.length)];
            // -3 ile +2 arasında tam sayı
            const whole = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
            // Pay: 1 ile den - 1 arası
            const rem = Math.floor(Math.random() * (den - 1)) + 1;
            
            let val = 0;
            let num = 0;
            if (whole >= 0) {
                val = whole + (rem / den);
                num = whole * den + rem;
            } else {
                val = whole - (rem / den);
                num = whole * den - rem;
            }

            const minInt = Math.floor(val);
            const maxInt = minInt + 1;

            levels.push({
                num: num,
                den: den,
                whole: whole,
                val: val,
                minInt: minInt,
                maxInt: maxInt,
                explanation: `${minInt} ile ${maxInt} arasındadır.`
            });
        }
        return levels;
    }

    start() {
        this.levels = this.generateDynamicLevels(5);
        this.currentLevelIdx = 0;
        this.loadLevel(this.currentLevelIdx);
    }

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        this.currentStep = 1;
        this.userChosenMinInt = null;
        this.userChosenParts = 0;
        this.userChosenPoint = null;
        this.render();
    }

    getCurrentTask() {
        return this.levels[this.currentLevelIdx];
    }

    render() {
        const container = document.getElementById('module1-view');
        if (!container) return;

        const task = this.getCurrentTask();
        const fractionHtml = this.formatFraction(task);

        container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-back" id="m1-btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Ana Menü
                </button>
                <div class="game-stage-info">
                    <div class="stage-step">BÖLÜM 1 • HEDEF ${this.currentLevelIdx + 1} / ${this.levels.length} (ADIM ${this.currentStep}/4)</div>
                    <div class="stage-title">Sayı Doğrusu Büyüteci</div>
                </div>
                <div class="hud-pill stars">
                    <span>🎲 Rastgele Görev ${this.currentLevelIdx + 1}</span>
                </div>
            </div>

            <div class="game-play-area">
                <div class="target-display">
                    <span class="target-badge">HEDEF RASYONEL SAYI</span>
                    <div class="target-fraction">${fractionHtml}</div>
                </div>

                <div class="step-prompt-box" id="m1-step-prompt">
                    ${this.getStepPromptText()}
                </div>

                <div class="numberline-canvas-wrap" id="m1-canvas-wrap">
                    <svg class="numberline-svg" id="m1-svg" viewBox="0 0 800 180"></svg>
                </div>

                <div class="numberline-controls" id="m1-controls">
                    ${this.renderControlsHtml()}
                </div>
            </div>
        `;

        this.bindEvents();
        this.drawNumberLine();
    }

    formatFraction(task) {
        const sign = task.val < 0 ? "-" : "";
        const absNum = Math.abs(task.num);
        const absWhole = Math.abs(task.whole);
        const remNum = absNum % task.den;

        if (absWhole > 0 && remNum > 0) {
            return `<span>${sign}${absWhole}</span><div class="fraction-box"><span class="numerator">${remNum}</span><span class="denominator">${task.den}</span></div>`;
        } else {
            return `<span>${sign}</span><div class="fraction-box"><span class="numerator">${absNum}</span><span class="denominator">${task.den}</span></div>`;
        }
    }

    getStepPromptText() {
        const task = this.getCurrentTask();
        if (this.currentStep === 1) {
            return `<strong>1. Adım:</strong> Bu rasyonel sayı hangi iki ardışık tam sayı arasındadır? Doğru aralığı seç!`;
        } else if (this.currentStep === 2) {
            return `<strong>2. Adım (Büyüteç):</strong> [${task.minInt}, ${task.maxInt}] aralığına yaklaştık. Payda <strong>${task.den}</strong> olduğu için bu aralığı kaç eş parçaya böleceksin?`;
        } else if (this.currentStep === 3) {
            return `<strong>3. Adım:</strong> Sayı doğrusu ${task.den} parçaya bölündü! Hedef noktanın üzerine tıkla ve bayrağını dik.`;
        } else if (this.currentStep === 4) {
            const absVal = Math.abs(task.val);
            return `<strong>4. Adım (Mutlak Değer):</strong> Lazerle 0'a olan uzaklık ölçüldü: |Hedef Sayı| = ${absVal.toFixed(2)} birim uzaklıktadır. Mutlak değer daima pozitiftir!`;
        }
    }

    renderControlsHtml() {
        const task = this.getCurrentTask();
        if (this.currentStep === 1) {
            // Dinamik şık üretimi
            const options = [
                { min: task.minInt, max: task.maxInt, correct: true },
                { min: task.minInt - 1, max: task.minInt, correct: false },
                { min: task.maxInt, max: task.maxInt + 1, correct: false },
                { min: 0, max: 1, correct: (task.minInt === 0 && task.maxInt === 1) }
            ];
            // Benzersiz yap ve karıştır
            const uniqueOptions = [];
            const seen = new Set();
            options.forEach(opt => {
                const key = `${opt.min}_${opt.max}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueOptions.push(opt);
                }
            });
            uniqueOptions.sort(() => Math.random() - 0.5);

            return `
                <div class="options-grid">
                    ${uniqueOptions.map(opt => `
                        <button class="option-btn m1-int-choice" data-min="${opt.min}" data-max="${opt.max}">
                            ${opt.min} ile ${opt.max}
                        </button>
                    `).join('')}
                </div>
            `;
        } else if (this.currentStep === 2) {
            const choices = [task.den, task.den + 1, Math.max(2, task.den - 1), task.den + 2]
                .filter((v, i, a) => a.indexOf(v) === i)
                .sort(() => Math.random() - 0.5);
            return `
                <div class="options-grid">
                    ${choices.map(c => `
                        <button class="option-btn m1-parts-choice" data-parts="${c}">
                            ${c} Eş Parça
                        </button>
                    `).join('')}
                </div>
            `;
        } else if (this.currentStep === 3) {
            return `
                <div style="color: var(--cyan); font-weight: 700; text-align: center; font-size: 1.1rem;">
                    🎯 Sayı doğrusu üzerindeki doğru noktaya tıkla veya dokun!
                </div>
            `;
        } else if (this.currentStep === 4) {
            return `
                <button class="action-btn btn-emerald" id="m1-btn-next-level">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ${this.currentLevelIdx + 1 < this.levels.length ? 'Harika! Sonraki Rastgele Hedefe Geç →' : 'Tebrikler! Bölümü Tamamla 🏆'}
                </button>
            `;
        }
    }

    bindEvents() {
        document.getElementById('m1-btn-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.app.switchView('menu');
        });

        if (this.currentStep === 1) {
            document.querySelectorAll('.m1-int-choice').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const min = parseInt(e.currentTarget.dataset.min);
                    const max = parseInt(e.currentTarget.dataset.max);
                    this.checkStep1(min, max, e.currentTarget);
                });
            });
        } else if (this.currentStep === 2) {
            document.querySelectorAll('.m1-parts-choice').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const parts = parseInt(e.currentTarget.dataset.parts);
                    this.checkStep2(parts, e.currentTarget);
                });
            });
        } else if (this.currentStep === 4) {
            document.getElementById('m1-btn-next-level')?.addEventListener('click', () => {
                window.soundEngine.playClick();
                if (this.currentLevelIdx + 1 < this.levels.length) {
                    this.loadLevel(this.currentLevelIdx + 1);
                } else {
                    this.app.completeModule('m1', 3);
                }
            });
        }
    }

    checkStep1(min, max, btnElement) {
        const task = this.getCurrentTask();
        if (min === task.minInt && max === task.maxInt) {
            window.soundEngine.playSuccess();
            btnElement.style.background = 'var(--emerald)';
            btnElement.style.borderColor = '#ffffff';
            this.userChosenMinInt = min;
            setTimeout(() => {
                this.currentStep = 2;
                this.render();
            }, 600);
        } else {
            window.soundEngine.playError();
            btnElement.style.background = 'var(--rose)';
            setTimeout(() => {
                btnElement.style.background = '';
            }, 700);
        }
    }

    checkStep2(parts, btnElement) {
        const task = this.getCurrentTask();
        if (parts === task.den) {
            window.soundEngine.playSuccess();
            btnElement.style.background = 'var(--emerald)';
            this.userChosenParts = parts;
            setTimeout(() => {
                this.currentStep = 3;
                this.render();
            }, 600);
        } else {
            window.soundEngine.playError();
            btnElement.style.background = 'var(--rose)';
            setTimeout(() => {
                btnElement.style.background = '';
            }, 700);
        }
    }

    onPointClicked(pointIndex) {
        const task = this.getCurrentTask();
        const targetVal = task.val;
        const clickedVal = task.minInt + (pointIndex / task.den);

        if (Math.abs(targetVal - clickedVal) < 0.001) {
            window.soundEngine.playSuccess();
            this.userChosenPoint = pointIndex;
            setTimeout(() => {
                this.currentStep = 4;
                window.soundEngine.playLaser();
                this.render();
            }, 500);
        } else {
            window.soundEngine.playError();
        }
    }

    drawNumberLine() {
        const svg = document.getElementById('m1-svg');
        if (!svg) return;

        svg.innerHTML = '';
        const task = this.getCurrentTask();
        const width = 800;
        const lineY = 90;

        if (this.currentStep === 1) {
            // Geniş görünüm: -4'ten +4'e kadar tam sayılar
            const min = -4;
            const max = 4;
            const stepX = (width - 100) / (max - min);

            // Ana hat
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '30');
            line.setAttribute('y1', lineY);
            line.setAttribute('x2', `${width - 30}`);
            line.setAttribute('y2', lineY);
            line.setAttribute('stroke', '#64748b');
            line.setAttribute('stroke-width', '4');
            svg.appendChild(line);

            this.drawArrow(svg, 30, lineY, 'left');
            this.drawArrow(svg, width - 30, lineY, 'right');

            for (let i = min; i <= max; i++) {
                const x = 50 + (i - min) * stepX;
                const isZero = i === 0;

                const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                tick.setAttribute('x1', x);
                tick.setAttribute('y1', isZero ? lineY - 20 : lineY - 12);
                tick.setAttribute('x2', x);
                tick.setAttribute('y2', isZero ? lineY + 20 : lineY + 12);
                tick.setAttribute('stroke', isZero ? '#06b6d4' : '#cbd5e1');
                tick.setAttribute('stroke-width', isZero ? '4' : '2');
                svg.appendChild(tick);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', lineY + 36);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', isZero ? '#06b6d4' : '#f8fafc');
                text.setAttribute('font-size', isZero ? '18' : '15');
                text.setAttribute('font-weight', isZero ? '800' : '600');
                text.textContent = `${i}`;
                svg.appendChild(text);
            }
        } else {
            // Adım 2, 3, 4: Yakınlaştırılmış Büyüteç Görünümü
            const padding = 100;
            const startX = padding;
            const endX = width - padding;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', startX - 20);
            rect.setAttribute('y', '30');
            rect.setAttribute('width', endX - startX + 40);
            rect.setAttribute('height', '120');
            rect.setAttribute('rx', '14');
            rect.setAttribute('fill', 'rgba(6, 182, 212, 0.05)');
            rect.setAttribute('stroke', 'rgba(6, 182, 212, 0.3)');
            rect.setAttribute('stroke-dasharray', '6 6');
            svg.appendChild(rect);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', startX - 40);
            line.setAttribute('y1', lineY);
            line.setAttribute('x2', endX + 40);
            line.setAttribute('y2', lineY);
            line.setAttribute('stroke', '#06b6d4');
            line.setAttribute('stroke-width', '5');
            svg.appendChild(line);

            const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            minLabel.setAttribute('x', startX);
            minLabel.setAttribute('y', lineY + 45);
            minLabel.setAttribute('text-anchor', 'middle');
            minLabel.setAttribute('fill', '#ffffff');
            minLabel.setAttribute('font-size', '24');
            minLabel.setAttribute('font-weight', '900');
            minLabel.textContent = `${task.minInt}`;
            svg.appendChild(minLabel);

            const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            maxLabel.setAttribute('x', endX);
            maxLabel.setAttribute('y', lineY + 45);
            maxLabel.setAttribute('text-anchor', 'middle');
            maxLabel.setAttribute('fill', '#ffffff');
            maxLabel.setAttribute('font-size', '24');
            maxLabel.setAttribute('font-weight', '900');
            maxLabel.textContent = `${task.maxInt}`;
            svg.appendChild(maxLabel);

            this.drawBigTick(svg, startX, lineY);
            this.drawBigTick(svg, endX, lineY);

            if (this.currentStep >= 3) {
                const parts = task.den;
                const partWidth = (endX - startX) / parts;

                for (let i = 1; i < parts; i++) {
                    const x = startX + i * partWidth;
                    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    tick.setAttribute('x1', x);
                    tick.setAttribute('y1', lineY - 14);
                    tick.setAttribute('x2', x);
                    tick.setAttribute('y2', lineY + 14);
                    tick.setAttribute('stroke', '#38bdf8');
                    tick.setAttribute('stroke-width', '3');
                    svg.appendChild(tick);
                }

                for (let i = 0; i <= parts; i++) {
                    const x = startX + i * partWidth;
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    g.style.cursor = 'pointer';

                    const touchArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    touchArea.setAttribute('cx', x);
                    touchArea.setAttribute('cy', lineY);
                    touchArea.setAttribute('r', '24');
                    touchArea.setAttribute('fill', 'transparent');
                    g.appendChild(touchArea);

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', x);
                    circle.setAttribute('cy', lineY);
                    circle.setAttribute('r', (this.userChosenPoint === i) ? '10' : '6');
                    circle.setAttribute('fill', (this.userChosenPoint === i) ? '#10b981' : '#f8fafc');
                    circle.setAttribute('stroke', '#0284c7');
                    circle.setAttribute('stroke-width', '2');
                    g.appendChild(circle);

                    g.addEventListener('click', () => {
                        if (this.currentStep === 3) {
                            this.onPointClicked(i);
                        }
                    });

                    svg.appendChild(g);
                }

                if (this.currentStep === 4 && this.userChosenPoint !== null) {
                    const flagX = startX + this.userChosenPoint * partWidth;
                    this.drawFlag(svg, flagX, lineY - 6);

                    const laser = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const d = `M ${startX} 50 Q ${(startX + flagX) / 2} 30, ${flagX} 50`;
                    laser.setAttribute('d', d);
                    laser.setAttribute('fill', 'none');
                    laser.setAttribute('stroke', '#f59e0b');
                    laser.setAttribute('stroke-width', '3');
                    laser.setAttribute('stroke-dasharray', '5 5');
                    svg.appendChild(laser);

                    const absText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    absText.setAttribute('x', `${(startX + flagX) / 2}`);
                    absText.setAttribute('y', '25');
                    absText.setAttribute('text-anchor', 'middle');
                    absText.setAttribute('fill', '#f59e0b');
                    absText.setAttribute('font-size', '14');
                    absText.setAttribute('font-weight', 'bold');
                    absText.textContent = `| Uzaklık | = ${Math.abs(task.val).toFixed(2)} br`;
                    svg.appendChild(absText);
                }
            }
        }
    }

    drawBigTick(svg, x, y) {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', x);
        tick.setAttribute('y1', y - 24);
        tick.setAttribute('x2', x);
        tick.setAttribute('y2', y + 24);
        tick.setAttribute('stroke', '#ffffff');
        tick.setAttribute('stroke-width', '4');
        svg.appendChild(tick);
    }

    drawArrow(svg, x, y, dir) {
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        if (dir === 'left') {
            poly.setAttribute('points', `${x},${y} ${x + 12},${y - 8} ${x + 12},${y + 8}`);
        } else {
            poly.setAttribute('points', `${x},${y} ${x - 12},${y - 8} ${x - 12},${y + 8}`);
        }
        poly.setAttribute('fill', '#64748b');
        svg.appendChild(poly);
    }

    drawFlag(svg, x, y) {
        const pole = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pole.setAttribute('x1', x);
        pole.setAttribute('y1', y);
        pole.setAttribute('x2', x);
        pole.setAttribute('y2', y - 48);
        pole.setAttribute('stroke', '#10b981');
        pole.setAttribute('stroke-width', '3');
        svg.appendChild(pole);

        const flag = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        flag.setAttribute('points', `${x},${y - 48} ${x + 28},${y - 36} ${x},${y - 24}`);
        flag.setAttribute('fill', '#10b981');
        svg.appendChild(flag);
    }
}

window.NumberLineModule = NumberLineModule;
