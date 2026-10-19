// Scene 03: KESSLER WATCH // CONJUNCTION DESK (JEV LEO Orbital Collision Avoidance)
const WIDTH = 1080;
const HEIGHT = 1350;
const MONO = '"SFMono-Regular", Consolas, "Liberation Mono", monospace';

const fract = x => x - Math.floor(x);
const rand = seed => fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453123);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const RADAR_SITES = [
  { name: 'KIRUNA', tag: 'RADAR', coords: '67.8°N 20.2°E', obs: 19, sigma: 33 },
  { name: 'ATACAMA', tag: 'OPTICAL', coords: '24.6°S 70.4°W', obs: 28, sigma: 32 },
  { name: 'PALAU', tag: 'RADAR', coords: '7.4°N 134.5°E', obs: 29, sigma: 29 },
  { name: 'MT STROMLO', tag: 'LASER', coords: '35.3°S 149.0°E', obs: 17, sigma: 27 },
];

const CONJUNCTIONS = [
  { tca: 'T-00:48', sat: 'KW-5A', deb: 'NOAA 16 DEB 19213', miss: 1835, sigma: 105, pc: '<1e-10', state: 'BURN DONE', col: '#34d399' },
  { tca: 'T-01:38', sat: 'KW-3B', deb: 'COSMOS-1408 DEB 14950', miss: 1409, sigma: 201, pc: '<1e-10', state: 'MONITOR', col: '#64748b' },
  { tca: 'T-02:56', sat: 'KW-4G', deb: 'SL-16 R/B 36945', miss: 1407, sigma: 306, pc: '1.3e-8', state: 'MONITOR', col: '#64748b' },
  { tca: 'T-04:11', sat: 'KW-2B', deb: 'SL-8 R/B 16224', miss: 267, sigma: 174, pc: '5.1e-4', state: 'MANEUVER REQ', col: '#f43f5e' },
  { tca: 'T-05:15', sat: 'KW-2A', deb: 'SL-16 R/B 22350', miss: 1524, sigma: 384, pc: '1.3e-7', state: 'MONITOR', col: '#64748b' },
  { tca: 'T-06:17', sat: 'KW-3E', deb: 'H-2A DEB 13893', miss: 1832, sigma: 423, pc: '2.4e-8', state: 'MONITOR', col: '#64748b' },
  { tca: 'T-07:29', sat: 'KW-2A', deb: 'SL-8 R/B 37946', miss: 1745, sigma: 343, pc: '1.0e-9', state: 'MONITOR', col: '#64748b' },
  { tca: 'T-08:48', sat: 'KW-4A', deb: 'IRIDIUM 33 DEB 31860', miss: 666, sigma: 297, pc: '4.6e-5', state: 'WATCH', col: '#f59e0b' },
  { tca: 'T-09:44', sat: 'KW-4B', deb: 'COSMOS-2251 DEB 24345', miss: 1866, sigma: 445, pc: '3.8e-8', state: 'MONITOR', col: '#64748b' },
];

export class KesslerOrbitalScene {
  constructor() {
    this.duration = 32;
  }

  font(ctx, size = 11, weight = 400) {
    ctx.font = `${weight} ${size}px ${MONO}`;
  }

  text(ctx, str, x, y, color = '#e2e8f0', size = 11, weight = 400, align = 'left') {
    this.font(ctx, size, weight);
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(String(str), x, y);
    ctx.textAlign = 'left';
  }

