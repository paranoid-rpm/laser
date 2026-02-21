// ===== INTERACTIVE LASER BEAM ANIMATION =====
class LaserBeamSimulator {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 400;
        this.isDragging = false;
        this.beamAngle = 0;
        this.beamOriginX = 80;
        this.beamOriginY = this.height / 2;
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.photons = [];
        this.time = 0;
        this.isRunning = true;

        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('click', () => this.emitBurst());

        this.animate();
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    onTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.touches[0].clientX - rect.left;
        this.mouseY = e.touches[0].clientY - rect.top;
    }

    emitBurst() {
        for (let i = 0; i < 20; i++) {
            const angle = Math.atan2(this.mouseY - this.beamOriginY, this.mouseX - this.beamOriginX);
            const spread = (Math.random() - 0.5) * 0.3;
            this.photons.push({
                x: this.beamOriginX + 40,
                y: this.beamOriginY,
                vx: Math.cos(angle + spread) * (3 + Math.random() * 4),
                vy: Math.sin(angle + spread) * (3 + Math.random() * 4),
                life: 1,
                decay: 0.008 + Math.random() * 0.008,
                size: 2 + Math.random() * 3,
                hue: 180 + Math.random() * 40
            });
        }
    }

    drawLaserDevice() {
        const ctx = this.ctx;
        const x = this.beamOriginX;
        const y = this.beamOriginY;
        const angle = Math.atan2(this.mouseY - y, this.mouseX - x);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Body
        const grad = ctx.createLinearGradient(-30, -20, -30, 20);
        grad.addColorStop(0, '#1a1a3a');
        grad.addColorStop(0.5, '#2a2a5a');
        grad.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-40, -18, 80, 36, 6);
        ctx.fill();
        ctx.strokeStyle = '#00f0ff44';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Lens
        const lensGrad = ctx.createRadialGradient(40, 0, 0, 40, 0, 12);
        lensGrad.addColorStop(0, '#00f0ff');
        lensGrad.addColorStop(0.5, '#00f0ff88');
        lensGrad.addColorStop(1, '#00f0ff00');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(40, 0, 10 + Math.sin(this.time * 3) * 2, 0, Math.PI * 2);
        ctx.fill();

        // Power indicator
        ctx.fillStyle = '#ff2d75';
        ctx.beginPath();
        ctx.arc(-25, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(-15, -8, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Main beam
        const beamLength = Math.sqrt((this.mouseX - x) ** 2 + (this.mouseY - y) ** 2);
        const endX = x + Math.cos(angle) * beamLength;
        const endY = y + Math.sin(angle) * beamLength;

        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(this.time * 10) * 0.2;
        const beamGrad = ctx.createLinearGradient(x, y, endX, endY);
        beamGrad.addColorStop(0, '#00f0ff');
        beamGrad.addColorStop(0.8, '#00f0ffaa');
        beamGrad.addColorStop(1, '#00f0ff00');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Glow beam
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.15;
        ctx.stroke();

        // Impact point
        ctx.globalAlpha = 0.8;
        const impactGrad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 25);
        impactGrad.addColorStop(0, '#ffffff');
        impactGrad.addColorStop(0.3, '#00f0ff');
        impactGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.arc(endX, endY, 25 + Math.sin(this.time * 8) * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Auto-emit photons
        if (this.time % 3 < 1) {
            this.photons.push({
                x: x + Math.cos(angle) * 50,
                y: y + Math.sin(angle) * 50,
                vx: Math.cos(angle) * (4 + Math.random() * 2),
                vy: Math.sin(angle) * (4 + Math.random() * 2),
                life: 1,
                decay: 0.015,
                size: 2 + Math.random() * 2,
                hue: 180
            });
        }
    }

    updatePhotons() {
        this.photons = this.photons.filter(p => p.life > 0);
        this.photons.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.99;
            p.vy *= 0.99;
        });
    }

    drawPhotons() {
        const ctx = this.ctx;
        this.photons.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            grad.addColorStop(0, `hsla(${p.hue}, 100%, 80%, 1)`);
            grad.addColorStop(0.5, `hsla(${p.hue}, 100%, 60%, 0.5)`);
            grad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    drawInfo() {
        const ctx = this.ctx;
        ctx.fillStyle = '#00f0ff88';
        ctx.font = '12px Orbitron, monospace';
        ctx.fillText('Наведите мышь для управления лучом • Клик для импульса', 10, 20);
    }

    animate() {
        if (!this.isRunning) return;
        this.time += 0.016;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.drawLaserDevice();
        this.updatePhotons();
        this.drawPhotons();
        this.drawInfo();

        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = 400;
        this.beamOriginY = this.height / 2;
    }

    destroy() {
        this.isRunning = false;
    }
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

        // Create atoms
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

        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.animate();
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Emit photon from click position
        this.photons.push({
            x: mx,
            y: my,
            vx: 3,
            vy: 0,
            wavelength: 0,
            life: 1,
            stimulated: false
        });
    }

    update() {
        this.time += 0.016;

        // Update photons
        this.photons = this.photons.filter(p => p.life > 0 && p.x < this.width + 50 && p.x > -50);
        this.photons.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.wavelength += 0.3;

            // Check collision with excited atoms
            this.atoms.forEach(a => {
                if (a.excited) {
                    const dx = p.x - a.x;
                    const dy = p.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < a.radius + 15 && !p.stimulated) {
                        // Stimulated emission!
                        a.excited = false;
                        p.stimulated = true;
                        // Emit identical photon
                        this.photons.push({
                            x: a.x,
                            y: a.y,
                            vx: p.vx,
                            vy: p.vy + (Math.random() - 0.5) * 0.5,
                            wavelength: p.wavelength,
                            life: 1,
                            stimulated: true
                        });
                    }
                }
            });
        });

        // Randomly re-excite atoms (pumping)
        this.atoms.forEach(a => {
            if (!a.excited && Math.random() < 0.003) {
                a.excited = true;
            }
            a.electronAngle += a.excited ? 0.05 : 0.02;
            a.pulsePhase += 0.05;
        });
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw atoms
        this.atoms.forEach(a => {
            const pulse = Math.sin(a.pulsePhase) * 3;

            // Nucleus
            const nucGrad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius + pulse);
            if (a.excited) {
                nucGrad.addColorStop(0, '#ff6b00');
                nucGrad.addColorStop(0.6, '#ff2d7544');
                nucGrad.addColorStop(1, 'transparent');
            } else {
                nucGrad.addColorStop(0, '#4466ff');
                nucGrad.addColorStop(0.6, '#4466ff44');
                nucGrad.addColorStop(1, 'transparent');
            }
            ctx.fillStyle = nucGrad;
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.radius + pulse, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = a.excited ? '#ffaa44' : '#6688ff';
            ctx.beginPath();
            ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Electron orbits
            ctx.strokeStyle = a.excited ? '#ff6b0044' : '#4466ff44';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(a.x, a.y, a.radius + 5, (a.radius + 5) * 0.4, a.electronAngle, 0, Math.PI * 2);
            ctx.stroke();

            // Electron
            const ex = a.x + Math.cos(a.electronAngle) * (a.radius + 5);
            const ey = a.y + Math.sin(a.electronAngle) * (a.radius + 5) * 0.4;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex, ey, 3, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = '#ffffff88';
            ctx.font = '10px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(a.excited ? 'E₂' : 'E₁', a.x, a.y + a.radius + 20);
        });

        // Draw photons as wave packets
        this.photons.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            const angle = Math.atan2(p.vy, p.vx);

            ctx.translate(p.x, p.y);
            ctx.rotate(angle);

            // Wave
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = -15; i < 15; i++) {
                const wx = i * 2;
                const wy = Math.sin(i * 0.5 + p.wavelength) * 6;
                if (i === -15) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();

            // Photon core
            const pg = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
            pg.addColorStop(0, '#ffffff');
            pg.addColorStop(0.5, '#00f0ff');
            pg.addColorStop(1, 'transparent');
            ctx.fillStyle = pg;
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Instructions
        ctx.fillStyle = '#00f0ff88';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Клик — отправить фотон → оранжевые атомы испустят копию', 10, this.height - 15);

        // Legend
        ctx.fillStyle = '#ffaa44';
        ctx.beginPath(); ctx.arc(this.width - 200, 20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff88';
        ctx.font = '11px Roboto, sans-serif';
        ctx.fillText('Возбуждённый (E₂)', this.width - 188, 24);

        ctx.fillStyle = '#6688ff';
        ctx.beginPath(); ctx.arc(this.width - 200, 42, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff88';
        ctx.fillText('Основной (E₁)', this.width - 188, 46);
    }

    animate() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
    }

    destroy() { this.isRunning = false; }
}

