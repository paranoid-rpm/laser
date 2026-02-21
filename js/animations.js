// ===== INTERACTIVE LASER BEAM ANIMATION =====
class LaserBeamSimulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 400;
        this.beamOriginX = 80;
        this.beamOriginY = this.height / 2;
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.photons = [];
        this.time = 0;
        this.isRunning = true;

        this.canvas.addEventListener('mousemove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - r.left) * (this.width / r.width);
            this.mouseY = (e.clientY - r.top) * (this.height / r.height);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const r = this.canvas.getBoundingClientRect();
            this.mouseX = (e.touches[0].clientX - r.left) * (this.width / r.width);
            this.mouseY = (e.touches[0].clientY - r.top) * (this.height / r.height);
        }, { passive: false });
        this.canvas.addEventListener('click', () => this.emitBurst());
        this.animate();
    }

    emitBurst() {
        const angle = Math.atan2(this.mouseY - this.beamOriginY, this.mouseX - this.beamOriginX);
        for (let i = 0; i < 20; i++) {
            const spread = (Math.random() - 0.5) * 0.3;
            this.photons.push({
                x: this.beamOriginX + 40, y: this.beamOriginY,
                vx: Math.cos(angle + spread) * (3 + Math.random() * 4),
                vy: Math.sin(angle + spread) * (3 + Math.random() * 4),
                life: 1, decay: 0.008 + Math.random() * 0.008,
                size: 2 + Math.random() * 3, hue: 180 + Math.random() * 40
            });
        }
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.016;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const x = this.beamOriginX, y = this.beamOriginY;
        const angle = Math.atan2(this.mouseY - y, this.mouseX - x);

        // Device
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
        const grad = ctx.createLinearGradient(-30, -20, -30, 20);
        grad.addColorStop(0, '#1a1a3a'); grad.addColorStop(0.5, '#2a2a5a'); grad.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.roundRect(-40, -18, 80, 36, 6); ctx.fill();
        ctx.strokeStyle = '#00f0ff44'; ctx.lineWidth = 1; ctx.stroke();
        const lg = ctx.createRadialGradient(40, 0, 0, 40, 0, 12);
        lg.addColorStop(0, '#00f0ff'); lg.addColorStop(0.5, '#00f0ff88'); lg.addColorStop(1, '#00f0ff00');
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.arc(40, 0, 10 + Math.sin(this.time * 3) * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff2d75'; ctx.beginPath(); ctx.arc(-25, -8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#00ff88'; ctx.beginPath(); ctx.arc(-15, -8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Beam
        const bl = Math.sqrt((this.mouseX - x) ** 2 + (this.mouseY - y) ** 2);
        const endX = x + Math.cos(angle) * bl, endY = y + Math.sin(angle) * bl;
        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(this.time * 10) * 0.2;
        const bg = ctx.createLinearGradient(x, y, endX, endY);
        bg.addColorStop(0, '#00f0ff'); bg.addColorStop(0.8, '#00f0ffaa'); bg.addColorStop(1, '#00f0ff00');
        ctx.strokeStyle = bg; ctx.lineWidth = 3; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50); ctx.lineTo(endX, endY); ctx.stroke();
        ctx.lineWidth = 8; ctx.globalAlpha = 0.15; ctx.stroke();
        ctx.globalAlpha = 0.8;
        const ig = ctx.createRadialGradient(endX, endY, 0, endX, endY, 25);
        ig.addColorStop(0, '#ffffff'); ig.addColorStop(0.3, '#00f0ff'); ig.addColorStop(1, 'transparent');
        ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(endX, endY, 25 + Math.sin(this.time * 8) * 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Auto photon
        if (Math.random() < 0.3) {
            this.photons.push({
                x: x + Math.cos(angle) * 50, y: y + Math.sin(angle) * 50,
                vx: Math.cos(angle) * (4 + Math.random() * 2), vy: Math.sin(angle) * (4 + Math.random() * 2),
                life: 1, decay: 0.015, size: 2 + Math.random() * 2, hue: 180
            });
        }

        // Photons
        this.photons = this.photons.filter(p => p.life > 0);
        this.photons.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.vx *= 0.99; p.vy *= 0.99;
            ctx.save(); ctx.globalAlpha = p.life;
            const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            pg.addColorStop(0, `hsla(${p.hue},100%,80%,1)`); pg.addColorStop(0.5, `hsla(${p.hue},100%,60%,0.5)`);
            pg.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `hsla(${p.hue},100%,90%,${p.life})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = '#00f0ff88'; ctx.font = '12px Orbitron, monospace';
        ctx.fillText('Наведите мышь • Клик для импульса', 10, 20);
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = 400;
        this.beamOriginY = this.height / 2;
    }
    destroy() { this.isRunning = false; }
}

// ===== STIMULATED EMISSION ANIMATION =====
class StimulatedEmissionAnim {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 350;
        this.atoms = [];
        this.photons = [];
        this.time = 0;
        this.isRunning = true;

        for (let i = 0; i < 12; i++) {
            this.atoms.push({
                x: 100 + (i % 4) * (this.width - 200) / 3,
                y: 80 + Math.floor(i / 4) * 100,
                excited: Math.random() > 0.5,
                radius: 20,
                pulsePhase: Math.random() * Math.PI * 2,
                electronAngle: Math.random() * Math.PI * 2
            });
        }

        this.canvas.addEventListener('click', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.photons.push({
                x: (e.clientX - r.left) * (this.width / r.width),
                y: (e.clientY - r.top) * (this.height / r.height),
                vx: 3, vy: 0, wavelength: 0, life: 1, stimulated: false
            });
        });
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.016;
        const ctx = this.ctx;

        // Update
        this.photons = this.photons.filter(p => p.life > 0 && p.x < this.width + 50 && p.x > -50);
        this.photons.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.wavelength += 0.3;
            this.atoms.forEach(a => {
                if (a.excited && !p.stimulated) {
                    const d = Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
                    if (d < a.radius + 15) {
                        a.excited = false; p.stimulated = true;
                        this.photons.push({
                            x: a.x, y: a.y, vx: p.vx, vy: p.vy + (Math.random() - 0.5) * 0.5,
                            wavelength: p.wavelength, life: 1, stimulated: true
                        });
                    }
                }
            });
        });
        this.atoms.forEach(a => {
            if (!a.excited && Math.random() < 0.003) a.excited = true;
            a.electronAngle += a.excited ? 0.05 : 0.02;
            a.pulsePhase += 0.05;
        });

        // Draw
        ctx.clearRect(0, 0, this.width, this.height);
        this.atoms.forEach(a => {
            const pulse = Math.sin(a.pulsePhase) * 3;
            const ng = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius + pulse);
            if (a.excited) { ng.addColorStop(0, '#ff6b00'); ng.addColorStop(0.6, '#ff2d7544'); }
            else { ng.addColorStop(0, '#4466ff'); ng.addColorStop(0.6, '#4466ff44'); }
            ng.addColorStop(1, 'transparent');
            ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(a.x, a.y, a.radius + pulse, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = a.excited ? '#ffaa44' : '#6688ff';
            ctx.beginPath(); ctx.arc(a.x, a.y, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = a.excited ? '#ff6b0044' : '#4466ff44'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(a.x, a.y, a.radius + 5, (a.radius + 5) * 0.4, a.electronAngle, 0, Math.PI * 2); ctx.stroke();
            const ex = a.x + Math.cos(a.electronAngle) * (a.radius + 5);
            const ey = a.y + Math.sin(a.electronAngle) * (a.radius + 5) * 0.4;
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff88'; ctx.font = '10px Orbitron,monospace'; ctx.textAlign = 'center';
            ctx.fillText(a.excited ? 'E₂' : 'E₁', a.x, a.y + a.radius + 20);
        });

        this.photons.forEach(p => {
            ctx.save(); ctx.globalAlpha = p.life;
            const angle = Math.atan2(p.vy, p.vx);
            ctx.translate(p.x, p.y); ctx.rotate(angle);
            ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = -15; i < 15; i++) {
                const wx = i * 2, wy = Math.sin(i * 0.5 + p.wavelength) * 6;
                if (i === -15) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            pg.addColorStop(0, '#fff'); pg.addColorStop(0.5, '#00f0ff'); pg.addColorStop(1, 'transparent');
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = '#00f0ff88'; ctx.font = '12px Orbitron,monospace'; ctx.textAlign = 'left';
        ctx.fillText('Клик — отправить фотон → оранжевые атомы испустят копию', 10, this.height - 15);
        ctx.fillStyle = '#ffaa44'; ctx.beginPath(); ctx.arc(this.width - 200, 20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff88'; ctx.font = '11px Roboto,sans-serif';
        ctx.fillText('Возбуждённый (E₂)', this.width - 188, 24);
        ctx.fillStyle = '#6688ff'; ctx.beginPath(); ctx.arc(this.width - 200, 42, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff88'; ctx.fillText('Основной (E₁)', this.width - 188, 46);

        requestAnimationFrame(() => this.animate());
    }

    resize() { this.width = this.canvas.width = this.canvas.parentElement.clientWidth; }
    destroy() { this.isRunning = false; }
}

// ===== OPTICAL RESONATOR (rewritten — robust) =====
class ResonatorAnim {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 320;
        this.time = 0;
        this.isRunning = true;
        this.packets = [];

        this.leftMirror = 70;
        this.rightMirror = this.width - 70;

        // Seed 3 packets so it's not empty
        for (let i = 0; i < 3; i++) {
            this.packets.push(this._makePacket());
        }

        this.canvas.addEventListener('click', () => {
            for (let i = 0; i < 2; i++) this.packets.push(this._makePacket());
        });

        this._tick();
    }

    _makePacket() {
        return {
            x: this.leftMirror + 30 + Math.random() * 100,
            dir: Math.random() > 0.5 ? 1 : -1,
            amp: 0.25 + Math.random() * 0.4,
            phase: Math.random() * Math.PI * 2,
            speed: 2.2 + Math.random() * 1.2,
            age: 0
        };
    }

    _tick() {
        if (!this.isRunning) return;
        this.time += 0.016;
        const ctx = this.ctx;
        const W = this.width, H = this.height, cy = H / 2;
        const LM = this.leftMirror, RM = this.rightMirror;
        const medL = LM + 80, medR = RM - 80;

        // Update
        this.packets.forEach(p => {
            p.x += p.dir * p.speed;
            p.phase += 0.15;
            p.age += 0.016;

            // Amplify in medium
            if (p.x > medL && p.x < medR) {
                p.amp = Math.min(p.amp * 1.003, 2.0);
            }

            // Bounce off right mirror (partial — lose some)
            if (p.x > RM) {
                p.x = RM;
                p.dir = -1;
                p.amp *= 0.88;
            }
            // Bounce off left mirror (full)
            if (p.x < LM) {
                p.x = LM;
                p.dir = 1;
                p.amp *= 0.96;
            }
        });

        // Kill weak packets, keep max 30
        this.packets = this.packets.filter(p => p.amp > 0.04 && p.age < 30);
        if (this.packets.length > 30) this.packets.splice(0, this.packets.length - 30);

        // Auto-spawn to keep it lively
        if (this.packets.length < 2 && Math.random() < 0.05) {
            this.packets.push(this._makePacket());
        }

        // ---- Draw ----
        ctx.clearRect(0, 0, W, H);

        // Active medium bg
        const mg = ctx.createLinearGradient(medL, 0, medR, 0);
        mg.addColorStop(0, 'rgba(123,47,255,0.04)');
        mg.addColorStop(0.5, 'rgba(123,47,255,0.14)');
        mg.addColorStop(1, 'rgba(123,47,255,0.04)');
        ctx.fillStyle = mg;
        ctx.fillRect(medL, cy - 65, medR - medL, 130);
        ctx.strokeStyle = '#7b2fff33'; ctx.lineWidth = 1;
        ctx.strokeRect(medL, cy - 65, medR - medL, 130);

        ctx.fillStyle = '#7b2fff88'; ctx.font = '11px Orbitron,monospace'; ctx.textAlign = 'center';
        ctx.fillText('АКТИВНАЯ СРЕДА', (medL + medR) / 2, cy - 74);

        // Left mirror
        const lG = ctx.createLinearGradient(LM - 6, 0, LM + 6, 0);
        lG.addColorStop(0, '#445'); lG.addColorStop(0.5, '#99bbdd'); lG.addColorStop(1, '#445');
        ctx.fillStyle = lG;
        ctx.fillRect(LM - 6, cy - 75, 12, 150);
        ctx.fillStyle = '#fff8'; ctx.font = '10px Orbitron,monospace';
        ctx.fillText('R=100%', LM, cy + 95);

        // Right mirror (semi-transparent look)
        ctx.fillStyle = 'rgba(100,130,170,0.25)';
        ctx.fillRect(RM - 6, cy - 75, 12, 150);
        ctx.strokeStyle = '#99bbdd44'; ctx.lineWidth = 1;
        ctx.strokeRect(RM - 6, cy - 75, 12, 150);
        // Dashed lines to show partial transparency
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#99bbdd55'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(RM, cy - 75); ctx.lineTo(RM, cy + 75); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fff8'; ctx.fillText('R≈85%', RM, cy + 95);

        // Draw packets as sine waves bouncing
        this.packets.forEach(p => {
            const amp = p.amp * 28;
            ctx.save();
            ctx.strokeStyle = `rgba(0,240,255,${Math.min(p.amp, 1)})`;
            ctx.lineWidth = 1.2 + p.amp * 1.5;
            ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = p.amp * 12;
            ctx.beginPath();
            for (let i = -18; i <= 18; i++) {
                const wx = p.x + i * 3;
                const wy = cy + Math.sin(i * 0.4 + p.phase) * amp;
                if (i === -18) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            ctx.restore();
        });

        // Output beam on right
        const totalAmp = this.packets.reduce((s, p) => s + p.amp, 0);
        if (totalAmp > 0.15) {
            ctx.save();
            const a = Math.min(totalAmp * 0.25, 0.85);
            const oG = ctx.createLinearGradient(RM, 0, W, 0);
            oG.addColorStop(0, `rgba(0,240,255,${a})`);
            oG.addColorStop(1, 'rgba(0,240,255,0)');
            ctx.strokeStyle = oG; ctx.lineWidth = 2 + totalAmp * 0.8;
            ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 18;
            ctx.beginPath(); ctx.moveTo(RM + 6, cy); ctx.lineTo(W, cy); ctx.stroke();
            ctx.fillStyle = `rgba(0,240,255,${a * 0.6})`;
            ctx.font = '11px Orbitron,monospace'; ctx.textAlign = 'right';
            ctx.fillText('ВЫХОД →', W - 10, cy - 14);
            ctx.restore();
        }

        ctx.fillStyle = '#00f0ff77'; ctx.font = '12px Orbitron,monospace'; ctx.textAlign = 'left';
        ctx.fillText('Клик — добавить фотоны в резонатор', 10, 20);

        requestAnimationFrame(() => this._tick());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.rightMirror = this.width - 70;
    }
    destroy() { this.isRunning = false; }
}

// ===== ENERGY LEVEL DIAGRAM (rewritten — robust) =====
class EnergyLevelDiagram {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 380;
        this.time = 0;
        this.isRunning = true;
        this.photonsOut = [];

        // Levels (y from bottom)
        const H = this.height;
        this.levels = [
            { y: H - 55,  label: 'E₁  основной',      color: '#4488ff' },
            { y: H - 155, label: 'E₂  метастабильный', color: '#ff8844' },
            { y: H - 255, label: 'E₃  накачка',        color: '#ff4488' }
        ];

        // Electrons spread across the width
        this.electrons = [];
        const count = Math.min(10, Math.floor((this.width - 200) / 42));
        const startX = 110;
        const spacing = Math.min(45, (this.width - 260) / count);
        for (let i = 0; i < count; i++) {
            this.electrons.push({
                x: startX + i * spacing,
                level: 0,
                targetLevel: -1,
                tProg: 0,
                timer: 0
            });
        }

        this.canvas.addEventListener('click', () => this._pump());
        this._tick();
    }

    _pump() {
        this.electrons.forEach(e => {
            if (e.level === 0 && e.targetLevel === -1) {
                e.targetLevel = 2;
                e.tProg = 0;
            }
        });
    }

    _tick() {
        if (!this.isRunning) return;
        this.time += 0.016;
        const ctx = this.ctx;
        const W = this.width, H = this.height;

        // Update electrons
        this.electrons.forEach(e => {
            if (e.targetLevel >= 0) {
                e.tProg += 0.025;
                if (e.tProg >= 1) {
                    e.level = e.targetLevel;
                    e.targetLevel = -1;
                    e.tProg = 0;

                    if (e.level === 2) {
                        // Schedule non-radiative decay to E2
                        e.timer = 0.3 + Math.random() * 0.5;
                    } else if (e.level === 1) {
                        // Schedule laser emission to E1
                        e.timer = 0.5 + Math.random() * 1.5;
                    }
                }
            } else if (e.timer > 0) {
                e.timer -= 0.016;
                if (e.timer <= 0) {
                    e.timer = 0;
                    if (e.level === 2) {
                        e.targetLevel = 1; e.tProg = 0;
                    } else if (e.level === 1) {
                        // Emit photon
                        this.photonsOut.push({
                            x: e.x, y: this.levels[1].y,
                            vx: 2.5 + Math.random() * 2,
                            vy: (Math.random() - 0.5) * 1.5,
                            life: 1, phase: 0
                        });
                        e.targetLevel = 0; e.tProg = 0;
                    }
                }
            }
        });

        // Update photons
        this.photonsOut.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.008; p.phase += 0.3;
        });
        this.photonsOut = this.photonsOut.filter(p => p.life > 0 && p.x < W + 50);

        // ---- Draw ----
        ctx.clearRect(0, 0, W, H);

        // Draw levels
        const lineL = 95, lineR = W - 95;
        this.levels.forEach(lv => {
            ctx.strokeStyle = lv.color + '66'; ctx.lineWidth = 2;
            ctx.setLineDash([8, 5]);
            ctx.beginPath(); ctx.moveTo(lineL, lv.y); ctx.lineTo(lineR, lv.y); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = lv.color; ctx.font = '12px Orbitron,monospace'; ctx.textAlign = 'left';
            ctx.fillText(lv.label, 8, lv.y + 5);
        });

        // Arrows on right side
        const arX = W - 55;
        // Pump arrow (E1 → E3)
        this._arrow(ctx, arX, this.levels[0].y - 6, arX, this.levels[2].y + 6, '#ff4488');
        ctx.fillStyle = '#ff448888'; ctx.font = '10px Orbitron,monospace'; ctx.textAlign = 'center';
        ctx.fillText('НАКАЧКА', arX, this.levels[2].y - 10);

        // Non-radiative (E3 → E2, dashed)
        ctx.setLineDash([3, 3]); ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(arX - 20, this.levels[2].y + 6); ctx.lineTo(arX - 20, this.levels[1].y - 6); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff44'; ctx.font = '9px Roboto,sans-serif';
        ctx.fillText('безызлуч.', arX - 20, (this.levels[2].y + this.levels[1].y) / 2 + 4);

        // Laser arrow (E2 → E1)
        this._arrow(ctx, arX - 40, this.levels[1].y + 6, arX - 40, this.levels[0].y - 6, '#00f0ff');
        ctx.fillStyle = '#00f0ff88'; ctx.font = '10px Orbitron,monospace';
        ctx.fillText('ЛАЗЕР', arX - 40, this.levels[0].y + 22);

        // Draw electrons
        this.electrons.forEach(e => {
            let ey;
            if (e.targetLevel >= 0) {
                const fromY = this.levels[e.level].y;
                const toY = this.levels[e.targetLevel].y;
                const t = e.tProg < 0.5 ? 2 * e.tProg * e.tProg : 1 - Math.pow(-2 * e.tProg + 2, 2) / 2;
                ey = fromY + (toY - fromY) * t;
            } else {
                ey = this.levels[e.level].y;
            }

            const glow = ctx.createRadialGradient(e.x, ey - 8, 0, e.x, ey - 8, 14);
            glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.35, '#00f0ff'); glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(e.x, ey - 8, 12, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(e.x, ey - 8, 4, 0, Math.PI * 2); ctx.fill();
        });

        // Draw emitted photons
        this.photonsOut.forEach(p => {
            ctx.save(); ctx.globalAlpha = p.life;
            ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2;
            ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = -10; i <= 10; i++) {
                const wx = p.x + i * 2, wy = p.y + Math.sin(i * 0.5 + p.phase) * 6;
                if (i === -10) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            // core
            const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
            pg.addColorStop(0, '#fff'); pg.addColorStop(0.5, '#00f0ff'); pg.addColorStop(1, 'transparent');
            ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = '#00f0ff77'; ctx.font = '12px Orbitron,monospace'; ctx.textAlign = 'left';
        ctx.fillText('Клик — накачка электронов на верхний уровень', 10, 22);

        requestAnimationFrame(() => this._tick());
    }

    _arrow(ctx, x1, y1, x2, y2, color) {
        ctx.save();
        ctx.strokeStyle = color + '99'; ctx.fillStyle = color + '99'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        const a = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 8 * Math.cos(a - 0.4), y2 - 8 * Math.sin(a - 0.4));
        ctx.lineTo(x2 - 8 * Math.cos(a + 0.4), y2 - 8 * Math.sin(a + 0.4));
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    resize() { this.width = this.canvas.width = this.canvas.parentElement.clientWidth; }
    destroy() { this.isRunning = false; }
}

// ===== 3D-LIKE CARDS =====
function initRotatingCards() {
    document.querySelectorAll('.rotate-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const rx = (e.clientY - r.top - r.height / 2) / 12;
            const ry = (r.width / 2 - (e.clientX - r.left)) / 12;
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
            card.style.transition = 'transform 0.5s ease';
        });
        card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.1s ease'; });
    });
}

// ===== EYE HAZARD (Safety Page) =====
class EyeHazardAnim {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 420;
        this.time = 0; this.isRunning = true;
        this.mx = this.width * 0.6; this.my = this.height * 0.45;
        this.burns = [];

        this.canvas.addEventListener('mousemove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.mx = (e.clientX - r.left) * (this.width / r.width);
            this.my = (e.clientY - r.top) * (this.height / r.height);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const r = this.canvas.getBoundingClientRect();
            this.mx = (e.touches[0].clientX - r.left) * (this.width / r.width);
            this.my = (e.touches[0].clientY - r.top) * (this.height / r.height);
        }, { passive: false });
        this.canvas.addEventListener('click', () => this.pulse());
        this._tick();
    }

    pulse() {
        const hit = this._retina();
        this.burns.push({ x: hit.x, y: hit.y, life: 1, r: 6 + Math.random() * 6 });
        for (let i = 0; i < 14; i++) {
            this.burns.push({
                x: hit.x + (Math.random() - 0.5) * 14, y: hit.y + (Math.random() - 0.5) * 14,
                life: 0.7, r: 2 + Math.random() * 3, spark: true,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2
            });
        }
    }

    _retina() {
        const cx = this.width * 0.55, rx = Math.min(this.width, 900) * 0.33;
        return { x: cx + rx * 0.78, y: this.height * 0.5 };
    }

    _tick() {
        if (!this.isRunning) return;
        this.time += 0.016;
        const ctx = this.ctx, W = this.width, H = this.height;

        this.burns.forEach(b => {
            b.life -= b.spark ? 0.02 : 0.01;
            if (b.spark) { b.x += b.vx; b.y += b.vy; b.vx *= 0.98; b.vy *= 0.98; }
        });
        this.burns = this.burns.filter(b => b.life > 0);

        ctx.clearRect(0, 0, W, H);

        // Vignette
        const vg = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H));
        vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

        // Eye
        const cx = W * 0.55, cy = H * 0.5;
        const rx = Math.min(W, 900) * 0.33, ry = rx * 0.6;

        // Sclera
        const sc = ctx.createRadialGradient(cx - rx * 0.2, cy - ry * 0.2, 10, cx, cy, rx * 1.2);
        sc.addColorStop(0, 'rgba(255,255,255,0.10)'); sc.addColorStop(0.6, 'rgba(255,255,255,0.05)'); sc.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();

        // Lens
        ctx.fillStyle = 'rgba(0,240,255,0.06)'; ctx.strokeStyle = 'rgba(0,240,255,0.18)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx - rx * 0.45, cy, rx * 0.14, ry * 0.22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Cornea
        ctx.strokeStyle = 'rgba(0,240,255,0.12)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx - rx * 0.82, cy, rx * 0.12, ry * 0.44, 0, -0.7, 0.7); ctx.stroke();

        // Retina
        ctx.strokeStyle = 'rgba(255,136,68,0.35)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.96, ry * 0.84, 0, -0.55, 0.55); ctx.stroke();

        // Fovea
        const fx = cx + rx * 0.78, fy = cy;
        const fG = ctx.createRadialGradient(fx, fy, 0, fx, fy, 18);
        fG.addColorStop(0, 'rgba(255,136,68,0.9)'); fG.addColorStop(0.6, 'rgba(255,136,68,0.25)'); fG.addColorStop(1, 'rgba(255,136,68,0)');
        ctx.fillStyle = fG; ctx.beginPath(); ctx.arc(fx, fy, 18 + Math.sin(this.time * 3) * 2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.font = '11px Orbitron,monospace'; ctx.textAlign = 'left';
        ctx.fillText('Хрусталик', cx - rx * 0.65, cy - ry * 0.25);
        ctx.fillText('Сетчатка', cx + rx * 0.45, cy - ry * 0.35);
        ctx.fillText('Фовеа', fx + 10, fy - 8);

        // Beam
        const eX = W * 0.05, eY = H * 0.5;
        const lX = cx - rx * 0.45, lY = cy;
        const tgt = this._retina();
        const tX = tgt.x, tY = tgt.y + (this.my - cy) * 0.35;

        ctx.save(); ctx.globalAlpha = 0.85; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 20;
        let g1 = ctx.createLinearGradient(eX, eY, lX, lY);
        g1.addColorStop(0, 'rgba(0,240,255,0)'); g1.addColorStop(0.2, 'rgba(0,240,255,0.7)'); g1.addColorStop(1, 'rgba(0,240,255,0.25)');
        ctx.strokeStyle = g1; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(eX, eY); ctx.lineTo(lX, lY); ctx.stroke();

        let g2 = ctx.createLinearGradient(lX, lY, tX, tY);
        g2.addColorStop(0, 'rgba(0,240,255,0.35)'); g2.addColorStop(0.65, 'rgba(0,240,255,0.9)'); g2.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.strokeStyle = g2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(lX, lY); ctx.lineTo(tX, tY); ctx.stroke();

        const fg = ctx.createRadialGradient(tX, tY, 0, tX, tY, 22);
        fg.addColorStop(0, 'rgba(255,255,255,0.9)'); fg.addColorStop(0.3, 'rgba(0,240,255,0.85)'); fg.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(tX, tY, 22 + Math.sin(this.time * 6) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Burns
        this.burns.forEach(b => {
            ctx.save(); ctx.globalAlpha = b.life;
            const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 6);
            g.addColorStop(0, b.spark ? 'rgba(255,255,255,0.9)' : 'rgba(255,45,117,0.9)');
            g.addColorStop(0.35, 'rgba(255,45,117,0.55)'); g.addColorStop(1, 'rgba(255,45,117,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 6, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        ctx.fillStyle = 'rgba(0,240,255,0.75)'; ctx.font = '12px Orbitron,monospace'; ctx.textAlign = 'left';
        ctx.fillText('Мышь — управлять фокусом • Клик — импульс', 10, 20);

        requestAnimationFrame(() => this._tick());
    }

    resize() { this.width = this.canvas.width = this.canvas.parentElement.clientWidth; }
    destroy() { this.isRunning = false; }
}

// ===== INIT =====
let activeAnimations = [];

function initAnimations() {
    const ids = [
        ['laserBeamCanvas', LaserBeamSimulator],
        ['stimulatedEmissionCanvas', StimulatedEmissionAnim],
        ['resonatorCanvas', ResonatorAnim],
        ['energyLevelCanvas', EnergyLevelDiagram],
        ['eyeHazardCanvas', EyeHazardAnim]
    ];

    ids.forEach(([id, Cls]) => {
        const el = document.getElementById(id);
        if (el) {
            try {
                const inst = new Cls(el);
                activeAnimations.push(inst);
            } catch (e) {
                console.warn('Animation init error for', id, e);
            }
        }
    });

    initRotatingCards();

    window.addEventListener('resize', () => {
        activeAnimations.forEach(a => { if (a.resize) a.resize(); });
    });
}

document.addEventListener('DOMContentLoaded', initAnimations);
