// 4 ads "DEMO-APP · o truque simples pra aprender inglês com Friends" (17/11/2026). Topo de funil, estilo UGC.
// Marcos: "sem lipsync... na raça com o que já temos, mockup, boca coberta" + "faz o que precisar ser feito".
// Camadas:
//  · PESSOA = a avatar de Londres (public/pensar/london-full.mp4, selfie) SEGURANDO O CELULAR com o app na frente da boca
//    (sem lipsync: o celular cobre a boca, os olhos ficam). É o gesto de creator mostrando o app pra câmera.
//  · APP = o celular cresce e ocupa a tela; dentro roda a GRAVAÇÃO REAL do app (public/friends-ads/app-hd.mp4, 780x1688,
//    gravada em 17/11 com ~/spy-meta/_app-grava-hd.mmjs, conta do Marcos, sem nome/usuário na tela).
// Linguagem dos ads de Friends aprovados em 15/11 (AdFriendsF): legenda gigante de 1 a 3 palavras com a palavra falada
// acendendo em amarelo, tranco de câmera na troca, 1 visual por batida. Sem trilha, sem SFX, sem emoji, sem travessão.
// Tempos em segundos do áudio apertado (<slug>-tight.json). AD 3 abre com a cena com SOM (2,6 s) antes da voz.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, Freeze, staticFile, useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { loadFont as loadDM } from "@remotion/google-fonts/DMSans";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import w1 from "./d1-truque-tight.json";
import w2 from "./d2-assistiu-tight.json";
import w3 from "./d3-entendeu-tight.json";
import w4 from "./d4-figurinha-tight.json";

