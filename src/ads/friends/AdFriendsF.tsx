// 5 ads "inglês com FRIENDS" SEM AVATAR (15/11/2026): só cena real de Friends + motion. Pedido do Marcos: hook de Friends,
// edição dopaminérgica que EXIGE POUCA COGNIÇÃO (a edição existe pra ficar fácil de entender e leve).
// Regras desta edição:
//  · 1 ideia por batida, 1 visual por batida, tudo grande; o visual TROCA no mesmo lugar (nunca acumula mais de 3 coisas);
//  · um canal de texto só: a legenda gigante de 1 a 3 palavras; adesivo só no gancho e pra numerar passo;
//  · cada batida entra com mola + tranco de câmera e troca de cena de Friends (7 trechos reais) = novidade a cada 1 a 3 s;
//  · cor que significa: amarelo = certo/destaque · coral = errado/trava · turquesa = a virada.
// Mesmos áudios (voz + tempos) dos ads com avatar: src/ads/friends/<slug>-tight.json. Tempos em segundos do áudio.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, Loop, staticFile, useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadDM } from "@remotion/google-fonts/DMSans";
import w1 from "./f1-riram-tight.json";
import w2 from "./f2-cuidado-tight.json";
import w3 from "./f3-errado-tight.json";
import w4 from "./f4-receita-tight.json";
import w5 from "./f5-ouvido-tight.json";
import { Celular } from "./AdDemoApp";

