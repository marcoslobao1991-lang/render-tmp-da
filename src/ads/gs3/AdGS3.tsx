// 3 ads GREEN SCREEN + DEMO-APP + MOTION no esquema do 2B (18/11/2026, pedido do Marcos: "executa ai!!! quero DEMO-APP + MOTION").
// Brutos: selfies de creator (Downloads/WhatsApp Video 2026-11-18 at 10.25.38 / 10.29.49 / 10.30.14) → public/gs3/g1..g3.mp4
// (30 fps, 576x1024) + máscara RVM local (src/fluency-vsl/matte/rvm) → public/gs3/g<n>-alpha.webm.
// Estrutura (igual ao 2B): [cena do Friends com som, ~3 s, ele já no canto calado] → ele fala; fundo = página do episódio
// (TranscriptScreen) com a cena muda em loop; legenda no meio (Bebas, y 893). Nas JANELAS a página dá lugar ao celular com a
// gravação REAL do app (friends-ads/app-hd.mp4) ou a um motion desenhado na palavra. Ele fica sempre no canto.
// Copy inteira (take único, sem regravação): só sai o silêncio antes da 1ª palavra. Sem trilha, sem SFX.
// Tempos das batidas em segundos do BRUTO (word-level whisper.cpp em gN-words.json).
import React from "react";
import { AbsoluteFill, Audio, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, spring, Easing } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Celular } from "../friends/AdDemoApp";
import w1 from "./g1-words.json";
import w2 from "./g2-words.json";
import w3 from "./g3-words.json";
import wb2 from "./b2-words.json";
import { MOLDURA_2B } from "../cenas/creator2b";
import { asset } from "../assets";