const { fontFamily: DM } = loadDM("normal", { weights: ["800"], subsets: ["latin", "latin-ext"] });
const { fontFamily: SANS } = loadInter("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = { amarelo: "#FFD60A", turq: "#4ECDC4", coral: "#FF5A4D" };
type W = { word: string; start: number; end: number };
const BATE = { damping: 10, stiffness: 210, mass: 0.5 };
const spr = (f: number, em: number, cfg = BATE) => spring({ frame: f - fr(em), fps: FPS, config: cfg });

// momentos da gravação real do app (segundos dentro de app-hd.mp4, de app-hd-marcas.json)
const APP = { series: 6.3, tocaFriends: 9.3, eps: 11.9, cena: 19.15, en: 22.85, repetir: 26.15, pt: 33.95, botoes: 37.5, shadSeries: 47.6, shadCena: 52.7, mic: 56.0 };
// trechos da selfie dela (London) pra variar o gesto entre as batidas PESSOA
const ELA = [2.0, 9.5, 17.0, 24.5, 31.0];

type Pessoa = { k: "pessoa"; app: number; congela?: boolean; ela?: number; adesivo?: string; seta?: boolean };
type Tela = { k: "app"; app: number; congela?: boolean; zoom?: { x: number; y: number; s: number; em: number }; anel?: { x: number; y: number; w: number; h: number; em: number }; adesivo?: string };
type Beat = { de: number; v: Pessoa | Tela };
type Cfg = { slug: string; words: { duration: number; words: W[] }; off: number; cenaSom?: boolean; beats: Beat[]; quente: RegExp };

const CFG: Record<string, Cfg> = {
  "d1-truque": {
    slug: "d1-truque", words: w1, off: 0, quente: /truque|simples|friends|legenda|repete|repetição|entender/i,
    beats: [
      { de: 0, v: { k: "pessoa", app: APP.series, ela: ELA[0], adesivo: "inglês com Friends" } },
      { de: 3.0, v: { k: "app", app: APP.cena } },
      { de: 6.6, v: { k: "app", app: APP.en, zoom: { x: 0.5, y: 0.47, s: 1.28, em: 7.4 } } },
      { de: 8.3, v: { k: "app", app: APP.repetir } },
      { de: 10.2, v: { k: "pessoa", app: APP.repetir + 1.2, ela: ELA[1] } },
      { de: 15.0, v: { k: "pessoa", app: APP.pt, ela: ELA[2], seta: true } },
    ],
  },
  "d2-assistiu": {
    slug: "d2-assistiu", words: w2, off: 0, quente: /friends|legenda|truque|repete|entender|episódio|inteiro/i,
    beats: [
      { de: 0, v: { k: "pessoa", app: APP.cena, ela: ELA[3], adesivo: "10 vezes?" } },
      { de: 3.1, v: { k: "app", app: APP.series + 0.6 } },
      { de: 6.1, v: { k: "app", app: APP.cena } },
      { de: 8.2, v: { k: "app", app: APP.en, zoom: { x: 0.5, y: 0.47, s: 1.25, em: 8.9 } } },
      { de: 9.8, v: { k: "app", app: APP.repetir } },
      { de: 11.3, v: { k: "app", app: APP.eps, congela: true } },
      { de: 15.3, v: { k: "pessoa", app: APP.series, ela: ELA[4], seta: true } },
    ],
  },
  "d3-entendeu": {
    slug: "d3-entendeu", words: w3, off: 2.6, cenaSom: true, quente: /entendeu|truque|repetir|entender|cena|episódio/i,
    beats: [
      { de: -2.6, v: { k: "app", app: APP.cena, adesivo: "Você entendeu?" } },
      { de: 1.4, v: { k: "pessoa", app: APP.cena + 3.2, congela: true, ela: ELA[0] } },
      { de: 3.8, v: { k: "app", app: APP.en, zoom: { x: 0.5, y: 0.47, s: 1.3, em: 4.4 } } },
      { de: 5.6, v: { k: "app", app: APP.repetir, zoom: { x: 0.5, y: 0.4, s: 1.12, em: 5.7 } } },
      { de: 9.4, v: { k: "pessoa", app: APP.repetir + 1.5, ela: ELA[2], seta: false } },
      { de: 12.1, v: { k: "pessoa", app: APP.pt, ela: ELA[3], seta: true } },
    ],
  },
  "d4-figurinha": {
    slug: "d4-figurinha", words: w4, off: 0, quente: /figurinha|para|tudo|série|legenda|repete|entender|amanhã|imita|fala|truque|friends/i,
    beats: [
      { de: 0, v: { k: "pessoa", app: APP.series, ela: ELA[1] } },
      { de: 2.9, v: { k: "app", app: APP.series + 0.4 } },
      { de: 3.8, v: { k: "app", app: APP.cena } },
      { de: 5.9, v: { k: "app", app: APP.repetir } },
      { de: 7.3, v: { k: "app", app: APP.botoes, congela: true, anel: { x: 0.04, y: 0.76, w: 0.92, h: 0.21, em: 8.4 } } },
      { de: 9.9, v: { k: "app", app: APP.mic - 0.4, zoom: { x: 0.5, y: 0.82, s: 1.15, em: 10.2 } } },
      { de: 12.0, v: { k: "pessoa", app: APP.shadCena, ela: ELA[4], seta: true } },
    ],
  },
};
export const AD_DEMOAPP_IDS = Object.keys(CFG);
export type AdDemoAppProps = { id: string };
export const duracaoDemoApp = (id: string) => fr(CFG[id].words.duration + CFG[id].off + 0.5);

const limpa = (s: string) => s.replace(/[.,!?;:"]/g, "").toLowerCase();
const pedacos = (ws0: W[]) => {
  const out: { ws: W[]; ini: number; fim: number }[] = [];
  let cur: W[] = [];
  const fecha = () => { if (cur.length) out.push({ ws: cur, ini: cur[0].start, fim: cur[cur.length - 1].end }); cur = []; };
  ws0.forEach((w, i) => { const ant = ws0[i - 1]; if (cur.length && (cur.length >= 3 || (ant && w.start - ant.end > 0.25) || (ant && /[.?!,]"?$/.test(ant.word)))) fecha(); cur.push(w); });
  fecha();
  return out.map((p, i) => ({ ...p, ate: Math.min(out[i + 1]?.ini ?? p.fim + 0.6, p.fim + 0.6) }));
};
const Legenda: React.FC<{ a: number; f: number; peds: ReturnType<typeof pedacos>; y: number; quente: RegExp }> = ({ a, f, peds, y, quente }) => {
  const p = peds.find((k) => a >= k.ini - 0.04 && a < k.ate);
  if (!p) return null;
  const s = spring({ frame: f - fr(p.ini - 0.04), fps: FPS, config: { damping: 12, stiffness: 260, mass: 0.45 } });
  const chars = p.ws.map((w) => limpa(w.word)).join(" ").length;
  const tam = Math.min(104, Math.floor(860 / (0.66 * Math.max(1, chars))));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, transform: "translateY(-50%)", display: "flex", justifyContent: "center", zIndex: 8 }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [1.18, 1])})`, fontFamily: DM, fontWeight: 800, fontSize: tam, whiteSpace: "nowrap", lineHeight: 1.08, letterSpacing: -1.5, color: "#fff", WebkitTextStroke: "12px #000", paintOrder: "stroke fill", textShadow: "0 8px 22px rgba(0,0,0,.6)" } as React.CSSProperties}>
        {p.ws.map((w, i) => {
          const fim = p.ws[i + 1] ? p.ws[i + 1].start - 0.03 : p.ate;
          const ativa = a >= w.start - 0.03 && a < fim;
          const q = quente.test(limpa(w.word));
          const sw = ativa ? spr(f, w.start - 0.03) : 1;
          return <span key={i} style={{ display: "inline-block", color: ativa ? C.amarelo : q ? "#fff" : "#fff", transform: ativa ? `scale(${interpolate(sw, [0, 1], [1.16, 1.06])})` : undefined, marginRight: i < p.ws.length - 1 ? "0.34em" : 0 }}>{limpa(w.word)}</span>;
        })}
      </div>
    </div>
  );
};

// celular: moldura de iPhone com a gravação real do app dentro (a gravação começa em `app` segundos)
const Celular: React.FC<{ w: number; app: number; congela?: boolean; dur: number }> = ({ w, app, congela, dur }) => {
  const h = w * (1688 / 780);
  const borda = w * 0.035;
  const raio = w * 0.13;
  // barra de status de iPhone em cima (a gravação não tem); o app entra logo abaixo, cortando um pouco do rodapé
  const st = w * 0.11;
  const tela = <OffthreadVideo src={staticFile("friends-ads/app-hd.mp4")} muted startFrom={fr(app)} endAt={fr(app + dur + 1)} style={{ position: "absolute", left: 0, top: st, width: "100%", height: h - st, objectFit: "cover", objectPosition: "top center", display: "block" }} />;
  const ic = w / 390;
  return (
    <div style={{ position: "relative", width: w + borda * 2, height: h + borda * 2, borderRadius: raio, padding: borda, background: "linear-gradient(160deg,#2e2e35,#0d0d10)", boxShadow: "0 0 0 3px rgba(255,255,255,.14), 0 50px 120px rgba(0,0,0,.55)" }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: raio - borda, overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: st, display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${4 * ic}px ${24 * ic}px 0 ${30 * ic}px`, fontFamily: SANS, fontWeight: 700, fontSize: 15 * ic, color: "#111", background: "#fff", zIndex: 2 }}>
          <span>9:41</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 * ic }}>
            <svg width={17 * ic} height={11 * ic} viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#111" /><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#111" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#111" /><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#111" /></svg>
            <svg width={25 * ic} height={12 * ic} viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3.2" fill="none" stroke="#111" opacity=".45" /><rect x="2" y="2" width="17" height="8" rx="2" fill="#111" /><rect x="22.5" y="4" width="1.8" height="4" rx=".9" fill="#111" opacity=".45" /></svg>
          </span>
        </div>
        {congela ? <Freeze frame={0}>{tela}</Freeze> : tela}
      </div>
      <div style={{ position: "absolute", top: borda + w * 0.025, left: "50%", transform: "translateX(-50%)", width: w * 0.3, height: w * 0.085, borderRadius: w, background: "#000" }} />
    </div>
  );
};