  panel(ctx, x, y, w, h, title, rightBadge = '', accent = '#f97316') {
    ctx.fillStyle = '#0b0f15';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#111722';
    ctx.fillRect(x + 1, y + 1, w - 2, 24);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    // Corner orange triangle marker
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + 1); ctx.lineTo(x + 10, y + 1); ctx.lineTo(x + 1, y + 10);
    ctx.closePath(); ctx.fill();
    this.text(ctx, title, x + 14, y + 17, '#e2e8f0', 11.5, 700);
    if (rightBadge) {
      this.text(ctx, rightBadge, x + w - 10, y + 17, '#94a3b8', 9.5, 600, 'right');
    }
  }

  render(ctx, state) {
    const t = Number(state.elapsed) || 0;
    const progress = clamp(t / this.duration, 0, 1);
    const burnTriggered = progress > 0.42;

    ctx.fillStyle = '#06080c';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 1. Top Command Header Bar
    ctx.fillStyle = '#0d121a';
    ctx.fillRect(8, 6, WIDTH - 16, 32);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(8.5, 6.5, WIDTH - 17, 31);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(14, 11, 210, 22);
    this.text(ctx, 'KESSLER WATCH', 22, 26, '#080b10', 12, 700);
    this.text(ctx, 'CONJUNCTION DESK', 125, 26, '#271206', 9.5, 700);

    const topStats = [
      ['TRACKED OBJECTS', (31290 + Math.floor(t * 0.4)).toLocaleString(), '#e2e8f0', 265],
      ['CONSTELLATION', '48 / 48', '#38bdf8', 385],
      ['CDMs · 24H', String(223 + Math.floor(progress * 8)), '#f97316', 485],
      ['MANEUVERS · 24H', burnTriggered ? '5' : '4', '#34d399', 575],
      ['Kp INDEX', '3+', '#38bdf8', 675],
    ];
    for (const [k, v, col, x] of topStats) {
      this.text(ctx, k, x, 16, '#64748b', 7.5, 600);
      this.text(ctx, v, x, 31, col, 12, 700);
    }
    // Active Alert badge
    ctx.fillStyle = 'rgba(244, 63, 94, 0.16)';
    ctx.strokeStyle = '#f43f5e';
    ctx.fillRect(745, 11, 108, 22);
    ctx.strokeRect(745.5, 11.5, 107, 21);
    this.text(ctx, burnTriggered ? '2 ACTIVE ALERTS' : '1 ACTIVE ALERT', 799, 25, '#fb7185', 9.5, 700, 'center');

    const sec = Math.floor(13 * 3600 + 52 * 60 + t * 20);
    const hh = String(Math.floor(sec / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    this.text(ctx, `${hh}:${mm}:${ss} UTC`, WIDTH - 18, 27, '#e2e8f0', 13, 700, 'right');

    // 2. Left Column: SENSOR NET (4 radar scopes) + DEBRIS BAND
    this.panel(ctx, 8, 44, 248, 392, 'SENSOR NET', '4 SITES');
    RADAR_SITES.forEach((site, idx) => {
      const sy = 76 + idx * 88;
      ctx.fillStyle = '#0e141d';
      ctx.fillRect(16, sy, 232, 80);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(16.5, sy + 0.5, 231, 79);

      // Polar Radar Scope
      const rcx = 48, rcy = sy + 40, rr = 24;
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath(); ctx.arc(rcx, rcy, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(rcx, rcy, rr * 0.55, 0, Math.PI * 2); ctx.stroke();
      const sweep = state.reducedMotion ? idx : t * (1.6 + idx * 0.25) + idx * 1.4;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.beginPath();
      ctx.moveTo(rcx, rcy);
      ctx.arc(rcx, rcy, rr, sweep - 0.55, sweep);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath(); ctx.moveTo(rcx, rcy); ctx.lineTo(rcx + Math.cos(sweep) * rr, rcy + Math.sin(sweep) * rr); ctx.stroke();

      this.text(ctx, site.name, 82, sy + 18, '#e2e8f0', 10.5, 700);
      this.text(ctx, site.tag, 158, sy + 18, '#38bdf8', 8.5, 700);
      this.text(ctx, site.coords, 82, sy + 32, '#64748b', 8.5);
      this.text(ctx, `${site.obs + Math.floor(Math.sin(t + idx) * 2)} obs/min   σ ${site.sigma} m`, 82, sy + 48, '#cbd5e1', 9.5, 600);
      this.text(ctx, 'TRACK → CDM', 82, sy + 66, '#38bdf8', 8.5);
    });

    // DEBRIS BAND histogram
    this.panel(ctx, 8, 444, 248, 222, 'DEBRIS BAND', 'LEO · 800 km');
    for (let i = 0; i < 28; i++) {
      const alt = 300 + i * 32;
      const peak800 = Math.exp(-((alt - 790) ** 2) / 14000) * 115;
      const peak550 = Math.exp(-((alt - 550) ** 2) / 6000) * 48;
      const bh = clamp(8 + peak800 + peak550 + rand(i + 7) * 14, 6, 128);
      const bx = 20 + i * 8.1;
      const by = 612 - bh;
      const isKwShell = Math.abs(alt - 550) < 42;
      ctx.fillStyle = isKwShell ? '#38bdf8' : alt > 720 && alt < 880 ? '#ea580c' : '#9a3412';
      ctx.fillRect(bx, by, 6, bh);
    }
    this.text(ctx, 'KW ORBIT · 550 km', 96, 488, '#38bdf8', 9.5, 700);
    this.text(ctx, 'IN BAND 1,486   CROSSING 23   FRAGMENTS 3,612', 18, 652, '#94a3b8', 8.5, 600);

    // 3. Center 3D ORBITAL PICTURE Globe (`x = 264, y = 44, w = 540, h = 622`)
    this.panel(ctx, 264, 44, 540, 622, 'ORBITAL PICTURE', 'KW constellation · 6 planes × 8 · 550 km · 53°');
    const gcx = 534, gcy = 365, gr = 232;
    const rot = state.reducedMotion ? 0.6 : t * 0.22;

    // Subtle atmosphere radial glow
    const atmo = ctx.createRadialGradient(gcx, gcy, gr * 0.4, gcx, gcy, gr * 1.08);
    atmo.addColorStop(0, 'rgba(14, 165, 233, 0.03)');
    atmo.addColorStop(0.85, 'rgba(14, 165, 233, 0.08)');
    atmo.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = atmo;
    ctx.beginPath(); ctx.arc(gcx, gcy, gr * 1.08, 0, Math.PI * 2); ctx.fill();

    // Globe outer limb
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(gcx, gcy, gr, 0, Math.PI * 2); ctx.stroke();

    // Latitude / Longitude wireframe graticule
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.13)';
    ctx.lineWidth = 0.7;
    for (let lat = -60; lat <= 60; lat += 30) {
      const rLat = Math.cos(lat * Math.PI / 180) * gr;
      const yLat = gcy + Math.sin(lat * Math.PI / 180) * gr * 0.92;
      ctx.beginPath();
      ctx.ellipse(gcx, yLat, rLat, rLat * 0.24, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let lon = 0; lon < 6; lon++) {
      const a = lon * Math.PI / 6 + rot * 0.5;
      ctx.beginPath();
      ctx.ellipse(gcx, gcy, Math.abs(Math.cos(a)) * gr, gr, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Debris cloud dots in LEO shell
    for (let d = 0; d < 220; d++) {
      const da = rand(d * 5 + 1) * Math.PI * 2 + rot * (0.6 + rand(d) * 0.4);
      const incl = (rand(d * 11 + 3) - 0.5) * 2.4;
      const x3 = Math.cos(da) * Math.cos(incl);
      const y3 = Math.sin(incl);
      const z3 = Math.sin(da) * Math.cos(incl);
      if (z3 < -0.15) continue;
      ctx.fillStyle = d % 9 === 0 ? '#f97316' : 'rgba(249, 115, 22, 0.45)';
      ctx.fillRect(gcx + x3 * gr * 1.04, gcy + y3 * gr * 1.04, 2.2, 2.2);
    }

    // 6 Orbital Planes × 8 Satellites (48 spacecraft)
    let targetPos = { x: gcx - 95, y: gcy - 45 };
    let conjPos = { x: gcx + 68, y: gcy + 145 };
    for (let p = 0; p < 6; p++) {
      const raan = p * Math.PI / 3 + rot * 0.35;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.24)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let step = 0; step <= 64; step++) {
        const u = (step / 64) * Math.PI * 2;
        const x = Math.cos(u) * Math.cos(raan) - Math.sin(u) * Math.cos(0.92) * Math.sin(raan);
        const y = Math.sin(u) * Math.sin(0.92);
        const sx = gcx + x * gr * 1.02;
        const sy = gcy + y * gr * 1.02;
        step === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      for (let s = 0; s < 8; s++) {
        const u = (s / 8) * Math.PI * 2 + t * 0.32 + p * 0.4;
        const x = Math.cos(u) * Math.cos(raan) - Math.sin(u) * Math.cos(0.92) * Math.sin(raan);
        const y = Math.sin(u) * Math.sin(0.92);
        const z = Math.cos(u) * Math.sin(raan) + Math.sin(u) * Math.cos(0.92) * Math.cos(raan);
        if (z < -0.3) continue;
        const sx = gcx + x * gr * 1.02;
        const sy = gcy + y * gr * 1.02;
        if (p === 1 && s === 2) targetPos = { x: sx, y: sy };
        if (p === 3 && s === 5) conjPos = { x: sx, y: sy };

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(sx - 3.5, sy - 3.5, 7, 7);
        ctx.strokeStyle = '#0ea5e9';
        ctx.strokeRect(sx - 5.5, sy - 5.5, 11, 11);
      }
    }

    // Highlighted Target Satellite Reticle (Green Lock) & Conjunction Diamond (Amber/Red)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(targetPos.x, targetPos.y, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(targetPos.x, targetPos.y);
    ctx.lineTo(conjPos.x, conjPos.y);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
    ctx.stroke();

    // Floating callout box on globe
    const midX = (targetPos.x + conjPos.x) * 0.5, midY = (targetPos.y + conjPos.y) * 0.5;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
    ctx.strokeStyle = '#34d399';
    ctx.fillRect(midX - 52, midY - 12, 108, 20);
    ctx.strokeRect(midX - 52, midY - 12, 108, 20);
    this.text(ctx, `${burnTriggered ? '1980 m' : '1835 m'} · T-00:48`, midX + 2, midY + 2, '#6ee7b7', 9.5, 700, 'center');

    this.text(ctx, burnTriggered ? 'KW-2A' : 'KW-5A', 280, 628, '#e2e8f0', 18, 700);
    this.text(ctx, 'vs NOAA 16 DEB · 19213', 280, 644, '#f97316', 10);
    this.text(ctx, 'rel. velocity 12.9 km/s · Pc <1e-10', 280, 658, '#64748b', 9.5);

    // 4. Right Column: CONJUNCTIONS (9 IN QUEUE)
    this.panel(ctx, 812, 44, 260, 622, 'CONJUNCTIONS', '9 IN QUEUE');
    CONJUNCTIONS.forEach((c, idx) => {
      const cy = 76 + idx * 64;
      const isAlert = c.state === 'MANEUVER REQ';
      const isDone = c.state === 'BURN DONE';
      ctx.fillStyle = isAlert ? 'rgba(244, 63, 94, 0.11)' : isDone ? 'rgba(16, 185, 129, 0.10)' : '#0e141d';
      ctx.fillRect(820, cy, 244, 58);
      ctx.strokeStyle = isAlert ? '#f43f5e' : isDone ? '#10b981' : '#1e293b';
      ctx.strokeRect(820.5, cy + 0.5, 243, 57);

      this.text(ctx, c.tca, 828, cy + 18, isAlert ? '#fb7185' : isDone ? '#34d399' : '#e2e8f0', 12, 700);
      this.text(ctx, c.sat, 910, cy + 18, '#38bdf8', 11.5, 700);
      this.text(ctx, c.state, 1056, cy + 17, c.col, 8.5, 700, 'right');
      this.text(ctx, c.deb, 828, cy + 34, '#94a3b8', 8.5);
      this.text(ctx, `miss ${c.miss.toLocaleString()} m   σ ${c.sigma} m`, 828, cy + 49, '#cbd5e1', 9);
      this.text(ctx, `Pc ${c.pc}`, 1056, cy + 49, isAlert ? '#fb7185' : '#94a3b8', 9, 700, 'right');
    });

    // 5. Middle Row (y = 674..986): MANEUVER PLAN | Pc EVOLUTION | GROUND LINK
    this.drawMiddleTelemetry(ctx, t, progress, burnTriggered);

    // 6. Bottom Row (y = 994..1342): EVENT LOG | FLEET STATE (48 spacecraft)
    this.drawBottomFleet(ctx, t, progress, burnTriggered);
  }

  drawMiddleTelemetry(ctx, t, progress, burnTriggered) {
    // MANEUVER PLAN
    this.panel(ctx, 8, 674, 348, 312, 'MANEUVER PLAN · KW-5A', burnTriggered ? 'HOLD CASE' : 'BURN CASE');
    const opts = [
      ['T-150 s', '0.137', '1,366 m', '8.8', '<1e-10', false],
      ['T-120 s', '0.196', '1,836 m', '12.5', '<1e-10', true],
      ['T-90 s', '0.284', '2,540 m', '18.2', '<1e-10', false],
    ];
    this.text(ctx, 'OPTION      Δv m/s    NEW MISS    FUEL g    Pc AFTER', 18, 712, '#64748b', 8.5, 600);
    opts.forEach(([opt, dv, miss, fuel, pc, sel], i) => {
      const y = 730 + i * 20;
      if (sel) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
        ctx.fillRect(14, y - 12, 336, 17);
      }
      const col = sel ? '#34d399' : '#cbd5e1';
      this.text(ctx, opt, 18, y, col, 9.5, 700);
      this.text(ctx, dv, 92, y, col, 9.5);
      this.text(ctx, miss, 162, y, col, 9.5);
      this.text(ctx, fuel, 236, y, col, 9.5);
      this.text(ctx, pc, 296, y, '#34d399', 9.5, 700);
    });

    // Miss distance curve
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(18, 792, 326, 108);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#eab308';
    ctx.beginPath(); ctx.moveTo(18, 868); ctx.lineTo(344, 868); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, 808);
    ctx.lineTo(205, 852);
    ctx.lineTo(336, 886);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(205, 852, 4.5, 0, Math.PI * 2); ctx.fill();
    this.text(ctx, 'SELECTED · T-120 s', 216, 848, '#34d399', 9, 700);
    this.text(ctx, 'fuel 3.43 kg · 536 burns remaining', 18, 948, '#cbd5e1', 9.5);
    this.text(ctx, 'BURN COMPLETE · verifying new orbit', 18, 972, '#34d399', 9.5, 700);

    // Pc EVOLUTION
    this.panel(ctx, 364, 674, 348, 312, 'Pc EVOLUTION', 'TCA 13:52:48', '#f43f5e');
    const px = 384, py = 712, pw = 314, ph = 205;
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(px, py, pw, ph);
    // Threshold lines
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fillRect(px, py + 28, pw, 36);
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath(); ctx.moveTo(px, py + 45); ctx.lineTo(px + pw, py + 45); ctx.stroke();
    this.text(ctx, 'MANEUVER ≥ 1e-4', px + pw - 6, py + 41, '#fb7185', 8.5, 700, 'right');

    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(px, py + 76); ctx.lineTo(px + pw, py + 76); ctx.stroke();
    this.text(ctx, 'WATCH ≥ 1e-5', px + pw - 6, py + 72, '#fbbf24', 8.5, 700, 'right');

    // Step-function Pc drop after burn
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(px, py + 48);
    ctx.lineTo(px + 95, py + 48);
    ctx.lineTo(px + 95, py + 38);
    ctx.lineTo(px + 185, py + 38);
    ctx.lineTo(px + 215, py + 44);
    ctx.lineTo(px + 220, py + 178);
    ctx.lineTo(px + pw - 18, py + 178);
    ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.beginPath(); ctx.moveTo(px + 218, py); ctx.lineTo(px + 218, py + ph); ctx.stroke();
    this.text(ctx, 'BURN', px + 223, py + 16, '#34d399', 9, 700);
    this.text(ctx, '<1e-10', px + 205, py + 168, '#e2e8f0', 10, 700);
    this.text(ctx, 'Pc NOW <1e-10   MISS 1,835 m   σ 105 m   REL V 12.9 km/s', px, 966, '#cbd5e1', 9.2, 700);

    // GROUND LINK
    this.panel(ctx, 720, 674, 352, 312, 'GROUND LINK · TT&C', 'KW-5A', '#34d399');
    const stations = [['SVALBARD', 0.45], ['FAIRBANKS', 0.62], ['HARTEBEESTHOEK', 0.0], ['PUNTA ARENAS', 0.58]];
    stations.forEach(([st, w], i) => {
      const y = 720 + i * 32;
      this.text(ctx, st, 732, y, '#cbd5e1', 9.5, 700);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(838, y - 9, 130, 12);
      if (w > 0) {
        ctx.fillStyle = '#34d399';
        ctx.fillRect(838, y - 9, 130 * w, 12);
        this.text(ctx, 'IN CONTACT', 1060, y, '#34d399', 8.5, 700, 'right');
      }
    });
    this.text(ctx, 'BURN SEQ   KW-5A · Δv 0.196 m/s              ACKED', 732, 875, '#34d399', 9.2, 700);
    this.text(ctx, 'ATT SLEW   KW-5A · prograde · 14 s           ACKED', 732, 902, '#34d399', 9.2, 700);
    this.text(ctx, 'TLM DUMP   fleet · 48 sats · 2.1 MB      STREAMING', 732, 929, '#38bdf8', 9.2, 700);
    this.text(ctx, 'UPLINK 2.1 kbps   DOWNLINK 4.6 Mbps   LATENCY 34 ms', 732, 968, '#94a3b8', 9, 600);
  }

  drawBottomFleet(ctx, t, progress, burnTriggered) {
    // EVENT LOG
    this.panel(ctx, 8, 994, 526, 348, 'EVENT LOG', 'CDM · track · plan · uplink · burn');
    const logs = [
      ['13:48:48', 'PLN', '#eab308', 'KW-5A · Pc 4.7e-4 ≥ 1e-4 · burn planned Δv 0.196 m/s'],
      ['13:49:18', 'TRK', '#38bdf8', 'PALAU radar · 18 obs · σ 229 m → miss 205 m → Pc 6.4e-4'],
      ['13:49:29', 'CDM', '#f97316', 'new CDM · KW-2A vs SL-8 R/B 37946 · TCA 13:59:29'],
      ['13:49:38', 'UPL', '#eab308', 'KW-5A · burn sequence uplinked · 14 packets · ack'],
      ['13:49:57', 'TRK', '#38bdf8', 'KIRUNA radar · 22 obs · σ 132 m → miss 293 m → Pc 2.5e-4'],
      ['13:50:08', 'TRK', '#38bdf8', 'ATACAMA optical · 18 obs · σ 201 m → miss 1409 m → Pc <1e-10'],
      ['13:50:48', 'BRN', '#34d399', 'KW-5A · burn executed Δv 0.196 m/s prograde · new miss 1858 m'],
      ['13:50:48', 'CDM', '#34d399', 'KW-5A vs NOAA 16 DEB 19213 · post-burn Pc <1e-10 · CLEARED'],
      ['13:51:11', 'TRK', '#38bdf8', 'MT STROMLO laser · 20 obs · σ 174 m → miss 267 m → Pc 5.1e-4'],
      ['13:51:39', 'CDM', '#f97316', 'new CDM · KW-4B vs COSMOS-2251 DEB 24345 · TCA 14:01:44'],
      ['13:51:56', 'TRK', '#38bdf8', 'ATACAMA optical · 10 obs · σ 259 m → miss 1304 m → Pc 2.4e-9'],
    ];
    logs.forEach(([ts, tag, col, msg], idx) => {
      const y = 1038 + idx * 26;
      this.text(ctx, ts, 18, y, '#64748b', 9.5);
      ctx.strokeStyle = col;
      ctx.strokeRect(76, y - 10, 26, 13);
      this.text(ctx, tag, 89, y, col, 8.5, 700, 'center');
      this.text(ctx, msg, 110, y, idx === 6 || idx === 7 ? '#e2e8f0' : '#94a3b8', 9.5, idx === 6 ? 700 : 400);
    });

    // FLEET STATE (6 planes × 8 satellites = 48 cells)
    this.panel(ctx, 542, 994, 530, 348, 'FLEET STATE · 48 SPACECRAFT', '40 NOMINAL · 8 IN CONJ');
    const planes = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let r = 0; r < 6; r++) {
      const ry = 1030 + r * 46;
      this.text(ctx, planes[r], 552, ry + 20, '#64748b', 9);
      for (let c = 0; c < 8; c++) {
        const cx = 572 + c * 61;
        const satId = `KW-${r + 1}${letters[c]}`;
        const isBurn = satId === 'KW-5A';
        const isReq = satId === 'KW-2B' || satId === 'KW-6H';
        const isWatch = (r + c) % 7 === 1;
        const col = isBurn ? '#34d399' : isReq ? '#f43f5e' : isWatch ? '#f59e0b' : '#38bdf8';
        ctx.fillStyle = isBurn ? 'rgba(16, 185, 129, 0.14)' : isReq ? 'rgba(244, 63, 94, 0.14)' : '#0f172a';
        ctx.fillRect(cx, ry, 56, 38);
        ctx.strokeStyle = col;
        ctx.lineWidth = isBurn || isReq ? 1.5 : 0.8;
        ctx.strokeRect(cx + 0.5, ry + 0.5, 55, 37);
        this.text(ctx, satId, cx + 4, ry + 13, '#e2e8f0', 8.2, 700);
        const fuel = (3.1 + rand(r * 8 + c) * 0.8).toFixed(2);
        this.text(ctx, `${fuel} kg`, cx + 4, ry + 32, '#94a3b8', 7.8);
        ctx.fillStyle = col;
        ctx.fillRect(cx + 4, ry + 19, 48 * (Number(fuel) / 4.0), 4);
      }
    }
  }
}
