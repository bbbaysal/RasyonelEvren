// ==========================================================================
// MODÜL 4: GERÇEK YAŞAM DEDEKTİFİ (MAT.7.1.4)
// Dinamik / Sonsuz Gerçek Yaşam Problemleri Motoru
// ==========================================================================

class ProblemsModule {
    constructor(app) {
        this.app = app;
        this.problems = [];
        this.currentProblemIdx = 0;
        this.currentStage = 1; // 1: Bileşenler, 2: Modelleme, 3: İşlem, 4: Kontrol
        this.selectedCells = new Set();
    }

    // Her oyunda parametrik ve rastgele problem senaryoları üretir
    generateDynamicProblems(count = 3) {
        const generators = [
            // Şablon 1: Yakıt / Su Deposu (Çıkarma)
            () => {
                const den = [6, 8, 10][Math.floor(Math.random() * 3)];
                const used = Math.floor(Math.random() * 2) + 1; // 1 veya 2
                const init = Math.floor(Math.random() * (den - used - 2)) + used + 2;
                const rem = init - used;

                return {
                    category: "Taşıt ve Yakıt",
                    story: `Bir aracın yakıt deposunun <strong>${init}/${den}</strong>'si doludur. Şehir içi kullanımda deponun <strong>${used}/${den}</strong>'si kadar yakıt tüketilmiştir. Geriye deponun kaçta kaçı kalmıştır?`,
                    step1: {
                        question: "Verilenler ve istenen arasındaki ilişki nedir? Hangi temel işlem yapılmalıdır?",
                        options: [
                            { text: `Tüketim olduğu için çıkarma işlemi (${init}/${den} - ${used}/${den}) yapılmalıdır.`, correct: true },
                            { text: "Depoya yakıt eklendiği için toplama işlemi yapılmalıdır.", correct: false },
                            { text: "Depo büyüdüğü için çarpma işlemi yapılmalıdır.", correct: false }
                        ]
                    },
                    step2: {
                        type: "strip",
                        totalParts: den,
                        targetSelect: init,
                        instruction: `Deponun ${den} eş parçasından ilk doluluk miktarı olan <strong>${init} parçayı</strong> tıkla ve boya!`
                    },
                    step3: {
                        operation: `\\frac{${init}}{${den}} - \\frac{${used}}{${den}} = ?`,
                        question: `Paydalar eşit olduğuna göre paylar çıkarılır: (${init} - ${used}) / ${den} işleminin sonucu nedir?`,
                        options: [`${rem}/${den}`, `${init + used}/${den}`, `${rem}/${den * 2}`, `1/${den}`].sort(() => Math.random() - 0.5),
                        correct: `${rem}/${den}`
                    },
                    step4: {
                        question: `Gerçek Yaşam Kontrolü: Bulduğumuz ${rem}/${den} sonucu neden mantıklıdır?`,
                        options: [
                            { text: `Yakıt harcandığı için kalan miktar (${rem}/${den}), ilk miktardan (${init}/${den}) daha az olmalıdır.`, correct: true },
                            { text: "Yakıt harcandıkça depodaki yakıt miktarı artmalıdır.", correct: false },
                            { text: "Deponun hemen tamamen tükenmesi gerekirdi.", correct: false }
                        ]
                    }
                };
            },

            // Şablon 2: Fırın ve Tarif (Çarpma)
            () => {
                const count = [3, 4, 5][Math.floor(Math.random() * 3)];
                const den = 4;
                const num = 3; // 3/4 paket
                const totalNum = count * num; // örn 12/4 = 3
                const cleanResult = totalNum % den === 0 ? `${totalNum / den} Paket` : `${totalNum}/${den} Paket`;

                return {
                    category: "Mutfak ve Tarif",
                    story: `Bir pastane ustası 1 tepsi kurabiye için <strong>${num}/${den}</strong> paket tereyağı kullanmaktadır. Usta aynı kurabiyeden <strong>${count} tepsi</strong> yaparsa toplam kaç paket tereyağı kullanır?`,
                    step1: {
                        question: "Problemde istenen toplam miktarı bulmak için hangi strateji uygundur?",
                        options: [
                            { text: `Tepsi sayısı ile bir tepsiye düşen miktar çarpılmalıdır (${count} × ${num}/${den}).`, correct: true },
                            { text: "Tepsi sayısından yağ miktarı çıkarılmalıdır.", correct: false },
                            { text: "Tepsi sayısı yağ miktarına bölünmelidir.", correct: false }
                        ]
                    },
                    step2: {
                        type: "strip",
                        totalParts: den,
                        targetSelect: num,
                        instruction: `Bir tepsi için gereken ${num}/${den} birimini modellemek üzere ${den} eş parçadan <strong>${num} tanesini</strong> boya!`
                    },
                    step3: {
                        operation: `${count} \\times \\frac{${num}}{${den}} = ?`,
                        question: `${count} ile ${num}/${den} çarpıldığında toplam tüketilen yağ miktarı ne olur?`,
                        options: [cleanResult, `${count + num}/${den} Paket`, `${totalNum}/${den * 2} Paket`, "1 Paket"].sort(() => Math.random() - 0.5),
                        correct: cleanResult
                    },
                    step4: {
                        question: "Gerçek Yaşam Kontrolü: Çıkan sonuç gerçekçi midir?",
                        options: [
                            { text: `Evet, her tepsi yaklaşık 1 pakete yakın (3/4) olduğu için ${count} tepsi için bulunan sonuç mantıklıdır.`, correct: true },
                            { text: "Hayır, tepsiler arttıkça tüketilen malzeme azalmalıdır.", correct: false }
                        ]
                    }
                };
            },

            // Şablon 3: Kumaş ve Parçalama (Bölme)
            () => {
                const totalM = [6, 8, 9][Math.floor(Math.random() * 3)]; // örn 9/2 = 4.5
                const totalNum = totalM;
                const totalDen = 2; // 9/2 metre
                const pieceNum = 3;
                const pieceDen = 4; // 3/4 metre
                // (totalNum/2) / (3/4) = (totalNum/2) * (4/3) = (totalNum * 2) / 3
                const piecesCount = Math.floor((totalNum * 2) / 3);

                return {
                    category: "Terzi ve Üretim",
                    story: `Bir terzinin elinde <strong>${totalNum}/${totalDen}</strong> metre kumaş vardır. Terzi bu kumaşı <strong>${pieceNum}/${pieceDen}</strong> metrelik masa örtülerine bölecektir. Kaç adet örtü çıkar?`,
                    step1: {
                        question: "Bütün bir parçayı eş küçük parçalara ayırma probleminde hangi işlem kullanılır?",
                        options: [
                            { text: `Toplam uzunluk parça boyutuna bölünmelidir: (${totalNum}/${totalDen} ÷ ${pieceNum}/${pieceDen}).`, correct: true },
                            { text: "Kumaş uzunluğu ile parça boyutu toplanmalıdır.", correct: false },
                            { text: "Kumaş uzunluğu parça boyutuyla çarpılmalıdır.", correct: false }
                        ]
                    },
                    step2: {
                        type: "strip",
                        totalParts: piecesCount,
                        targetSelect: piecesCount,
                        instruction: `Kumaş bölündüğünde elde edilen ${piecesCount} adet parçanın tamamını seçerek modeli tamamla!`
                    },
                    step3: {
                        operation: `\\frac{${totalNum}}{${totalDen}} \\div \\frac{${pieceNum}}{${pieceDen}} = \\frac{${totalNum}}{${totalDen}} \\times \\frac{${pieceDen}}{${pieceNum}} = ?`,
                        question: "Bölme işlemini ters çevirip çarptığımızda kaç adet örtü elde edilir?",
                        options: [`${piecesCount} Adet`, `${piecesCount - 2} Adet`, `${piecesCount + 3} Adet`, "1 Adet"].sort(() => Math.random() - 0.5),
                        correct: `${piecesCount} Adet`
                    },
                    step4: {
                        question: "Gerçek Yaşam Kontrolü: Parçalama işlemi sağlaması neden doğrudur?",
                        options: [
                            { text: `Çünkü bulunan parça sayısı (${piecesCount}) ile parça boyu çarpıldığında ilk kumaş uzunluğunu verir.`, correct: true },
                            { text: "Kumaş kesildikçe toplam kumaş boyu artar.", correct: false }
                        ]
                    }
                };
            }
        ];

        return generators.map(gen => gen()).sort(() => Math.random() - 0.5);
    }