const Adesivo: React.FC<{ txt: string; f: number; em: number; y: number; rot?: number }> = ({ txt, f, em, y, rot = -3 }) => {
  if (f < fr(em)) return null;
  const s = spr(f, em);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9 }}>
      <div style={{ transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [1.5, 1])})`, opacity: Math.min(1, s * 2), background: "#fff", color: "#111", fontFamily: SANS, fontWeight: 800, fontSize: 66, letterSpacing: -1.5, padding: "16px 34px", borderRadius: 18, boxShadow: "0 18px 50px rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>{txt}</div>
    </div>
  );
};
const Seta: React.FC<{ f: number; em: number }> = ({ f, em }) => {
  if (f < fr(em)) return null;
  const s = spr(f, em);
  const pulo = Math.sin((f - fr(em)) / 5) * 14;
  return (
    <div style={{ position: "absolute", bottom: 300 - pulo, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9, opacity: Math.min(1, s * 2) }}>
      <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke={C.amarelo} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,.6))" }}><path d="M12 4v15M5 12l7 7 7-7" /></svg>
    </div>
  );
};

export const AdDemoApp: React.FC<AdDemoAppProps> = ({ id }) => {
  const c = CFG[id];
  const f = useCurrentFrame();
  const a = f / FPS - c.off; // tempo do áudio da voz
  const peds = React.useMemo(() => pedacos(c.words.words), [c]);
  const bi = Math.max(0, c.beats.reduce((acc, b, i) => (a >= b.de ? i : acc), 0));
  const b = c.beats[bi];
  const fimBeat = (c.beats[bi + 1]?.de ?? c.words.duration + 0.5);
  const dur = fimBeat - b.de;
  const tranco = interpolate(spr(f, b.de + c.off), [0, 1], [1.07, 1]);
  const v = b.v;
  const fundoEla = (ela: number) => (
    <Sequence from={fr(b.de + c.off)} durationInFrames={fr(dur) + 2} layout="none">
      <OffthreadVideo src={staticFile("pensar/london-full.mp4")} muted startFrom={fr(ela)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ background: "#07070A", overflow: "hidden" }}>
      <Sequence from={fr(c.off)}><Audio src={staticFile(`friends-ads/${c.slug}-tight.mp3`)} /></Sequence>
      {c.cenaSom && <Sequence durationInFrames={fr(c.off) + 4}><Audio src={staticFile("friends-ads/c1.mp4")} volume={0.9} /></Sequence>}
      <AbsoluteFill style={{ transform: `scale(${tranco})` }}>
        {v.k === "pessoa" ? (
          <>
            {fundoEla(v.ela ?? 2)}
            {/* ela segura o celular na frente da boca: topo do aparelho logo abaixo dos olhos */}
            <div style={{ position: "absolute", left: "50%", top: 845 + interpolate(spr(f, b.de + c.off, { damping: 14, stiffness: 120, mass: 0.7 }), [0, 1], [260, 0]), transform: `translateX(-50%) rotate(${-4 + Math.sin(f / 22) * 0.8}deg)` }}>
              <Sequence from={fr(b.de + c.off)} durationInFrames={fr(dur) + 2} layout="none"><Celular w={560} app={v.app} congela={v.congela} dur={dur} /></Sequence>
            </div>
          </>
        ) : (
          <>
            <Sequence from={fr(b.de + c.off)} durationInFrames={fr(dur) + 2} layout="none">
              <OffthreadVideo src={staticFile("pensar/london-full.mp4")} muted startFrom={fr(ELA[bi % ELA.length])} style={{ position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(38px) brightness(.45)" }} />
            </Sequence>
            {(() => {
              const z = v.zoom; const zs = z ? interpolate(f, [fr(z.em + c.off), fr(z.em + c.off + 0.45)], [1, z.s], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
              const W = 740, H = W * (1688 / 780);
              return (
                <div style={{ position: "absolute", left: "50%", top: 70, transform: `translateX(-50%)`, width: W + 52, height: H + 52 }}>
                  <div style={{ width: "100%", height: "100%", transform: `scale(${zs})`, transformOrigin: z ? `${z.x * 100}% ${z.y * 100}%` : "50% 50%" }}>
                    <Sequence from={fr(b.de + c.off)} durationInFrames={fr(dur) + 2} layout="none"><Celular w={W} app={v.app} congela={v.congela} dur={dur} /></Sequence>
                    {v.anel && f >= fr(v.anel.em + c.off) && (() => { const s = spr(f, v.anel!.em + c.off); return <div style={{ position: "absolute", left: 26 + v.anel!.x * W, top: 26 + v.anel!.y * H, width: v.anel!.w * W, height: v.anel!.h * H, borderRadius: 28, border: `8px solid ${C.amarelo}`, boxShadow: "0 0 0 9999px rgba(0,0,0,.45)", transform: `scale(${interpolate(s, [0, 1], [1.12, 1])})`, opacity: Math.min(1, s * 2) }} />; })()}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </AbsoluteFill>
      {v.adesivo && <Adesivo txt={v.adesivo} f={f} em={b.de + c.off + 0.15} y={v.k === "app" ? 150 : 130} />}
      {v.k === "pessoa" && v.seta && <Seta f={f} em={b.de + c.off + 0.4} />}
      <Legenda a={a} f={f} peds={peds} y={v.k === "pessoa" ? 400 : 1700} quente={c.quente} />
    </AbsoluteFill>
  );
};