const { fontFamily: BEBAS } = loadBebas("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const { fontFamily: SANS } = loadInter("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const VEL = 1.2; // fala acelerada (Marcos 18/11: "acelera 10%" e depois "pode acelerar mais um pouco"); a cena de abertura fica em 1x
const INK = "#141414";
const VERDE = "#1FB866";
const AMARELO = "#FFD60A";
const VERMELHO = "#E5484D";
const BATE = { damping: 12, stiffness: 200, mass: 0.55 };
const sp = (f: number, emFrame: number, cfg = BATE) => spring({ frame: f - emFrame, fps: FPS, config: cfg });

// momentos da gravação real do app (app-hd-marcas.json). Antes de 7,5 s aparece "Boa tarde, Marcos": nunca usar.
const APP = { series: 9.0, eps: 11.9, cena: 19.15, en: 22.85, repetir: 26.15, pt: 33.95, shadSeries: 47.6, shadCena: 52.7, mic: 56.17 };

type W = { w: string; a: number; b: number };
type Vis =
  | { k: "app"; app: number }
  | { k: "fone" }
  | { k: "barra"; cem: number; rotulo?: string; selo?: string }
  | { k: "contador"; ate: number; n: number }
  | { k: "escada"; eps: number[] }
  | { k: "nota"; ruim?: number }
  | { k: "ondas" }
  | { k: "evolucao"; sem: number[] };
type Janela = { de: number; ate: number; v: Vis };
type Cfg = {
  words: W[]; vStart: number; corte: number; cena: number; janelas: Janela[]; seta: number; fix?: Record<string, string>;
  vel?: number; alpha?: string; voz?: string; canto?: React.CSSProperties; headline?: [string, string];
};

const CFG: Record<string, Cfg> = {
  g1: {
    words: w1 as W[], vStart: 0.45, corte: 4.30, cena: 0, seta: 44.57, fix: { SHARING: "SHADOWING" },
    janelas: [
      { de: 4.3, ate: 5.9, v: { k: "app", app: APP.series } },           // "coloca nesse aplicativo"
      { de: 5.9, ate: 7.95, v: { k: "app", app: APP.eps } },             // "divide um episódio inteiro"
      { de: 7.95, ate: 8.84, v: { k: "app", app: APP.cena } },           // "cena por cena"
      { de: 8.84, ate: 12.68, v: { k: "app", app: APP.repetir } },       // "fica repetindo essas cenas... fone"
      { de: 12.68, ate: 14.3, v: { k: "fone" } },                        // "sem precisar da tela ligada"
      { de: 14.3, ate: 18.02, v: { k: "barra", cem: 17.34 } },           // "entende um episódio inteiro, todo sem legenda"
      { de: 18.02, ate: 22.82, v: { k: "escada", eps: [18.02, 19.56, 20.96, 21.53, 22.18] } },
      { de: 26.02, ate: 28.08, v: { k: "app", app: APP.series } },       // "assistir qualquer coisa sem legenda"
      { de: 28.08, ate: 30.74, v: { k: "app", app: APP.shadSeries } },   // "treinos de fala"
      { de: 30.74, ate: 32.34, v: { k: "app", app: APP.mic - 0.6 } },    // "grava a sua fala": mic entra em "grava"
      { de: 32.34, ate: 36.76, v: { k: "nota" } },                       // "feedback instantâneo de IA, nota da pronúncia"
      { de: 36.76, ate: 41.9, v: { k: "app", app: APP.shadCena } },      // "shadowing imitando todas as cenas"
    ],
  },
  g2: {
    words: w2 as W[], vStart: 0.95, corte: 3.85, cena: 1, seta: 47.3,
    janelas: [
      { de: 3.86, ate: 5.29, v: { k: "app", app: APP.series } },         // "entra nesse aplicativo"
      { de: 5.29, ate: 7.46, v: { k: "app", app: APP.eps } },            // "divide todas as temporadas"
      { de: 7.46, ate: 8.72, v: { k: "app", app: APP.cena } },           // "cena por cena"
      { de: 8.72, ate: 12.26, v: { k: "app", app: APP.repetir } },       // "loop de repetição... mesma cena"
      { de: 12.26, ate: 13.44, v: { k: "app", app: APP.en } },           // "até você entender tudo"
      { de: 13.44, ate: 17.4, v: { k: "fone" } },                        // "só um fone... tela desligada"
      { de: 17.4, ate: 21.16, v: { k: "app", app: APP.shadSeries } },    // "treinos de fala com o shadowing"
      { de: 21.16, ate: 22.98, v: { k: "app", app: APP.mic - 0.95 } },   // "grava a sua voz"
      { de: 22.98, ate: 26.86, v: { k: "ondas" } },                      // "comparar você falando com o áudio original"
      { de: 26.86, ate: 32.82, v: { k: "nota", ruim: 30.76 } },          // "feedback de IA... nota... aonde precisa melhorar"
      { de: 32.82, ate: 39.7, v: { k: "evolucao", sem: [33.31, 36.72, 37.12, 37.98] } }, // "arquivado... semana após semana"
    ],
  },
  g3: {
    words: w3 as W[], vStart: 0.68, corte: 3.33, cena: 2, seta: 52.67,
    janelas: [
      { de: 3.38, ate: 4.53, v: { k: "app", app: APP.series } },         // "nesse aplicativo"
      { de: 4.53, ate: 5.5, v: { k: "app", app: APP.eps } },             // "você divide"
      { de: 5.5, ate: 8.05, v: { k: "app", app: APP.cena } },            // "cada cena de todas as temporadas"
      { de: 8.05, ate: 10.26, v: { k: "app", app: APP.repetir } },       // "repete elas em loop"
      { de: 10.26, ate: 12.46, v: { k: "fone" } },                       // "direto no seu fone de ouvido"
      { de: 12.46, ate: 15.76, v: { k: "barra", cem: 14.86 } },          // "primeiro episódio 100% sem legenda"
      { de: 15.76, ate: 19.08, v: { k: "escada", eps: [15.5, 15.76, 16.66, 17.68, 18.13] } },
      { de: 21.45, ate: 23.34, v: { k: "app", app: APP.series } },       // "mas qualquer coisa"
      { de: 25.7, ate: 28.48, v: { k: "app", app: APP.shadSeries } },    // "treinos de fala"
      { de: 28.48, ate: 33.26, v: { k: "nota" } },                       // "feedback instantâneo da IA... pronúncia"
      { de: 33.26, ate: 37.85, v: { k: "app", app: APP.mic - 0.75 } },   // "gravar os takes imitando"
      { de: 37.85, ate: 43.54, v: { k: "evolucao", sem: [39.22, 40.13, 41.87, 42.69] } }, // "melhorar... acompanhar a sua evolução"
    ],
  },
};
CFG.b2 = {
  words: (wb2 as W[]).filter((w) => w.a >= 1.2), vStart: 1.1, corte: 3.05, cena: 0, seta: 30.35, vel: 1.0,
  fix: { BRINCAR: "APLICAR", SERBA: "SAIBA" },
  alpha: asset("ads/creator/creator-2b-alpha.webm"), voz: staticFile("gs3/b2-seco.m4a"), canto: { position: "absolute", ...MOLDURA_2B },
  headline: ["47 VEZES", "A MESMA CENA"],
  janelas: [
    { de: 1.1, ate: 3.0, v: { k: "app", app: APP.repetir } },                 // "imagina repetir essa mesma cena" (só na ordem cena)
    { de: 3.0, ate: 5.02, v: { k: "contador", ate: 4.6, n: 47 } },            // "47 vezes, seguidas": contador 1 → 47
    { de: 5.02, ate: 7.38, v: { k: "app", app: APP.repetir } },               // "no automático... o que vai acontecer?"
    { de: 7.38, ate: 9.04, v: { k: "app", app: APP.en } },                    // "é muito simples, você vai entender"
    { de: 9.04, ate: 10.68, v: { k: "barra", cem: 9.68, rotulo: "ESSA CENA", selo: "ENTENDI TUDO" } }, // "100% dela"
    { de: 13.08, ate: 16.64, v: { k: "app", app: APP.shadCena } },            // "e a próxima cena": NOVA cena 2/247
    { de: 21.27, ate: 23.6, v: { k: "app", app: APP.mic - 1.32 } },           // "bom em ouvir e conversar": mic em "conversar"
  ],
};
export const AD_GS3_IDS = Object.keys(CFG);

// HOOK = a cena 1/247 tocando DENTRO do app (gravação real a partir de 19,25 s) com o som dela (friends-ads/c1.mp4, 3 s)
const HOOK_APP = 19.25;
// ORDEM (Marcos 18/11): ele fala a linha do hook ("e esse truque... sem legenda") com o app já parado no fundo → a cena toca
// com som dentro do app (3 s) → ele volta e segue. corte = fim do hook no bruto (vale do envelope, conferido isolado).
const CENA_SEG = 3.0, RESPIRO = 0.15;
// duas ordens pra testar (Marcos 18/11): "hook" = ele fala a linha do hook, cena, resto; "cena" = cena com som primeiro, depois ele fala tudo
export type Ordem = "hook" | "cena";
const vel = (c: Cfg) => c.vel ?? VEL;
const tempos = (c: Cfg, ordem: Ordem) => {
  const corte = ordem === "hook" ? c.corte : c.vStart;
  const H = (corte - c.vStart) / vel(c);
  return { H, S: H + CENA_SEG + RESPIRO, corte };
};
export const duracaoGS3 = (id: string, ordem: Ordem = "hook") => {
  const c = CFG[id];
  const ult = c.words[c.words.length - 1];
  const { S, corte } = tempos(c, ordem);
  return fr(S + (ult.b + 0.6 - corte) / vel(c));
};

// ── legenda no meio (estilo 2B) ──
const limpa = (s: string, fix?: Record<string, string>) => {
  const u = s.replace(/[.,!?;:"]/g, "").toUpperCase();
  return fix?.[u] ?? u;
};
// pares que nunca podem cair em pedaços diferentes (Marcos: "truque simples tem que aparecer junto")
const JUNTA = new Set(["truque simples", "truquezinho para", "sem legenda", "episódio inteiro", "fone de", "de ouvido", "saiba mais", "friends sem", "mais fácil", "mais ainda"]);
const par = (x?: W, y?: W) => !!x && !!y && JUNTA.has(`${x.w.replace(/[.,!?;:"]/g, "").toLowerCase()} ${y.w.replace(/[.,!?;:"]/g, "").toLowerCase()}`);
const pedacos = (ws: W[], vStart: number) => {
  const out: { t: string[]; ws: W[]; ini: number; fim: number }[] = [];
  let cur: W[] = [];
  const fecha = () => { if (cur.length) out.push({ t: cur.map((x) => x.w), ws: cur, ini: Math.max(vStart, cur[0].a), fim: cur[cur.length - 1].b }); cur = []; };
  ws.forEach((w, i) => {
    const ant = ws[i - 1];
    const chars = cur.map((x) => x.w).join(" ").length + w.w.length;
    const prox = ws[i + 1];
    const quebra = cur.length >= 3 || chars > 17 || (ant && /[.?!,]$/.test(ant.w)) || (ant && w.a - ant.b > 0.3) || (par(w, prox) && cur.length >= 2);
    if (cur.length && quebra && !par(ant, w)) fecha();
    cur.push(w);
  });
  fecha();
  return out.map((p, i) => ({ ...p, ate: Math.min(out[i + 1]?.ini ?? p.fim + 0.6, p.fim + 0.6) }));
};
const SOMBRA = "0 0 4px #000, 0 0 10px #000, 0 0 18px #000, 0 0 26px #000, 0 0 36px rgba(0,0,0,.95), 0 0 52px rgba(0,0,0,.8)";
// cada pedaço entra batendo (mola 1,18 → 1) e a palavra falada acende em amarelo (linguagem dos ads de Friends aprovados)
const Legenda: React.FC<{ a: number; f: number; aFrame: (s: number) => number; peds: ReturnType<typeof pedacos>; fix?: Record<string, string>; y?: number }> = ({ a, f, aFrame, peds, fix, y = 893 }) => {
  const p = peds.find((k) => a >= k.ini && a < k.ate);
  if (!p) return null;
  const s = sp(f, aFrame(p.ini), { damping: 11, stiffness: 260, mass: 0.45 });
  return (
    <div style={{ position: "absolute", left: 30, right: 30, top: y, transform: `translateY(-50%) scale(${interpolate(s, [0, 1], [1.18, 1])})`, textAlign: "center", zIndex: 60 }}>
      <div style={{ fontFamily: BEBAS, fontSize: Math.min(116, Math.floor(760 / (0.46 * Math.max(4, p.ws.map((w) => limpa(w.w, fix)).join(" ").length)))), lineHeight: 1, color: "#fff", textShadow: SOMBRA, WebkitTextStroke: "3px #000", paintOrder: "stroke fill", letterSpacing: 1, whiteSpace: "nowrap" } as React.CSSProperties}>
        {p.ws.map((w, i) => {
          const fim = p.ws[i + 1] ? p.ws[i + 1].a : p.ate;
          const ativa = a >= w.a - 0.03 && a < fim;
          return <span key={i} style={{ color: ativa ? AMARELO : "#fff", display: "inline-block", transform: ativa ? "scale(1.06)" : undefined, marginRight: i < p.ws.length - 1 ? "0.25em" : 0 }}>{limpa(w.w, fix)}</span>;
        })}
      </div>
    </div>
  );
};

// ── moldura de iPhone pra telas desenhadas (mesmo desenho do Celular do AdDemoApp) ──
const Moldura: React.FC<{ w: number; children: React.ReactNode }> = ({ w, children }) => {
  const h = w * (1688 / 780), borda = w * 0.035, raio = w * 0.13;
  return (
    <div style={{ position: "relative", width: w + borda * 2, height: h + borda * 2, borderRadius: raio, padding: borda, background: "linear-gradient(160deg,#2e2e35,#0d0d10)", boxShadow: "0 0 0 3px rgba(255,255,255,.14), 0 50px 120px rgba(0,0,0,.45)" }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: raio - borda, overflow: "hidden" }}>{children}</div>
      <div style={{ position: "absolute", top: borda + w * 0.025, left: "50%", transform: "translateX(-50%)", width: w * 0.3, height: w * 0.085, borderRadius: w, background: "#000" }} />
    </div>
  );
};

// MOTION 1 · tela de bloqueio: as cenas tocando no fone com a tela desligada
const Fone: React.FC<{ f: number; g0: number; w: number }> = ({ f, g0, w }) => {
  const s = sp(f, g0 + 6);
  const n = 3 + Math.floor((f - g0) / 24) % 12;
  const barras = Array.from({ length: 22 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7 + (f - g0) / 4) * Math.cos(i * 0.6 + (f - g0) / 7)));
  return (
    <Moldura w={560}>
      <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 30% 10%, #2c3550 0%, #0b0d14 70%)", fontFamily: SANS, color: "#fff" }}>
        <div style={{ position: "absolute", top: 150, left: 0, right: 0, textAlign: "center", fontSize: 30, fontWeight: 700, opacity: 0.85 }}>terça-feira, 18 de novembro</div>
        <div style={{ position: "absolute", top: 180, left: 0, right: 0, textAlign: "center", fontSize: 168, fontWeight: 800, letterSpacing: -6 }}>9:41</div>
        <div style={{ position: "absolute", left: 30, right: 30, top: 470, transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`, opacity: Math.min(1, s * 2), background: "rgba(255,255,255,.16)", borderRadius: 34, padding: "26px 28px", backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><rect x="2" y="14" width="5" height="7" rx="2" fill="#fff" /><rect x="17" y="14" width="5" height="7" rx="2" fill="#fff" /></svg>
            <div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>Fone conectado</div>
              <div style={{ fontSize: 26, opacity: 0.8 }}>Friends · Piloto · cena {n} no ouvido</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, height: 70, marginTop: 20 }}>
            {barras.map((b, i) => <div key={i} style={{ flex: 1, height: `${b * 100}%`, background: AMARELO, borderRadius: 6 }} />)}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)", width: 200, height: 10, borderRadius: 6, background: "rgba(255,255,255,.7)" }} />
      </AbsoluteFill>
    </Moldura>
  );
};

// MOTION 2 · episódio 1 enchendo até 100% (cravado no "sem legenda" / "100%")
const Barra: React.FC<{ f: number; g0: number; cem: number; rotulo?: string; selo?: string }> = ({ f, g0, cem, rotulo = "EPISÓDIO 1", selo = "ENTENDI SEM LEGENDA" }) => {
  const p = interpolate(f, [g0 + 4, cem], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ok = f >= cem;
  const sOk = sp(f, cem);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 70, fontFamily: BEBAS, color: INK }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontSize: 120, lineHeight: 0.9 }}>{rotulo}</div>
        <div style={{ fontSize: 160, lineHeight: 0.9, color: ok ? VERDE : INK }}>{Math.round(p * 100)}%</div>
      </div>
      <div style={{ marginTop: 30, height: 90, borderRadius: 50, background: "#DDD8CF", overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 50, background: ok ? VERDE : INK }} />
      </div>
      {ok && (
        <div style={{ marginTop: 50, display: "flex", justifyContent: "center", transform: `scale(${interpolate(sOk, [0, 1], [1.4, 1])}) rotate(-3deg)`, opacity: Math.min(1, sOk * 2) }}>
          <div style={{ border: `8px solid ${VERDE}`, color: VERDE, borderRadius: 22, padding: "8px 36px", fontSize: 92 }}>{selo}</div>
        </div>
      )}
    </div>
  );
};

// MOTION 3 · escada EP1 → EP5, um degrau por palavra ("segundo... terceiro... quarto... quinto")
const Escada: React.FC<{ f: number; eps: number[] }> = ({ f, eps }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 110, height: 640, display: "flex", alignItems: "flex-end", gap: 22, fontFamily: BEBAS }}>
    {eps.map((t, i) => {
      const em = fr(t);
      const s = f >= em ? sp(f, em) : 0;
      const ativo = f >= em;
      const h = 150 + i * 115;
      return (
        <div key={i} style={{ flex: 1, height: h * (ativo ? interpolate(s, [0, 1], [0.4, 1]) : 0.4), background: ativo ? (i === eps.length - 1 || f < fr(eps[i + 1] ?? 999) ? VERDE : "#9ADBB8") : "#DDD8CF", borderRadius: 22, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 16 }}>
          <span style={{ fontSize: 78, color: ativo ? "#fff" : "#A49E93" }}>EP{i + 1}</span>
        </div>
      );
    })}
  </div>
);

// MOTION 4 · nota da pronúncia (IA): anel enchendo e número contando; "onde melhorar" marca a palavra fraca
const Nota: React.FC<{ f: number; g0: number; ruim?: number }> = ({ f, g0, ruim }) => {
  const p = interpolate(f, [g0 + 6, g0 + 40], [0, 0.86], { ...clamp, easing: Easing.out(Easing.cubic) });
  const R = 190, C = 2 * Math.PI * R;
  const frase = ["There's", "nothing", "to", "tell."];
  const marca = ruim !== undefined && f >= fr(ruim);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: SANS, color: INK }}>
      <div style={{ position: "relative", width: 440, height: 440 }}>
        <svg width="440" height="440" viewBox="0 0 440 440" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="220" cy="220" r={R} stroke="#DDD8CF" strokeWidth="34" fill="none" />
          <circle cx="220" cy="220" r={R} stroke={VERDE} strokeWidth="34" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: BEBAS, fontSize: 210, lineHeight: 0.85 }}>{Math.round(p * 100)}</div>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 3, opacity: 0.75 }}>PRONÚNCIA</div>
        </div>
      </div>
      <div style={{ marginTop: 26, fontSize: 58, fontWeight: 800, display: "flex", gap: 18 }}>
        {frase.map((x, i) => {
          const fraca = marca && i === 3;
          return <span key={i} style={{ color: fraca ? VERMELHO : VERDE, textDecoration: fraca ? `underline 8px ${VERMELHO}` : "none", textUnderlineOffset: 12 }}>{x}</span>;
        })}
      </div>
    </div>
  );
};

// MOTION 5 · você × original: as duas ondas se desenhando e encaixando
const Ondas: React.FC<{ f: number; g0: number }> = ({ f, g0 }) => {
  const N = 34;
  const base = Array.from({ length: N }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37 + 1)));
  const desenha = (atraso: number) => interpolate(f, [g0 + atraso, g0 + atraso + 30], [0, N], clamp);
  const linha = (rot: string, cor: string, atraso: number, desvio: number) => {
    const n = desenha(atraso);
    return (
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 80, color: INK, marginBottom: 8 }}>{rot}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 190 }}>
          {base.map((b, i) => <div key={i} style={{ flex: 1, height: `${Math.min(1, b * (1 + desvio * Math.sin(i * 2.3))) * 100}%`, background: cor, borderRadius: 8, opacity: i < n ? 1 : 0.12 }} />)}
        </div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 120 }}>
      {linha("ORIGINAL", INK, 4, 0)}
      {linha("VOCÊ", VERDE, 34, 0.18)}
    </div>
  );
};

// MOTION 6 · evolução semana a semana: barras subindo, uma por palavra
const Evolucao: React.FC<{ f: number; sem: number[] }> = ({ f, sem }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 20, fontFamily: BEBAS, color: INK }}>
    <div style={{ fontSize: 100, lineHeight: 1 }}>SUA PRONÚNCIA</div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 34, height: 520, marginTop: 20 }}>
      {sem.map((t, i) => {
        const em = fr(t); const ativo = f >= em; const s = ativo ? sp(f, em) : 0;
        const nota = [58, 69, 78, 86][i];
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ fontSize: 76, opacity: ativo ? 1 : 0, color: i === sem.length - 1 ? VERDE : INK }}>{nota}</div>
            <div style={{ width: "100%", height: `${(nota / 100) * 78 * (ativo ? s : 0)}%`, background: i === sem.length - 1 ? VERDE : INK, borderRadius: 18 }} />
            <div style={{ fontSize: 56, marginTop: 10 }}>SEM {i + 1}</div>
          </div>
        );
      })}
    </div>
  </div>
);

// MOTION 7 · contador de repetições: a mesma cena passando e o número subindo até 47
const Contador: React.FC<{ f: number; g0: number; ate: number; n: number }> = ({ f, g0, ate, n }) => {
  const p = interpolate(f, [g0 + 3, ate], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const k = Math.max(1, Math.round(p * n));
  const fim = f >= ate;
  const sF = sp(f, ate);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 50, fontFamily: BEBAS, color: INK }}>
      <svg width="230" height="230" viewBox="0 0 24 24" fill="none" stroke={fim ? VERDE : INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${(f - g0) * 14}deg)` }}><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontSize: 330, lineHeight: 0.82, color: fim ? VERDE : INK, transform: `scale(${fim ? interpolate(sF, [0, 1], [1.25, 1]) : 1})`, transformOrigin: "left center" }}>{k}X</div>
        <div style={{ fontSize: 96, lineHeight: 1 }}>A MESMA CENA</div>
      </div>
    </div>
  );
};