// ===== OPTICAL RESONATOR ANIMATION =====
class ResonatorAnim {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 300;
        this.photonPackets = [];
        this.time = 0;
        this.gain = 0.7;
        this.isRunning = true;

        // Mirrors
        this.leftMirror = 60;
        this.rightMirror = this.width - 60;

        // Seed photon
        this.addPacket();

        this.canvas.addEventListener('click', () => this.addPacket());
        this.animate();
    }

    addPacket() {
        this.photonPackets.push({
            x: this.leftMirror + 20,
            direction: 1,
            amplitude: 0.3 + Math.random() * 0.3,
            phase: 0,
            bounces: 0
        });
    }

    update() {
        this.time += 0.016;

        this.photonPackets.forEach(p => {
            p.x += p.direction * 3;
            p.phase += 0.2;

            // Amplification in active medium
            const medLeft = this.leftMirror + 80;
            const medRight = this.rightMirror - 80;
            if (p.x > medLeft && p.x < medRight) {
                p.amplitude = Math.min(p.amplitude * 1.002, 1.5);
            }

            // Right mirror (partially transparent — output)
            if (p.x >= this.rightMirror) {
                p.direction = -1;
                p.bounces++;
                p.amplitude *= 0.85; // reflection loss
            }

            // Left mirror (fully reflective)
            if (p.x <= this.leftMirror) {
                p.direction = 1;
                p.bounces++;
                p.amplitude *= 0.95;
            }
        });

        // Remove dead packets
        this.photonPackets = this.photonPackets.filter(p => p.amplitude > 0.05 && p.bounces < 50);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        const cy = this.height / 2;

        // Active medium
        const medLeft = this.leftMirror + 80;
        const medRight = this.rightMirror - 80;
        const medGrad = ctx.createLinearGradient(medLeft, 0, medRight, 0);
        medGrad.addColorStop(0, 'rgba(123, 47, 255, 0.05)');
        medGrad.addColorStop(0.5, 'rgba(123, 47, 255, 0.15)');
        medGrad.addColorStop(1, 'rgba(123, 47, 255, 0.05)');
        ctx.fillStyle = medGrad;
        ctx.fillRect(medLeft, cy - 60, medRight - medLeft, 120);
        ctx.strokeStyle = '#7b2fff44';
        ctx.lineWidth = 1;
        ctx.strokeRect(medLeft, cy - 60, medRight - medLeft, 120);

        // Label
        ctx.fillStyle = '#7b2fff88';
        ctx.font = '11px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('АКТИВНАЯ СРЕДА', (medLeft + medRight) / 2, cy - 68);

        // Left mirror (full)
        const lmGrad = ctx.createLinearGradient(this.leftMirror - 8, 0, this.leftMirror + 8, 0);
        lmGrad.addColorStop(0, '#334');
        lmGrad.addColorStop(0.5, '#88aacc');
        lmGrad.addColorStop(1, '#334');
        ctx.fillStyle = lmGrad;
        ctx.fillRect(this.leftMirror - 6, cy - 70, 12, 140);
        ctx.fillStyle = '#ffffff66';
        ctx.font = '10px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Зеркало', this.leftMirror, cy + 90);
        ctx.fillText('R=100%', this.leftMirror, cy + 104);

        // Right mirror (partial)
        const rmGrad = ctx.createLinearGradient(this.rightMirror - 8, 0, this.rightMirror + 8, 0);
        rmGrad.addColorStop(0, '#334');
        rmGrad.addColorStop(0.5, '#66889966');
        rmGrad.addColorStop(1, '#33400');
        ctx.fillStyle = rmGrad;
        ctx.fillRect(this.rightMirror - 6, cy - 70, 12, 140);
        ctx.strokeStyle = '#88aacc44';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.rightMirror - 6, cy - 70, 12, 140);
        ctx.fillStyle = '#ffffff66';
        ctx.fillText('Выходное', this.rightMirror, cy + 90);
        ctx.fillText('зеркало R≈85%', this.rightMirror, cy + 104);

        // Draw photon packets
        this.photonPackets.forEach(p => {
            const amp = p.amplitude * 30;
            ctx.save();
            ctx.strokeStyle = `rgba(0, 240, 255, ${Math.min(p.amplitude, 1)})`;
            ctx.lineWidth = 1.5 + p.amplitude;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = p.amplitude * 10;

            ctx.beginPath();
            for (let i = -20; i < 20; i++) {
                const wx = p.x + i * 3;
                const wy = cy + Math.sin(i * 0.4 + p.phase) * amp;
                if (i === -20) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            ctx.restore();
        });

        // Output beam (right side)
        const totalAmp = this.photonPackets.reduce((s, p) => s + p.amplitude, 0);
        if (totalAmp > 0.2) {
            ctx.save();
            const outGrad = ctx.createLinearGradient(this.rightMirror, 0, this.width, 0);
            outGrad.addColorStop(0, `rgba(0, 240, 255, ${Math.min(totalAmp * 0.3, 0.8)})`);
            outGrad.addColorStop(1, 'transparent');
            ctx.strokeStyle = outGrad;
            ctx.lineWidth = 2 + totalAmp;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(this.rightMirror + 6, cy);
            ctx.lineTo(this.width, cy);
            ctx.stroke();

            ctx.fillStyle = '#00f0ff44';
            ctx.font = '11px Orbitron, monospace';
            ctx.textAlign = 'right';
            ctx.fillText('ВЫХОД →', this.width - 10, cy - 15);
            ctx.restore();
        }

        // Instructions
        ctx.fillStyle = '#00f0ff66';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Клик — добавить фотон в резонатор', 10, 20);
    }

    animate() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.rightMirror = this.width - 60;
    }

    destroy() { this.isRunning = false; }
}