const { fontFamily: SANS } = loadInter("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] });
const { fontFamily: DM } = loadDM("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.out(Easing.cubic);
const C = { amarelo: "#FFD60A", coral: "#FF5A4D", turq: "#4ECDC4", cinza: "#9A9AA2", branco: "#fff" };
type Cor = keyof typeof C;
const BATE = { damping: 10, stiffness: 210, mass: 0.5 };
const ASSENTA = { damping: 15, stiffness: 110, mass: 0.8 };
const spr = (f: number, em: number, cfg = BATE) => spring({ frame: f - fr(em), fps: FPS, config: cfg });
type W = { word: string; start: number; end: number };

// trechos REAIS de Friends (480×270, mudos aqui)
const CLIPS = [
  { src: "pensar/mont-friends-s01e05-49.mp4", dur: 2.25, en: "Okay, but not yet. I don't wanna seem too eager." }, // 0 Central Perk
  { src: "pensar/mont-friends-s01e19-47.mp4", dur: 1.96, en: "I mean, do you think you can ever have both?" }, // 1 Rachel
  { src: "pensar/mont-friends-s01e19-193.mp4", dur: 2.3, en: "First of all, we haven't been introduced." }, // 2 cozinha da Monica
  { src: "pensar/friends-1.mp4", dur: 2.284, en: "Why not? Well, it's just a big commitment." }, // 3 Chandler
  { src: "pensar/friends-2.mp4", dur: 1.622, en: "I mean, what if one of us wants to move out?" }, // 4 Chandler
  { src: "pensar/friends-3.mp4", dur: 2.043, en: "Why, are you moving out?" }, // 5 Chandler
  { src: "pensar/mont-friends-s01e05-202.mp4", dur: 1.835, en: "You know what I miss the most about her?" }, // 6 Joey
];
const JOEY_PT = "sabe do que eu mais sinto falta nela?";

type Linha = { t: number; txt: string; cor?: Cor; risca?: number };
type Tit = { t: number; txt: string; fundo?: "branco" | "amarelo" | "coral" };
type V =
  | { k: "cena"; clip: number; tit?: Tit[]; sub?: boolean; pt?: { txt: string; risca: number }; voltas?: number; frase?: { ini: number; fim: number }; selo?: { t: number; txt: string; cor: Cor } }
  | { k: "num"; valor: number; sufixo?: string; rot: string; cor: Cor; conta?: number }
  | { k: "texto"; linhas: Linha[] }
  | { k: "lista"; itens: { t: number; txt: string; x?: boolean }[] }
  | { k: "versus"; lados: { icone: "olho" | "ouvido"; obs: string; t: number; cor: Cor }[] }
  | { k: "icone"; icone: "olho" | "ouvido"; txt: string; t: number; cor: Cor }
  | { k: "print"; conta: number; coment?: { t: number; txt: string } }
  | { k: "coment"; txt: string }
  | { k: "cta" }
  // 17/11 HÍBRIDO: o app REAL no celular (gravação public/friends-ads/app-hd.mp4), a partir de `app` segundos da gravação
  | { k: "app"; app: number; tit?: string };
type Beat = { de: number; v: V };
type Cfg = { pre: number; voz: string; words: { duration: number; words: W[] }; fix: Record<string, string>; realce: string[]; beats: Beat[] };

const REALCE = ["friends", "legenda", "cena", "ouvido", "olho", "frase", "repetição", "dublado", "graça", "vídeo", "embaixo", "420", "mil", "errado", "contrário", "barulho", "palavras", "receita", "minuto", "80", "horas"];
const J = (j: unknown) => j as { duration: number; words: W[] };

const CFG: Record<string, Cfg> = {
  riram: {
    pre: 4, voz: "friends-ads/f1-riram-tight.mp3", words: J(w1), fix: { aprendei: "aprendi" }, realce: REALCE,
    beats: [
      { de: 0, v: { k: "cena", clip: 4, selo: { t: 2.05, txt: "ASSISTINDO FRIENDS", cor: "amarelo" } } },
      { de: 3.1, v: { k: "cena", clip: 1, pt: { txt: "você acha que dá pra ter os dois?", risca: 3.8 }, selo: { t: 5.53, txt: "ENTENDENDO", cor: "amarelo" } } },
      { de: 6.8, v: { k: "lista", itens: [{ t: 6.91, txt: "curso", x: true }, { t: 7.59, txt: "morar fora", x: true }] } },
      { de: 9.38, v: { k: "texto", linhas: [{ t: 9.38, txt: "uma coisa meio" }, { t: 9.97, txt: "sem graça", cor: "coral" }] } },
      { de: 10.82, v: { k: "cena", clip: 6, voltas: 11.9, frase: { ini: 14.04, fim: 15.29 } } },
      { de: 15.94, v: { k: "icone", icone: "ouvido", txt: "academia pro ouvido", t: 16.05, cor: "turq" } },
      { de: 17.66, v: { k: "print", conta: 19.96 } },
      { de: 22.06, v: { k: "coment", txt: "essa é a maneira mais eficaz que já ouvi" } },
      { de: 25.72, v: { k: "texto", linhas: [{ t: 26.04, txt: "cuidado", cor: "amarelo" }, { t: 28.43, txt: "dublado", risca: 28.75 }] } },
      { de: 28.99, v: { k: "cta" } },
    ],
  },
  cuidado: {
    pre: 1, voz: "friends-ads/f2-cuidado-tight.mp3", words: J(w2), fix: { estava: "tava", está: "tá", porque: "por que" }, realce: REALCE,
    beats: [
      { de: 0, v: { k: "cena", clip: 1, selo: { t: 0.34, txt: "CUIDADO", cor: "coral" } } },
      { de: 2.4, v: { k: "cena", clip: 0, selo: { t: 4.48, txt: "SEM LEGENDA", cor: "amarelo" } } },
      { de: 5.44, v: { k: "texto", linhas: [{ t: 5.57, txt: "nunca mais" }, { t: 6.82, txt: "dublado", risca: 7.1 }] } },
      { de: 7.56, v: { k: "texto", linhas: [{ t: 7.56, txt: "maratonar", cor: "coral", risca: 8.25 }, { t: 8.61, txt: "o contrário", cor: "amarelo" }] } },
      { de: 9.62, v: { k: "cena", clip: 6, pt: { txt: JOEY_PT, risca: 10.77 }, voltas: 11.71, frase: { ini: 12.3, fim: 13.65 } } },
      { de: 14.26, v: { k: "cena", clip: 3, selo: { t: 15.52, txt: "LENDO", cor: "coral" } } },
      { de: 16.48, v: { k: "versus", lados: [{ icone: "olho", obs: "trabalha", t: 17.2, cor: "coral" }, { icone: "ouvido", obs: "de folga", t: 18.41, cor: "cinza" }] } },
      { de: 19.02, v: { k: "print", conta: 19.12 } },
      { de: 22.88, v: { k: "coment", txt: "inacreditável que esse ouro está disponível de forma gratuita" } },
      { de: 27.74, v: { k: "cta" } },
      { de: 29.62, v: { k: "lista", itens: [{ t: 30.55, txt: "palavra escrita" }, { t: 31.66, txt: "palavra falada", x: true }] } },
      { de: 32.9, v: { k: "cta" } },
    ],
  },
  errado: {
    pre: 0, voz: "friends-ads/f3-errado-tight.mp3", words: J(w3), fix: { está: "tá" }, realce: REALCE,
    beats: [
      { de: 0, v: { k: "cena", clip: 0, selo: { t: 3.45, txt: "ASSISTINDO ERRADO", cor: "coral" } } },
      { de: 4.43, v: { k: "cena", clip: 3, selo: { t: 6.15, txt: "MARATONOU", cor: "amarelo" } } },
      { de: 6.77, v: { k: "num", valor: 80, sufixo: " h", rot: "lendo legenda", cor: "coral", conta: 7.13 } },
      { de: 9.41, v: { k: "icone", icone: "ouvido", txt: "é o contrário", t: 10.17, cor: "amarelo" } },
      { de: 10.87, v: { k: "cena", clip: 6, voltas: 11.52, frase: { ini: 14.85, fim: 16.75 } } },
      { de: 17.71, v: { k: "texto", linhas: [{ t: 17.71, txt: "é chato?" }, { t: 18.37, txt: "é sem graça", cor: "coral" }] } },
      { de: 19.47, v: { k: "texto", linhas: [{ t: 20.93, txt: "novidade", cor: "coral", risca: 21.5 }, { t: 22.58, txt: "REPETIÇÃO", cor: "turq" }] } },
      { de: 23.09, v: { k: "cena", clip: 5, selo: { t: 24.61, txt: "ACONTECENDO", cor: "amarelo" } } },
      { de: 25.34, v: { k: "print", conta: 26.26 } },
      { de: 28.35, v: { k: "cta" } },
    ],
  },
  receita: {
    pre: 2, voz: "friends-ads/f4-receita-tight.mp3", words: J(w4), fix: { para: "pra", está: "tá" }, realce: REALCE,
    beats: [
      { de: 0, v: { k: "cena", clip: 2, selo: { t: 0.07, txt: "RECEITA", cor: "amarelo" } } },
      { de: 2.32, v: { k: "texto", linhas: [{ t: 2.32, txt: "só vou explicar" }, { t: 3.71, txt: "1 vez", cor: "amarelo" }] } },
      { de: 4.34, v: { k: "cena", clip: 3, tit: [{ t: 4.34, txt: "1. uma cena de 1 minuto", fundo: "amarelo" }], selo: { t: 7.39, txt: "UMA CENA", cor: "branco" } } },
      { de: 8.0, v: { k: "cena", clip: 6, tit: [{ t: 8.0, txt: "2. tira a legenda e escuta", fundo: "amarelo" }], pt: { txt: JOEY_PT, risca: 8.75 }, frase: { ini: 90, fim: 91 } } },
      { de: 12.12, v: { k: "num", valor: 3, rot: "todo mundo pula", cor: "amarelo" } },
      { de: 16.64, v: { k: "cena", clip: 4, selo: { t: 17.62, txt: "AQUI NÃO DÁ", cor: "coral" } } },
      { de: 18.04, v: { k: "print", conta: 19.86 } },
      { de: 22.62, v: { k: "lista", itens: [{ t: 22.96, txt: "curso", x: true }, { t: 23.49, txt: "professor", x: true }, { t: 24.58, txt: "1 cena por dia" }] } },
      { de: 26.02, v: { k: "cta" } },
    ],
  },
  ouvido: {
    pre: 3, voz: "friends-ads/f5-ouvido-tight.mp3", words: J(w5), fix: { está: "tá" }, realce: REALCE,
    beats: [
      { de: 0, v: { k: "cena", clip: 3, selo: { t: 2.67, txt: "NÃO RECONHECE", cor: "coral" } } },
      { de: 4.25, v: { k: "cena", clip: 0, selo: { t: 5.27, txt: "TRAVA", cor: "coral" } } },
      { de: 8.11, v: { k: "versus", lados: [{ icone: "olho", obs: "o curso treinou", t: 8.87, cor: "amarelo" }, { icone: "ouvido", obs: "ninguém treinou", t: 10.6, cor: "coral" }] } },
      { de: 11.37, v: { k: "cena", clip: 6, voltas: 13.61, frase: { ini: 14.32, fim: 15.99 } } },
      { de: 16.43, v: { k: "texto", linhas: [{ t: 16.43, txt: "dá trabalho" }, { t: 16.58, txt: "é sem graça", cor: "coral" }] } },
      { de: 17.18, v: { k: "texto", linhas: [{ t: 17.37, txt: "quer atalho?" }, { t: 17.93, txt: "pode passar", cor: "cinza" }] } },
      { de: 19.47, v: { k: "print", conta: 22.23 } },
      { de: 24.07, v: { k: "coment", txt: "agora eu irei aprender de verdade" } },
      { de: 27.37, v: { k: "cta" } },
    ],
  },
};
export const AD_FRIENDSF_IDS = Object.keys(CFG);
const PRE = (id: string) => CLIPS[CFG[id].pre].dur; // o gancho dura exatamente a fala da cena
export const duracaoFriendsF = (id: string) => Math.ceil((PRE(id) + CFG[id].words.duration + 0.4) * FPS);
export type AdFriendsFProps = { id: string; hibrido?: boolean };
// 17/11 (Marcos: "faltou DEMO-APP... é pra ser um híbrido"): no híbrido, a batida em que a copy descreve o treino vira o APP REAL.
// Chave = `de` da batida original (segundos do áudio apertado). Momentos da gravação: cena 19,15 · EN 22,85 · repetir 26,15 / 30,0.
const HIB: Record<string, Record<string, V>> = {
  riram: { "10.82": { k: "app", app: 23.6 } },
  cuidado: { "9.62": { k: "app", app: 19.6 } },
  errado: { "10.87": { k: "app", app: 19.3 } },
  receita: { "8": { k: "app", app: 19.2, tit: "2. tira a legenda e escuta" } },
  ouvido: { "11.37": { k: "app", app: 22.6 } },
};
export const AD_FRIENDSH_IDS = Object.keys(HIB);

// ── primitivas ──
const Pop: React.FC<{ f: number; em: number; de?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ f, em, de = 1.5, style, children }) => {
  if (f < fr(em)) return null;
  const s = spr(f, em);
  return <div style={{ opacity: Math.min(1, s * 2.5), transform: `scale(${interpolate(s, [0, 1], [de, 1])})`, ...style }}>{children}</div>;
};
const Marca: React.FC<{ f: number; em: number; x?: boolean; size?: number }> = ({ f, em, x, size = 84 }) => {
  if (f < fr(em)) return <div style={{ width: size, height: size, flexShrink: 0 }} />;
  const s = spr(f, em);
  const cor = x ? C.coral : C.amarelo;
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: cor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${interpolate(s, [0, 1], [1.9, 1])})`, boxShadow: `0 0 ${40 * s}px ${cor}` }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 28 28">{x
        ? <path d="M8 8 L20 20 M20 8 L8 20" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
        : <path d="M6 14.5 L11.5 20 L22 8.5" fill="none" stroke="#000" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}</svg>
    </div>
  );
};
const Icone: React.FC<{ tipo: "olho" | "ouvido"; cor: string; size: number }> = ({ tipo, cor, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={cor} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    {tipo === "olho"
      ? <><path d="M8 50 C 26 22, 74 22, 92 50 C 74 78, 26 78, 8 50 Z" /><circle cx={50} cy={50} r={13} fill={cor} /></>
      : <><path d="M30 44 C 30 16, 74 16, 74 44 C 74 58, 62 60, 60 72 C 58 86, 40 90, 34 76" /><path d="M42 46 C 42 32, 62 32, 62 46 C 62 52, 54 54, 52 60" /></>}
  </svg>
);
const FUNDO = { branco: ["#fff", "#111"], amarelo: [C.amarelo, "#111"], coral: [C.coral, "#fff"] } as const;

// ── cena real de Friends: fundo desfocado + faixa nítida de ponta a ponta ──
const Video: React.FC<{ clip: number; de: number; style: React.CSSProperties }> = ({ clip, de, style }) => (
  <Sequence from={fr(de)} layout="none"><Loop durationInFrames={fr(CLIPS[clip].dur)} layout="none"><OffthreadVideo src={staticFile(CLIPS[clip].src)} muted style={style} /></Loop></Sequence>
);
const FAIXA_Y = 470, FAIXA_H = 760;
const Cena: React.FC<{ a: number; f: number; de: number; v: Extract<V, { k: "cena" }> }> = ({ a, f, de, v }) => {
  const c = CLIPS[v.clip];
  const tl = a - de;
  const voltas = v.voltas != null && a >= v.voltas ? 1 + Math.floor((a - v.voltas) / c.dur) : 0;
  const sV = v.voltas != null ? spr(f, v.voltas + Math.max(0, voltas - 1) * c.dur) : 0;
  const palavras = c.en.replace(/[?.]/g, "").toLowerCase().split(" ");
  const fz = v.frase;
  const pronto = fz ? a >= fz.fim : false;
  const sP = fz ? spr(f, fz.fim) : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: FAIXA_Y, width: 1080, height: FAIXA_H, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.8)" }}>
        <Video clip={v.clip} de={de} style={{ width: 1080, height: FAIXA_H, objectFit: "cover", transform: `scale(${1.02 + 0.012 * tl})` }} />
        {false && v.sub && !v.pt && <div style={{ position: "absolute", left: 30, right: 30, bottom: 26, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.15, color: "#FFE94A", textShadow: "0 3px 0 #000, 0 0 14px #000" }}>{c.en}</div>}
        {v.pt && a < v.pt.risca + 0.5 && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, display: "flex", justifyContent: "center", opacity: interpolate(a, [v.pt.risca + 0.32, v.pt.risca + 0.5], [1, 0], clamp) }}>
            <div style={{ position: "relative", fontFamily: SANS, fontWeight: 700, fontSize: 42, color: "#FFE94A", textShadow: "0 3px 0 #000, 0 0 14px #000", padding: "0 12px" }}>
              {v.pt.txt}
              <div style={{ position: "absolute", left: 0, top: "50%", height: 9, borderRadius: 5, background: C.coral, width: `${interpolate(a, [v.pt.risca, v.pt.risca + 0.2], [0, 100], clamp)}%` }} />
            </div>
          </div>
        )}
        {voltas > 0 && <div style={{ position: "absolute", right: 26, top: 24, background: C.amarelo, color: "#000", fontFamily: DM, fontWeight: 800, fontSize: 78, lineHeight: 1, padding: "8px 26px 12px", borderRadius: 20, transform: `scale(${interpolate(sV, [0, 1], [1.5, 1])})`, boxShadow: "0 12px 34px rgba(0,0,0,.55)" }}>{voltas}×</div>}
      </div>
      {v.tit && (
        <div style={{ position: "absolute", left: 50, right: 50, top: 215, height: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 14 }}>
          {v.tit.map((l, i) => {
            const [fu, co] = FUNDO[l.fundo ?? "branco"];
            const tam = Math.min(78, Math.floor(940 / (0.56 * l.txt.length)));
            return <Pop key={i} f={f} em={l.t} de={l.t < 0 ? 1.2 : 1.5}><div style={{ background: fu, color: co, fontFamily: SANS, fontWeight: 800, fontSize: tam, lineHeight: 1.1, padding: "14px 30px", borderRadius: 18, transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)`, whiteSpace: "nowrap", boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>{l.txt}</div></Pop>;
          })}
        </div>
      )}
      <div style={{ position: "absolute", left: 40, right: 40, top: FAIXA_Y + FAIXA_H + 14, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {v.selo && a >= v.selo.t && (() => { const s = spr(f, v.selo!.t); const tam = Math.min(120, Math.floor(980 / (0.62 * v.selo!.txt.length))); return <div style={{ fontFamily: DM, fontWeight: 800, fontSize: tam, letterSpacing: -2, lineHeight: 1, color: C[v.selo!.cor], WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: `0 0 44px ${C[v.selo!.cor]}99`, transform: `scale(${interpolate(s, [0, 1], [1.8, 1])}) rotate(${-3 + (1 - s) * 5}deg)` } as React.CSSProperties}>{v.selo!.txt}</div>; })()}
        {fz && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: 1.12, transform: pronto ? `scale(${interpolate(sP, [0, 1], [1.14, 1])})` : undefined }}>
            {palavras.map((p, i) => {
              const tv = fz.ini + (i * (fz.fim - fz.ini)) / palavras.length;
              const solto = a >= tv;
              const s = solto ? spr(f, tv) : 0;
              return <span key={i} style={{ display: "inline-block", margin: `0 ${solto ? 11 * s : -1}px`, color: pronto ? C.amarelo : "#fff", opacity: solto ? 1 : 0.45, filter: solto ? undefined : "blur(5px)", transform: solto ? `translateY(${(1 - s) * -26}px)` : undefined, textShadow: pronto ? `0 0 30px ${C.amarelo}AA` : "0 4px 18px rgba(0,0,0,.8)" }}>{p}</span>;
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── visuais sem cena: BLOCO DE COR (a cor do fundo já diz se é certo, errado ou a virada), tudo gigante ──
const TEMA = {
  coral: { bg: "#FF5A4D", ink: "#fff" },
  amarelo: { bg: "#FFD60A", ink: "#111" },
  turq: { bg: "#12BFB0", ink: "#fff" },
  roxo: { bg: "#5B3DF5", ink: "#fff" },
  vermelho: { bg: "#D91E1E", ink: "#fff" },
} as const;
type Tema = (typeof TEMA)[keyof typeof TEMA];
const temaDe = (v: V): keyof typeof TEMA => {
  const ok = (c?: Cor) => (c === "coral" || c === "amarelo" || c === "turq" ? c : null);
  if (v.k === "num" || v.k === "icone") return ok(v.cor) ?? "roxo";
  if (v.k === "texto") return ok([...v.linhas].reverse().find((l) => ok(l.cor))?.cor) ?? "roxo";
  if (v.k === "print") return "vermelho";
  if (v.k === "cta" || v.k === "coment") return "amarelo";
  if (v.k === "app") return "turq";
  return "roxo";
};
const Zona: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top: 300, height: 1040, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap }}>{children}</div>
);
// etiqueta invertida: fundo na cor da tinta, letra na cor do fundo (é o destaque da batida)
const Etiqueta: React.FC<{ t: Tema; size: number; rot?: number; children: React.ReactNode }> = ({ t, size, rot = -2, children }) => (
  <div style={{ background: t.ink, color: t.bg, fontFamily: DM, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: -3, padding: `${Math.round(size * 0.16)}px ${Math.round(size * 0.3)}px ${Math.round(size * 0.24)}px`, borderRadius: Math.round(size * 0.22), transform: `rotate(${rot}deg)`, whiteSpace: "nowrap", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>{children}</div>
);
const Num: React.FC<{ a: number; f: number; de: number; v: Extract<V, { k: "num" }>; t: Tema }> = ({ a, f, de, v, t }) => {
  const n = v.conta != null ? Math.round(v.valor * interpolate(a, [v.conta, v.conta + 0.7], [0, 1], { ...clamp, easing: easeOut })) : v.valor;
  const s = spr(f, de, ASSENTA);
  return (
    <Zona gap={30}>
      <div style={{ fontFamily: DM, fontWeight: 800, fontSize: Math.min(520, Math.floor(900 / (0.58 * String(v.valor + (v.sufixo ?? "")).length))), whiteSpace: "nowrap", lineHeight: 0.9, letterSpacing: -12, color: t.ink, textShadow: "0 20px 50px rgba(0,0,0,.25)", transform: `scale(${interpolate(s, [0, 1], [1.5, 1])})` }}>{n}{v.sufixo ?? ""}</div>
      <Pop f={f} em={de + 0.12}><Etiqueta t={t} size={Math.min(96, Math.floor(900 / (0.6 * v.rot.length)))}>{v.rot}</Etiqueta></Pop>
    </Zona>
  );
};
const Texto: React.FC<{ a: number; f: number; v: Extract<V, { k: "texto" }>; t: Tema }> = ({ a, f, v, t }) => (
  <Zona gap={40}>
    {v.linhas.map((l, i) => {
      const destaque = !!l.cor && l.cor !== "branco" && l.cor !== "cinza" && l.risca == null;
      const tam = Math.min(destaque ? 170 : 190, Math.floor((destaque ? 800 : 940) / (0.6 * l.txt.length)));
      return (
        <Pop key={i} f={f} em={l.t} de={1.6}>
          {destaque ? <Etiqueta t={t} size={tam} rot={i % 2 ? 2 : -2}>{l.txt}</Etiqueta> : (
            <div style={{ position: "relative", fontFamily: DM, fontWeight: 800, fontSize: tam, lineHeight: 1, letterSpacing: -4, color: t.ink, opacity: (l.risca != null && a >= l.risca + 0.2) || l.cor === "cinza" ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {l.txt}
              {l.risca != null && <div style={{ position: "absolute", left: -16, top: "50%", height: 24, borderRadius: 12, background: "#111", transform: "rotate(-3deg)", width: `${interpolate(a, [l.risca, l.risca + 0.2], [0, 105], clamp)}%` }} />}
            </div>
          )}
        </Pop>
      );
    })}
  </Zona>
);
const Lista: React.FC<{ a: number; f: number; v: Extract<V, { k: "lista" }> }> = ({ a, f, v }) => (
  <Zona>
    <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>
      {v.itens.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 36, opacity: a >= it.t ? 1 : 0 }}>
          <Marca f={f} em={it.t + 0.05} x={it.x} size={130} />
          <Pop f={f} em={it.t} de={1.3} style={{ transformOrigin: "0 50%" }}>
            <span style={{ position: "relative", fontFamily: DM, fontWeight: 800, fontSize: Math.min(120, Math.floor(760 / (0.58 * it.txt.length))), letterSpacing: -2, color: "#fff", opacity: it.x ? 0.75 : 1, whiteSpace: "nowrap" }}>
              {it.txt}
              {it.x && <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 14, borderRadius: 7, background: "#111" }} />}
            </span>
          </Pop>
        </div>
      ))}
    </div>
  </Zona>
);
const Versus: React.FC<{ a: number; f: number; v: Extract<V, { k: "versus" }> }> = ({ a, f, v }) => (
  <Zona>
    <div style={{ display: "flex", gap: 40 }}>
      {v.lados.map((l, i) => {
        const on = a >= l.t;
        const s = on ? spr(f, l.t) : 0;
        const bom = l.cor === "amarelo";
        const fundo = !on ? "rgba(255,255,255,.14)" : bom ? C.amarelo : l.cor === "coral" ? C.coral : "rgba(255,255,255,.22)";
        const tinta = !on ? "rgba(255,255,255,.55)" : bom ? "#111" : "#fff";
        return (
          <div key={i} style={{ width: 470, display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: on ? `scale(${interpolate(s, [0, 1], [1.25, 1])})` : undefined }}>
            <div style={{ width: 440, height: 440, borderRadius: 220, background: fundo, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: on ? "0 30px 70px rgba(0,0,0,.35)" : undefined }}><Icone tipo={l.icone} cor={tinta} size={270} /></div>
            <div style={{ fontFamily: DM, fontWeight: 800, fontSize: 104, lineHeight: 1, letterSpacing: -3, color: "#fff" }}>{l.icone}</div>
            <div style={{ opacity: on ? 1 : 0, background: "#111", color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 44, padding: "12px 24px", borderRadius: 16, whiteSpace: "nowrap" }}>{l.obs}</div>
          </div>
        );
      })}
    </div>
  </Zona>
);
const IconeUm: React.FC<{ a: number; f: number; de: number; v: Extract<V, { k: "icone" }>; t: Tema }> = ({ a, f, de, v, t }) => {
  const s = spr(f, de, ASSENTA);
  const pulso = 1 + Math.sin((a - de) * 9) * 0.025;
  return (
    <Zona gap={50}>
      <div style={{ width: 600, height: 600, borderRadius: 300, background: t.ink, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 40px 90px rgba(0,0,0,.35)", transform: `scale(${interpolate(s, [0, 1], [1.4, 1]) * pulso})` }}><Icone tipo={v.icone} cor={t.bg} size={370} /></div>
      {a >= v.t && <Pop f={f} em={v.t}><div style={{ fontFamily: DM, fontWeight: 800, fontSize: Math.min(130, Math.floor(940 / (0.6 * v.txt.length))), letterSpacing: -3, color: t.ink, whiteSpace: "nowrap" }}>{v.txt}</div></Pop>}
    </Zona>
  );
};
const VIEWS = 420612;
const CartaoVideo: React.FC<{ n: number; quente: boolean; children?: React.ReactNode }> = ({ n, quente, children }) => (
  <div style={{ width: 980, borderRadius: 44, background: "#fff", padding: "46px 52px 52px", boxShadow: "0 50px 110px rgba(0,0,0,.45)", fontFamily: SANS, color: "#0F0F0F" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700, color: "#606060" }}>
      <svg width={66} height={47} viewBox="0 0 50 36"><rect width={50} height={36} rx={10} fill="#FF0000" /><path d="M20 10 L34 18 L20 26 Z" fill="#fff" /></svg>
      vídeo no YouTube
    </div>
    <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.14, letterSpacing: -1, marginTop: 22 }}>Isso é SEM GRAÇA mas me deixou FLUENTE NO INGLÊS</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 28 }}>
      <span style={{ fontFamily: DM, fontWeight: 800, fontSize: 150, letterSpacing: -6, lineHeight: 1, color: quente ? "#0F0F0F" : "#C9C9C9" }}>{n.toLocaleString("pt-BR")}</span>
      <span style={{ fontSize: 40, fontWeight: 700, color: "#606060" }}>views</span>
    </div>
    {children}
  </div>
);
const Print: React.FC<{ a: number; f: number; de: number; v: Extract<V, { k: "print" }> }> = ({ a, f, de, v }) => {
  const s = spr(f, de, ASSENTA);
  const n = Math.round(VIEWS * interpolate(a, [v.conta, v.conta + 0.9], [0, 1], { ...clamp, easing: easeOut }));
  const sN = spr(f, v.conta + 0.9);
  return (
    <Zona>
      <div style={{ transform: `translateY(${(1 - s) * 90}px) rotate(${-1.5 + (1 - s) * 3}deg) scale(${(0.9 + 0.1 * s) * (a >= v.conta + 0.9 ? interpolate(sN, [0, 1], [1.05, 1]) : 1)})` }}>
        <CartaoVideo n={n} quente={a >= v.conta}>
          {v.coment && a >= v.coment.t && (
            <Pop f={f} em={v.coment.t} de={1.2} style={{ marginTop: 32, transformOrigin: "0 0" }}>
              <div style={{ display: "flex", gap: 22, background: "#FFF6C2", borderRadius: 26, padding: "26px 30px", border: `6px solid ${C.amarelo}` }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, background: "#B9C2CC", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#606060" }}>comentário no vídeo</div>
                  <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.16, marginTop: 6 }}>{v.coment.txt}</div>
                </div>
              </div>
            </Pop>
          )}
        </CartaoVideo>
      </div>
    </Zona>
  );
};
const Cta: React.FC<{ a: number; f: number; de: number }> = ({ a, f, de }) => {
  const s = spr(f, de, ASSENTA);
  const p = interpolate(a - de, [0.25, 0.6], [0, 1], { ...clamp, easing: easeOut });
  const pulo = Math.sin((a - de) * 7) * 16;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 40, right: 40, top: 310, display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>
        <div style={{ transform: `scale(${0.84 + 0.06 * s}) rotate(-1.5deg)`, transformOrigin: "50% 0" }}><CartaoVideo n={VIEWS} quente /></div>
        <Pop f={f} em={de + 0.12}><div style={{ background: "#111", color: C.amarelo, fontFamily: DM, fontWeight: 800, fontSize: 92, lineHeight: 1, whiteSpace: "nowrap", padding: "24px 44px 30px", borderRadius: 28, transform: "rotate(-2deg)", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}>vídeo aqui embaixo</div></Pop>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translateY(${pulo}px)` }}>
        <g fill="none" stroke="#111" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round">
          <path d="M540 1470 L540 1620" strokeDasharray={150} strokeDashoffset={150 * (1 - p)} />
          <path d="M462 1552 L540 1634 L618 1552" strokeDasharray={230} strokeDashoffset={230 * (1 - Math.max(0, p * 2 - 1))} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Coment: React.FC<{ f: number; de: number; v: Extract<V, { k: "coment" }> }> = ({ f, de, v }) => {
  const s = spr(f, de, ASSENTA);
  const tam = v.txt.length > 45 ? 92 : 116;
  return (
    <Zona gap={36}>
      <div style={{ background: "#111", color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: "14px 28px", borderRadius: 18, transform: "rotate(-2deg)" }}>comentário no vídeo</div>
      <div style={{ width: 940, textAlign: "center", fontFamily: DM, fontWeight: 800, fontSize: tam, lineHeight: 1.04, letterSpacing: -3, color: "#111", transform: `scale(${interpolate(s, [0, 1], [1.25, 1])})` }}>“{v.txt}”</div>
    </Zona>
  );
};
// GANCHO: a cena de Friends fala no SOM ORIGINAL e a tela faz 1 pergunta. Um texto só. É o teste que a pessoa faz na hora.
const Gancho: React.FC<{ clip: number }> = ({ clip }) => {
  const f = useCurrentFrame();
  const a = f / FPS;
  const s = spring({ frame: f + 5, fps: FPS, config: BATE });
  return (
    <AbsoluteFill style={{ background: "#07070A" }}>
      <Audio src={staticFile(CLIPS[clip].src)} volume={2} />
      <OffthreadVideo src={staticFile(CLIPS[clip].src)} muted style={{ position: "absolute", left: -540, top: -80, width: 2160, height: 2080, objectFit: "cover", filter: "blur(46px) brightness(0.55) saturate(1.4)" }} />
      <div style={{ position: "absolute", left: 0, top: FAIXA_Y, width: 1080, height: FAIXA_H, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,.8)" }}>
        <OffthreadVideo src={staticFile(CLIPS[clip].src)} muted style={{ width: 1080, height: FAIXA_H, objectFit: "cover", transform: `scale(${1.02 + 0.012 * a})` }} />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 215, height: 230, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ background: "#fff", color: "#111", fontFamily: DM, fontWeight: 800, fontSize: 96, lineHeight: 1, letterSpacing: -3, padding: "22px 40px 30px", borderRadius: 26, whiteSpace: "nowrap", transform: `scale(${interpolate(s, [0, 1], [1.25, 1])}) rotate(-2deg)`, boxShadow: "0 20px 50px rgba(0,0,0,.55)" }}>entendeu a frase?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FAIXA_Y + FAIXA_H + 40, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, height: 120 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={{ width: 22, borderRadius: 11, background: C.amarelo, height: 30 + 80 * Math.abs(Math.sin(a * 11 + i * 1.3)) }} />)}
      </div>
    </AbsoluteFill>
  );
};

// ── legenda: o único canal de texto corrido; 1 a 3 palavras, gigante, a palavra FALADA acende (karaokê) ──
const limpa = (s: string) => s.toLowerCase().replace(/[.,?!;:"]/g, "");
const pedacos = (c: Cfg) => {
  const ws = c.words.words.map((w) => ({ ...w, word: c.fix[w.word] ?? w.word }));
  const out: { ws: W[]; ini: number; fim: number }[] = [];
  let cur: W[] = [];
  const fecha = () => { if (cur.length) out.push({ ws: cur, ini: cur[0].start, fim: cur[cur.length - 1].end }); cur = []; };
  ws.forEach((w, i) => { const ant = ws[i - 1]; if (cur.length && (cur.length >= 3 || (ant && w.start - ant.end > 0.25) || (ant && /[.?!,]"?$/.test(ant.word)))) fecha(); cur.push(w); });
  fecha();
  return out.map((p, i) => ({ ...p, ate: Math.min(out[i + 1]?.ini ?? p.fim + 0.6, p.fim + 0.6) }));
};
const Legenda: React.FC<{ a: number; f: number; peds: ReturnType<typeof pedacos>; y: number }> = ({ a, f, peds, y }) => {
  const p = peds.find((k) => a >= k.ini - 0.04 && a < k.ate);
  if (!p) return null;
  const s = spring({ frame: f - fr(p.ini - 0.04), fps: FPS, config: { damping: 12, stiffness: 260, mass: 0.45 } });
  const chars = p.ws.map((w) => limpa(w.word)).join(" ").length;
  const tam = Math.min(100, Math.floor(840 / (0.68 * Math.max(1, chars))));
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, transform: "translateY(-50%)", display: "flex", justifyContent: "center", zIndex: 6 }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [1.18, 1])})`, fontFamily: DM, fontWeight: 800, fontSize: tam, whiteSpace: "nowrap", lineHeight: 1.08, letterSpacing: -1.5, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,.6)" } as React.CSSProperties}>
        {p.ws.map((w, i) => {
          const fim = p.ws[i + 1] ? p.ws[i + 1].start - 0.03 : p.ate;
          const ativa = a >= w.start - 0.03 && a < fim;
          const sw = ativa ? spr(f, w.start - 0.03) : 1;
          return <span key={i} style={{ display: "inline-block", color: ativa ? C.amarelo : "#fff", transform: ativa ? `scale(${interpolate(sw, [0, 1], [1.16, 1.06])})` : undefined, marginRight: i < p.ws.length - 1 ? "0.36em" : 0 }}>{limpa(w.word)}</span>;
        })}
      </div>
    </div>
  );
};