const Seta: React.FC<{ f: number; em: number }> = ({ f, em }) => {
  if (f < em) return null;
  const s = sp(f, em);
  const pulo = Math.sin((f - em) / 5) * 16;
  return (
    <div style={{ position: "absolute", bottom: 330 - pulo, left: 150, zIndex: 70, opacity: Math.min(1, s * 2), transform: `scale(${interpolate(s, [0, 1], [1.4, 1])})` }}>
      <svg width="190" height="190" viewBox="0 0 24 24" fill="none" stroke={AMARELO} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px #000) drop-shadow(0 6px 14px rgba(0,0,0,.7))" }}><path d="M12 4v15M5 12l7 7 7-7" /></svg>
    </div>
  );
};

// frases (pra zoom seco): quebra em pontuação, pausa > 0,22 s ou frase passando de 2,4 s
const frases = (ws: W[], vStart: number) => {
  const ini: number[] = [vStart];
  ws.forEach((w, i) => {
    const ant = ws[i - 1];
    if (!ant) return;
    if (/[.?!,]$/.test(ant.w) || w.a - ant.b > 0.22 || w.a - ini[ini.length - 1] > 2.4) ini.push(Math.max(vStart, w.a - 0.08));
  });
  return ini;
};
const NIVEIS = [1, 1.1, 1.04, 1.13];
const APP_LIVRE = APP.repetir; // entre janelas o celular segue com a cena repetindo (o app trabalhando)
const APP_PARADO = 19.05; // cena 1/247 carregada, parada no play (fundo do hook)