    start() {
        this.problems = this.generateDynamicProblems(3);
        this.currentProblemIdx = 0;
        this.loadProblem(this.currentProblemIdx);
    }

    loadProblem(idx) {
        this.currentProblemIdx = idx;
        this.currentStage = 1;
        this.selectedCells.clear();
        this.render();
    }

    getCurrentProblem() {
        return this.problems[this.currentProblemIdx];
    }

    render() {
        const container = document.getElementById('module4-view');
        if (!container) return;

        const prob = this.getCurrentProblem();

        container.innerHTML = `
            <div class="game-top-bar">
                <button class="btn-back" id="m4-btn-back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Ana Menü
                </button>
                <div class="game-stage-info">
                    <div class="stage-step">BÖLÜM 4 • PROBLEM ${this.currentProblemIdx + 1} / ${this.problems.length}</div>
                    <div class="stage-title">Gerçek Yaşam Dedektifi</div>
                </div>
                <div class="hud-pill stars">
                    <span>🎲 Aşama ${this.currentStage} / 4</span>
                </div>
            </div>

            <div class="game-play-area">
                <div class="problem-card">
                    <div class="problem-context-header">
                        <span class="problem-category-badge">🔎 ${prob.category}</span>
                    </div>
                    <div class="problem-story-text">${prob.story}</div>
                </div>

                <div class="problem-tabs">
                    <button class="problem-tab ${this.currentStage === 1 ? 'active' : ''} ${this.currentStage > 1 ? 'completed' : ''}">1. Bileşenler</button>
                    <button class="problem-tab ${this.currentStage === 2 ? 'active' : ''} ${this.currentStage > 2 ? 'completed' : ''}">2. Görsel Model</button>
                    <button class="problem-tab ${this.currentStage === 3 ? 'active' : ''} ${this.currentStage > 3 ? 'completed' : ''}">3. Strateji & İşlem</button>
                    <button class="problem-tab ${this.currentStage === 4 ? 'active' : ''}">4. Kontrol & Sağlama</button>
                </div>

                <div class="problem-step-panel active">
                    ${this.renderStageContent()}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderStageContent() {
        const prob = this.getCurrentProblem();

        if (this.currentStage === 1) {
            return `
                <div class="step-prompt-box">
                    <strong>Bileşen ve İlişki Analizi:</strong> ${prob.step1.question}
                </div>
                <div class="options-grid" style="grid-template-columns: 1fr;">
                    ${prob.step1.options.map((opt, i) => `
                        <button class="option-btn m4-step1-opt" data-correct="${opt.correct}" style="text-align: left; font-size: 1.05rem; padding: 18px;">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            `;
        } else if (this.currentStage === 2) {
            const step2 = prob.step2;
            return `
                <div class="step-prompt-box">
                    <strong>Görsel Modelleme İstasyonu:</strong> ${step2.instruction}
                </div>
                <div class="fraction-strip-container">
                    <div class="fraction-strip">
                        ${Array.from({ length: step2.totalParts }).map((_, i) => `
                            <div class="fraction-strip-cell ${this.selectedCells.has(i) ? 'selected' : ''}" data-idx="${i}">
                                ${this.selectedCells.has(i) ? '✓' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="text-align: center; margin-top: 18px;">
                    <button class="action-btn btn-primary" id="m4-btn-confirm-model">
                        Modeli Onayla (${this.selectedCells.size} / ${step2.targetSelect})
                    </button>
                </div>
            `;
        } else if (this.currentStage === 3) {
            const step3 = prob.step3;
            return `
                <div class="step-prompt-box">
                    <strong>Matematiksel İşlem:</strong> ${step3.question}
                </div>
                <div class="target-display" style="margin: 20px 0;">
                    <div class="target-fraction" style="font-size: 1.8rem;">
                        ${step3.operation.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2').replace(/\\times/g, '×').replace(/\\div/g, '÷')}
                    </div>
                </div>
                <div class="options-grid">
                    ${step3.options.map(opt => `
                        <button class="option-btn m4-step3-opt" data-val="${opt}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            `;
        } else if (this.currentStage === 4) {
            const step4 = prob.step4;
            return `
                <div class="step-prompt-box">
                    <strong>Kontrol ve Değerlendirme:</strong> ${step4.question}
                </div>
                <div class="options-grid" style="grid-template-columns: 1fr;">
                    ${step4.options.map(opt => `
                        <button class="option-btn m4-step4-opt" data-correct="${opt.correct}" style="text-align: left; font-size: 1.05rem; padding: 18px;">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }
    }

    bindEvents() {
        document.getElementById('m4-btn-back')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.app.switchView('menu');
        });

        if (this.currentStage === 1) {
            document.querySelectorAll('.m4-step1-opt').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const isCorrect = e.currentTarget.dataset.correct === 'true';
                    if (isCorrect) {
                        window.soundEngine.playSuccess();
                        e.currentTarget.style.background = 'var(--emerald)';
                        setTimeout(() => {
                            this.currentStage = 2;
                            this.render();
                        }, 600);
                    } else {
                        window.soundEngine.playError();
                        e.currentTarget.style.background = 'var(--rose)';
                    }
                });
            });
        } else if (this.currentStage === 2) {
            document.querySelectorAll('.fraction-strip-cell').forEach(cell => {
                cell.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.dataset.idx);
                    window.soundEngine.playClick();
                    if (this.selectedCells.has(idx)) {
                        this.selectedCells.delete(idx);
                    } else {
                        this.selectedCells.add(idx);
                    }
                    this.render();
                });
            });

            document.getElementById('m4-btn-confirm-model')?.addEventListener('click', () => {
                const prob = this.getCurrentProblem();
                if (this.selectedCells.size === prob.step2.targetSelect) {
                    window.soundEngine.playSuccess();
                    setTimeout(() => {
                        this.currentStage = 3;
                        this.render();
                    }, 600);
                } else {
                    window.soundEngine.playError();
                }
            });
        } else if (this.currentStage === 3) {
            const prob = this.getCurrentProblem();
            document.querySelectorAll('.m4-step3-opt').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const val = e.currentTarget.dataset.val;
                    if (val === prob.step3.correct) {
                        window.soundEngine.playSuccess();
                        e.currentTarget.style.background = 'var(--emerald)';
                        setTimeout(() => {
                            this.currentStage = 4;
                            this.render();
                        }, 600);
                    } else {
                        window.soundEngine.playError();
                        e.currentTarget.style.background = 'var(--rose)';
                    }
                });
            });
        } else if (this.currentStage === 4) {
            document.querySelectorAll('.m4-step4-opt').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const isCorrect = e.currentTarget.dataset.correct === 'true';
                    if (isCorrect) {
                        window.soundEngine.playSuccess();
                        e.currentTarget.style.background = 'var(--emerald)';
                        setTimeout(() => {
                            if (this.currentProblemIdx + 1 < this.problems.length) {
                                this.loadProblem(this.currentProblemIdx + 1);
                            } else {
                                this.app.completeModule('m4', 3);
                            }
                        }, 700);
                    } else {
                        window.soundEngine.playError();
                        e.currentTarget.style.background = 'var(--rose)';
                    }
                });
            });
        }
    }
}

window.ProblemsModule = ProblemsModule;