// ===== ENERGY LEVEL DIAGRAM (Interactive) =====
class EnergyLevelDiagram {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = canvas.parentElement.clientWidth;
        this.height = canvas.height = 350;
        this.time = 0;
        this.isRunning = true;
        this.electrons = [];
        this.photonsEmitted = [];
        this.mode = '4level'; // '3level' or '4level'

        // Energy levels
        this.levels = [
            { y: this.height - 60, label: 'E₁ (основной)', color: '#4488ff' },
            { y: this.height - 140, label: 'E₂ (метастабильный)', color: '#ff8844' },
            { y: this.height - 220, label: 'E₃ (накачка)', color: '#ff4488' },
        ];

        // Place electrons on ground state
        for (let i = 0; i < 8; i++) {
            this.electrons.push({
                x: 120 + i * 40,
                level: 0,
                targetLevel: 0,
                transitioning: false,
                transProgress: 0
            });
        }

        this.canvas.addEventListener('click', () => this.pumpAll());
        this.animate();
    }

    pumpAll() {
        // Pump ground state electrons to level 3
        this.electrons.forEach(e => {
            if (e.level === 0 && !e.transitioning) {
                e.targetLevel = 2;
                e.transitioning = true;
                e.transProgress = 0;
            }
        });
    }

    update() {
        this.time += 0.016;

        this.electrons.forEach(e => {
            if (e.transitioning) {
                e.transProgress += 0.03;
                if (e.transProgress >= 1) {
                    e.level = e.targetLevel;
                    e.transitioning = false;
                    e.transProgress = 0;

                    // Auto transitions
                    if (e.level === 2) {
                        // Fast non-radiative to metastable
                        setTimeout(() => {
                            if (e.level === 2) {
                                e.targetLevel = 1;
                                e.transitioning = true;
                                e.transProgress = 0;
                            }
                        }, 300 + Math.random() * 500);
                    } else if (e.level === 1) {
                        // Stimulated/spontaneous emission to ground
                        setTimeout(() => {
                            if (e.level === 1) {
                                e.targetLevel = 0;
                                e.transitioning = true;
                                e.transProgress = 0;
                                // Emit photon
                                this.photonsEmitted.push({
                                    x: e.x,
                                    y: this.levels[1].y,
                                    vx: 3 + Math.random() * 2,
                                    vy: (Math.random() - 0.5) * 2,
                                    life: 1,
                                    phase: 0
                                });
                            }
                        }, 500 + Math.random() * 1500);
                    }
                }
            }
        });

        // Update emitted photons
        this.photonsEmitted.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01;
            p.phase += 0.3;
        });
        this.photonsEmitted = this.photonsEmitted.filter(p => p.life > 0 && p.x < this.width + 50);
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw energy levels
        this.levels.forEach((lvl, i) => {
            ctx.strokeStyle = lvl.color + '88';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(80, lvl.y);
            ctx.lineTo(this.width - 80, lvl.y);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = lvl.color;
            ctx.font = '12px Orbitron, monospace';
            ctx.textAlign = 'right';
            ctx.fillText(lvl.label, 75, lvl.y + 4);
        });

        // Draw transition arrows
        // Pump arrow
        ctx.strokeStyle = '#ff448888';
        ctx.lineWidth = 2;
        this.drawArrow(ctx, this.width - 60, this.levels[0].y, this.width - 60, this.levels[2].y, '#ff4488', 'Накачка ↑');

        // Non-radiative
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#ffffff44';
        ctx.beginPath();
        ctx.moveTo(this.width - 40, this.levels[2].y);
        ctx.lineTo(this.width - 40, this.levels[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff66';
        ctx.font = '10px Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Безызлучат.', this.width - 36, (this.levels[2].y + this.levels[1].y) / 2 + 4);

        // Laser transition
        this.drawArrow(ctx, this.width - 20, this.levels[1].y, this.width - 20, this.levels[0].y, '#00f0ff', 'Лазер ↓');

        // Draw electrons
        this.electrons.forEach(e => {
            let ey;
            if (e.transitioning) {
                const fromY = this.levels[e.level].y;
                const toY = this.levels[e.targetLevel].y;
                ey = fromY + (toY - fromY) * this.easeInOut(e.transProgress);
            } else {
                ey = this.levels[e.level].y;
            }

            // Electron glow
            const eg = ctx.createRadialGradient(e.x, ey - 8, 0, e.x, ey - 8, 12);
            eg.addColorStop(0, '#ffffff');
            eg.addColorStop(0.4, '#00f0ff');
            eg.addColorStop(1, 'transparent');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.arc(e.x, ey - 8, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(e.x, ey - 8, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw emitted photons
        this.photonsEmitted.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            for (let i = -8; i < 8; i++) {
                const wx = p.x + i * 2;
                const wy = p.y + Math.sin(i * 0.5 + p.phase) * 5;
                if (i === -8) ctx.moveTo(wx, wy);
                else ctx.lineTo(wx, wy);
            }
            ctx.stroke();
            ctx.restore();
        });

        // Instructions
        ctx.fillStyle = '#00f0ff66';
        ctx.font = '12px Orbitron, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Клик — накачка электронов на верхний уровень', 10, 20);
    }

    drawArrow(ctx, x1, y1, x2, y2, color, label) {
        ctx.save();
        ctx.strokeStyle = color + '88';
        ctx.fillStyle = color + '88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - 5);
        ctx.lineTo(x2, y2 + 5);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath();
        ctx.moveTo(x2, y2 + 5);
        ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 + 5 - 6 * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 + 5 - 6 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    animate() {
        if (!this.isRunning) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    resize() {
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
    }

    destroy() { this.isRunning = false; }
}

// ===== LASER TYPE COMPARISON 3D-LIKE CARDS =====
function initRotatingCards() {
    document.querySelectorAll('.rotate-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 12;
            const rotateY = (centerX - x) / 12;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });
}

// ===== INIT ALL ON PAGE LOAD =====
let activeAnimations = [];

function initAnimations() {
    // Laser beam simulator
    const beamCanvas = document.getElementById('laserBeamCanvas');
    if (beamCanvas) {
        const sim = new LaserBeamSimulator(beamCanvas);
        activeAnimations.push(sim);
    }

    // Stimulated emission
    const stimCanvas = document.getElementById('stimulatedEmissionCanvas');
    if (stimCanvas) {
        const stim = new StimulatedEmissionAnim(stimCanvas);
        activeAnimations.push(stim);
    }

    // Resonator
    const resCanvas = document.getElementById('resonatorCanvas');
    if (resCanvas) {
        const res = new ResonatorAnim(resCanvas);
        activeAnimations.push(res);
    }

    // Energy levels
    const elvlCanvas = document.getElementById('energyLevelCanvas');
    if (elvlCanvas) {
        const elvl = new EnergyLevelDiagram(elvlCanvas);
        activeAnimations.push(elvl);
    }

    // Rotating cards
    initRotatingCards();

    // Resize handler
    window.addEventListener('resize', () => {
        activeAnimations.forEach(a => {
            if (a.resize) a.resize();
        });
    });
}

document.addEventListener('DOMContentLoaded', initAnimations);