// HEADLINE do hook: dois adesivos empilhados, visíveis no frame 0 (assentam com mola), ficam até o fim da cena
const Headline: React.FC<{ f: number; ate: number; txt?: [string, string] }> = ({ f, ate, txt = ["FRIENDS", "SEM LEGENDA"] }) => {
  if (f >= ate) return null;
  const s1 = sp(f, -4, { damping: 11, stiffness: 190, mass: 0.5 });
  const s2 = sp(f, 3, { damping: 11, stiffness: 190, mass: 0.5 });
  const pulso = 1 + 0.015 * Math.sin(f / 9);
  const tag = (txt: string, bg: string, cor: string, rot: number, s: number) => (
    <div style={{ transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [1.35, 1]) * pulso})`, background: bg, color: cor, fontFamily: BEBAS, fontSize: 122, lineHeight: 0.9, padding: "10px 34px 2px", borderRadius: 22, boxShadow: "0 22px 60px rgba(0,0,0,.55)", whiteSpace: "nowrap" }}>{txt}</div>
  );
  return (
    <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 55 }}>
      {tag(txt[0], "#fff", INK, -4, s1)}
      {tag(txt[1], AMARELO, INK, 2.5, s2)}
    </div>
  );
};

const CEL = 537, CEL_W = CEL * 1.07;
type Seg = { f0: number; f1: number; v: Vis; congela?: boolean; cena?: boolean };
const ehFone = (v: Vis) => v.k === "app" || v.k === "fone";

export const AdGS3: React.FC<{ id: string; ordem?: Ordem }> = ({ id, ordem = "hook" }) => {
  const c = CFG[id];
  const f = useCurrentFrame();
  const t = f / FPS;
  const { H, S, corte } = tempos(c, ordem);
  const fH = fr(H), fS = fr(S);
  const temHook = fH > 0;
  // tempo do bruto (NaN durante a cena: ele não fala)
  const V = vel(c);
  const a = t < H ? t * V + c.vStart : t < S ? NaN : (t - S) * V + corte;
  const peds = React.useMemo(() => pedacos(c.words, c.vStart), [c]);
  const fz = React.useMemo(() => frases(c.words, c.vStart), [c]);
  const adS = (s: number) => (s < corte ? (s - c.vStart) / V : S + (s - corte) / V);
  const fBruto = (s: number) => fr(adS(s));
  const fimTotal = duracaoGS3(id, ordem);

  const segs = React.useMemo(() => {
    const out: Seg[] = [];
    if (temHook) out.push({ f0: 0, f1: fH, v: { k: "app", app: APP_PARADO }, congela: true });
    out.push({ f0: fH, f1: fS, v: { k: "app", app: HOOK_APP }, cena: true });
    let cur = fS;
    for (const j of c.janelas) {
      const a0 = Math.max(fS, fBruto(j.de)), a1 = fBruto(j.ate);
      if (a1 <= a0) continue;
      if (a0 > cur + 2) out.push({ f0: cur, f1: a0, v: { k: "app", app: APP_LIVRE } });
      out.push({ f0: Math.max(cur, a0), f1: a1, v: j.v });
      cur = a1;
    }
    if (fimTotal > cur) out.push({ f0: cur, f1: fimTotal + 1, v: { k: "app", app: APP_LIVRE } });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ordem]);

  // celular (3 estados): hook = grande no centro, com o Friends já à vista; cena = maior ainda, tocando com som;
  // corpo = à esquerda. O vídeo do app fica sempre acima da legenda e abaixo da headline.
  const g1 = temHook ? sp(f, fH, { damping: 16, stiffness: 130, mass: 0.6 }) : 1;
  const g2 = sp(f, fS, { damping: 16, stiffness: 130, mass: 0.6 });
  const est = (h: number, cc: number, b: number) => (f < fH ? h : f < fS ? interpolate(g1, [0, 1], [h, cc]) : interpolate(g2, [0, 1], [cc, b]));
  const celEsc = est(1.25, 1.32, 1);
  const celX = est((1080 - CEL_W * 1.25) / 2, (1080 - CEL_W * 1.32) / 2, 34);
  const celY = est(120, 120, 182);
  const celRot = est(0, 0, -3);

  // ELE: ordem "hook" fala desde o frame 0 e desce na cena; ordem "cena" entra subindo quando começa a falar
  const fora = f < fH ? 0 : f < fS ? (temHook ? sp(f, fH, { damping: 18, stiffness: 140, mass: 0.6 }) : 1) : 1 - sp(f, fS, { damping: 13, stiffness: 150, mass: 0.6 });
  const fi = isNaN(a) ? 0 : fz.reduce((acc, tt, i) => (a >= tt ? i : acc), 0);
  const zoom = NIVEIS[fi % NIVEIS.length];

  const palco = (seg: Seg, i: number) => {
    const ant = segs[i - 1];
    const celular = ehFone(seg.v);
    const continua = !!ant && ehFone(ant.v) === celular;
    const entra = i === 0 || continua ? 1 : sp(f, seg.f0, { damping: 15, stiffness: 150, mass: 0.6 });
    const kick = continua && !seg.cena && !ant?.cena ? sp(f, seg.f0, { damping: 10, stiffness: 220, mass: 0.5 }) : 1;
    if (celular) {
      return (
        <div style={{
          position: "absolute", left: celX, top: celY, zIndex: 10,
          transform: `translateY(${interpolate(entra, [0, 1], [700, 0]) + Math.sin(f / 26) * 9}px) rotate(${celRot + interpolate(entra, [0, 1], [-13, 0]) + Math.sin(f / 41) * 0.9 + interpolate(kick, [0, 1], [2.5, 0])}deg) scale(${celEsc * interpolate(kick, [0, 1], [1.08, 1])})`,
          transformOrigin: "0% 0%",
        }}>
          {seg.v.k === "app"
            ? <Celular w={CEL} app={(seg.v as { app: number }).app} congela={seg.congela} dur={(seg.f1 - seg.f0) / FPS + 1} />
            : <div style={{ transform: `scale(${CEL / 560})`, transformOrigin: "0 0" }}><Fone f={f} g0={seg.f0} w={560} /></div>}
        </div>
      );
    }
    const v = seg.v;
    return (
      <div style={{
        position: "absolute", left: 46, right: 46, top: 290, height: 550, background: "#fff", borderRadius: 46, overflow: "hidden", zIndex: 10,
        boxShadow: "0 40px 110px rgba(0,0,0,.55), 0 0 0 2px rgba(255,255,255,.6)",
        transform: `translateY(${interpolate(entra, [0, 1], [300, 0])}px) rotate(${interpolate(entra, [0, 1], [5, 0]) + interpolate(kick, [0, 1], [-1.5, 0])}deg) scale(${interpolate(entra, [0, 1], [0.82, 1]) * interpolate(kick, [0, 1], [1.05, 1])})`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 988 / 0.72, height: 550 / 0.72, transform: "scale(0.72)", transformOrigin: "0 0" }}>
          {v.k === "barra" && <Barra f={f} g0={seg.f0} cem={fBruto(v.cem)} rotulo={v.rotulo} selo={v.selo} />}
          {v.k === "contador" && <Contador f={f} g0={seg.f0} ate={fBruto(v.ate)} n={v.n} />}
          {v.k === "escada" && <Escada f={f} eps={v.eps.map(adS)} />}
          {v.k === "nota" && <Nota f={f} g0={seg.f0} ruim={v.ruim !== undefined ? adS(v.ruim) : undefined} />}
          {v.k === "ondas" && <Ondas f={f} g0={seg.f0} />}
          {v.k === "evolucao" && <Evolucao f={f} sem={v.sem.map(adS)} />}
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: "#0B0B10", overflow: "hidden" }}>
      {/* fundo: a própria cena do Friends, desfocada e escura, respirando */}
      <AbsoluteFill style={{ transform: `scale(${1.25 + 0.05 * Math.sin(f / 90)})`, filter: "blur(34px) brightness(.42) saturate(1.25)" }}>
        <Loop durationInFrames={90}>
          <OffthreadVideo src={staticFile("friends-ads/c1.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Loop>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 35% 35%, rgba(255,214,10,.10), rgba(0,0,0,0) 60%)" }} />

      {/* áudio: (hook falado) → cena com som → voz SECA */}
      {temHook && <Sequence durationInFrames={fH}><Audio src={(c.voz ?? staticFile(`gs3/${id}-seco.m4a`))} trimBefore={fr(c.vStart)} playbackRate={V} /></Sequence>}
      <Sequence from={fH} durationInFrames={fr(CENA_SEG) + 3}><Audio src={staticFile("friends-ads/c1.mp4")} /></Sequence>
      <Sequence from={fS}><Audio src={(c.voz ?? staticFile(`gs3/${id}-seco.m4a`))} trimBefore={fr(corte)} playbackRate={V} /></Sequence>

      {/* cada trecho PRÉ-CARREGADO 1 s antes (premountFor): o celular nunca abre em branco na emenda */}
      {segs.map((seg, i) => (
        <Sequence key={i} from={seg.f0} durationInFrames={seg.f1 - seg.f0 + 1} premountFor={30}>
          {palco(seg, i)}
        </Sequence>
      ))}

      {/* ELE no canto */}
      <AbsoluteFill style={{ zIndex: 40, transform: `translateY(${interpolate(fora, [0, 1], [0, 900])}px)` }}>
        <div style={{ ...(c.canto ?? CANTO), transform: `scale(${zoom})`, transformOrigin: "50% 26%" }}>
          {temHook && (
            <Sequence durationInFrames={fH + 12} layout="none">
              <OffthreadVideo src={(c.alpha ?? staticFile(`gs3/${id}-alpha.webm`))} transparent muted trimBefore={fr(c.vStart)} playbackRate={V} style={{ width: "100%", height: "100%" }} />
            </Sequence>
          )}
          <Sequence from={fS} premountFor={30}>
            <OffthreadVideo src={(c.alpha ?? staticFile(`gs3/${id}-alpha.webm`))} transparent muted trimBefore={fr(corte)} playbackRate={V} style={{ width: "100%", height: "100%" }} />
          </Sequence>
        </div>
      </AbsoluteFill>

      <Headline f={f} ate={fS} txt={c.headline} />
      {!isNaN(a) && <Legenda a={a} f={f} aFrame={fBruto} peds={peds} fix={c.fix} y={f < fH ? 1075 : 893} />}
      <Seta f={f} em={fBruto(c.seta)} />
    </AbsoluteFill>
  );
};
const CANTO: React.CSSProperties = { position: "absolute", left: 380, top: 800, width: 700, height: 700 * (1024 / 576) };