const TRILHA_GANHO = Math.pow(10, (-16.5 - 22 + 19.5) / 20);
export const AdFriendsF: React.FC<AdFriendsFProps> = ({ id, hibrido }) => {
  const pre = fr(PRE(id));
  return (
    <AbsoluteFill style={{ background: "#07070A" }}>
      <Sequence durationInFrames={pre}><Gancho clip={CFG[id].pre} /></Sequence>
      <Sequence from={pre}><Corpo id={id} hibrido={hibrido} /></Sequence>
    </AbsoluteFill>
  );
};
const Corpo: React.FC<AdFriendsFProps> = ({ id, hibrido }) => {
  const c0 = CFG[id];
  const c = React.useMemo(() => (hibrido && HIB[id] ? { ...c0, beats: c0.beats.map((b) => (HIB[id][String(b.de)] ? { de: b.de, v: HIB[id][String(b.de)] } : b)) } : c0), [c0, hibrido, id]);
  const f = useCurrentFrame();
  const a = f / FPS;
  const total = duracaoFriendsF(id) / FPS - PRE(id);
  const peds = React.useMemo(() => pedacos(c), [c]);
  const bi = Math.max(0, c.beats.reduce((acc, b, i) => (a >= b.de ? i : acc), 0));
  const b = c.beats[bi];
  let fundo = 0, fundoDe = 0;
  for (let i = 0; i <= bi; i++) if (c.beats[i].v.k === "cena") { fundo = (c.beats[i].v as Extract<V, { k: "cena" }>).clip; fundoDe = c.beats[i].de; }
  const tranco = interpolate(spr(f, b.de), [0, 1], [1.07, 1]);
  const v = b.v;
  const cena = v.k === "cena";
  const t = TEMA[temaDe(v)];
  // onda: a cor nova NASCE do centro em 0,3 s (troca de batida visível até de canto de olho)
  const onda = interpolate(a - b.de, [0, 0.3], [0, 1], { ...clamp, easing: easeOut });
  const deriva = 1 + 0.02 * Math.min(4, a - b.de);
  return (
    <AbsoluteFill style={{ background: "#07070A" }}>
      <Audio src={staticFile("strings/classica/bed/vivaldi_0.mp3")} volume={(ff) => { const tt = ff / FPS; return TRILHA_GANHO * Math.min(1, tt / 0.25) * Math.max(0, Math.min(1, (total - tt) / 0.8)); }} />
      <Audio src={staticFile(c.voz)} />
      <Video clip={fundo} de={fundoDe} style={{ position: "absolute", left: -540, top: -80, width: 2160, height: 2080, objectFit: "cover", filter: "blur(46px) brightness(0.55) saturate(1.4)" }} />
      {!cena && <div style={{ position: "absolute", left: 540 - 1300, top: 820 - 1300, width: 2600, height: 2600, borderRadius: 1300, background: `radial-gradient(circle at 50% 42%, ${t.bg} 0%, ${t.bg} 55%, ${t.bg}E6 100%)`, transform: `scale(${bi === 0 ? 1 : onda})` }} />}
      <AbsoluteFill style={{ transform: `scale(${tranco * deriva})`, transformOrigin: "50% 42%" }}>
        {v.k === "cena" && <Cena a={a} f={f} de={b.de} v={v} />}
        {v.k === "num" && <Num a={a} f={f} de={b.de} v={v} t={t} />}
        {v.k === "texto" && <Texto a={a} f={f} v={v} t={t} />}
        {v.k === "lista" && <Lista a={a} f={f} v={v} />}
        {v.k === "versus" && <Versus a={a} f={f} v={v} />}
        {v.k === "icone" && <IconeUm a={a} f={f} de={b.de} v={v} t={t} />}
        {v.k === "print" && <Print a={a} f={f} de={b.de} v={v} />}
        {v.k === "coment" && <Coment f={f} de={b.de} v={v} />}
        {v.k === "cta" && <Cta a={a} f={f} de={b.de} />}
        {v.k === "app" && (() => {
          const dur = (c.beats[bi + 1]?.de ?? c.words.duration) - b.de;
          const s = spr(f, b.de);
          return (
            <>
              <div style={{ position: "absolute", left: "50%", top: 150, transform: `translateX(-50%) translateY(${interpolate(s, [0, 1], [220, 0])}px) rotate(${interpolate(s, [0, 1], [6, -2])}deg)` }}>
                <Sequence from={fr(b.de)} durationInFrames={fr(dur) + 2} layout="none"><Celular w={560} app={v.app} dur={dur} /></Sequence>
              </div>
              {v.tit && <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}><div style={{ background: C.amarelo, color: "#111", fontFamily: SANS, fontWeight: 800, fontSize: 56, letterSpacing: -1, padding: "12px 28px", borderRadius: 16, transform: `rotate(-2deg) scale(${interpolate(s, [0, 1], [1.4, 1])})`, boxShadow: "0 16px 40px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>{v.tit}</div></div>}
            </>
          );
        })()}
      </AbsoluteFill>
      <Legenda a={a} f={f} peds={peds} y={v.k === "cta" ? 1390 : 1490} />
    </AbsoluteFill>
  );
};
