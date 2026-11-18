// 18/11/2026 · VARIAÇÕES DE GANCHO do "demo-figurinha" (AdDemoApp d4-figurinha), o anúncio que mais leva gente pra oferta e
// pro checkout (3 de 7 visitas chegaram na oferta, 4 checkouts pela Meta), mas com o PIOR gancho da conta: só 25% param nos 3 s
// (os outros 40 a 53%) e por isso a Meta cobra CPM de R$187. Marcos: "faz os melhores... me surpreende... me ajuda com essa CPM".
// Regra: muda SÓ o começo; o corpo é o d4 idêntico (mesma voz, mesmas batidas, a partir de "Olha isso aqui").
// O que os ganchos que seguram 48-53% têm em comum (f3-errado, f5-ouvido, f2-cuidado): Friends nomeado no 1º segundo + tensão.
//  · fg1-ofensiva: a chama de "300 dias de ofensiva" contando no frame 0 em cima da cena de Friends; APAGA em "não entende".
//  · fg2-para: tela de app de figurinha (recriada, sem marca) com o dedo tocando no frame 0; X vermelho carimba em "Inglês não".
//  · fg3-cena: cena de Friends COM SOM no frame 0 + "Entendeu?"; depois a tela de figurinha leva o X em "nunca".
// Vozes Fish (mesma voz do d4) em public/friends-ads/fg*.mp3, word-level local (whisper.cpp). Sem trilha, sem SFX, sem emoji.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing, spring } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Celular, Legenda, Seta, Adesivo, pedacos } from "./AdDemoApp";
import w4 from "./d4-figurinha-tight.json";
import h1 from "./fg1-ofensiva-words.json";
import h2 from "./fg2-para-words.json";
import h3 from "./fg3-cena-words.json";

const { fontFamily: SANS } = loadInter("normal", { weights: ["700", "800", "900"], subsets: ["latin", "latin-ext"] });
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const C = { amarelo: "#FFD60A", vermelho: "#FF3B30", verde: "#22C55E", roxo: "#7C5CFF" };
const BATE = { damping: 10, stiffness: 210, mass: 0.5 };
const spr = (f: number, em: number, cfg = BATE) => spring({ frame: f - fr(em), fps: FPS, config: cfg });
type W = { word: string; start: number; end: number };

const APP = { series: 6.3, cena: 19.15, en: 22.85, repetir: 26.15, pt: 33.95, botoes: 37.5, shadCena: 52.7, mic: 56.0 };
const ELA = [2.0, 9.5, 17.0, 24.5, 31.0];
const CORPO_DE = 2.92; // corpo do d4 começa aqui no áudio dele ("Olha isso aqui" em 3,00)

type App = { k: "app"; app: number; congela?: boolean; zoom?: { x: number; y: number; s: number; em: number }; anel?: { x: number; y: number; w: number; h: number; em: number } };
type Pessoa = { k: "pessoa"; app: number; ela: number; seta?: boolean };
type Quiz = { k: "quiz"; toque: number; x: number };
type Beat = { de: number; v: App | Pessoa | Quiz; adesivo?: string; chama?: { apaga: number } };
type Var = { voz: string; hook: { duration: number; words: W[] }; pre: number; quente: RegExp; ganchos: (H: number) => Beat[] };

const VARS: Record<string, Var> = {
  "fg1-ofensiva": {
    voz: "fg1-ofensiva", hook: h1, pre: 0, quente: /ofensiva|friends|legenda|figurinha|repete|entender|truque/i,
    ganchos: (H) => [{ de: 0, v: { k: "app", app: APP.cena, zoom: { x: 0.5, y: 0.4, s: 1.34, em: -0.5 } }, chama: { apaga: H + 1.78 } }],
  },
  "fg2-para": {
    voz: "fg2-para", hook: h2, pre: 0, quente: /figurinha|inglês|friends|repete|entender|truque/i,
    ganchos: (H) => [{ de: 0, v: { k: "quiz", toque: 0.2, x: H + 1.32 } }],
  },
  "fg3-cena": {
    voz: "fg3-cena", hook: h3, pre: 2.4, quente: /figurinha|nunca|friends|repete|entender|truque/i,
    ganchos: (H) => [
      { de: 0, v: { k: "app", app: APP.cena, zoom: { x: 0.5, y: 0.4, s: 1.34, em: -0.5 } }, adesivo: "Entendeu?" },
      { de: H + 1.15, v: { k: "quiz", toque: H + 1.3, x: H + 2.3 } },
    ],
  },
};
export const AD_FIGURINHA_IDS = Object.keys(VARS);

// linha do tempo de uma variação (tudo em segundos do VÍDEO)
const monta = (id: string) => {
  const c = VARS[id];
  const H = c.pre; // a voz do gancho começa aqui
  const fimH = c.hook.words[c.hook.words.length - 1].end;
  const B0 = H + fimH + 0.12; // o corpo do d4 entra aqui (pausa total até "Olha" = 0,20 s)
  const desl = (t: number) => B0 + (t - CORPO_DE);
  const words: W[] = [
    ...c.hook.words.map((w) => ({ ...w, start: w.start + H, end: w.end + H })),
    ...(w4.words as W[]).filter((w) => w.start >= CORPO_DE).map((w) => ({ ...w, start: desl(w.start), end: desl(w.end) })),
  ];
  const corpo: Beat[] = [
    { de: B0 - 0.04, v: { k: "app", app: APP.series + 0.4 } },
    { de: desl(3.8), v: { k: "app", app: APP.cena } },
    { de: desl(5.9), v: { k: "app", app: APP.repetir } },
    { de: desl(7.3), v: { k: "app", app: APP.botoes, congela: true, anel: { x: 0.04, y: 0.76, w: 0.92, h: 0.21, em: desl(8.4) } } },
    { de: desl(9.9), v: { k: "app", app: APP.mic - 0.4, zoom: { x: 0.5, y: 0.82, s: 1.15, em: desl(10.2) } } },
    { de: desl(12.0), v: { k: "pessoa", app: APP.shadCena, ela: ELA[4], seta: true } },
  ];
  const total = desl(w4.duration) + 0.4;
  return { c, H, B0, words, beats: [...c.ganchos(H), ...corpo], total };
};
export const duracaoFigurinha = (id: string) => fr(monta(id).total);

// ── tela recriada de app de figurinha (genérica, sem marca de ninguém) ─────────────────────────
const Figura: React.FC<{ tipo: string; s: number }> = ({ tipo, s }) => {
  const st = { width: s, height: s } as const;
  if (tipo === "gato") return (<svg viewBox="0 0 100 100" style={st}><path d="M22 30 L30 8 L44 26 Q50 24 56 26 L70 8 L78 30 Q90 46 82 66 Q72 88 50 88 Q28 88 18 66 Q10 46 22 30Z" fill="#F4A340" /><circle cx="38" cy="50" r="6" fill="#222" /><circle cx="62" cy="50" r="6" fill="#222" /><path d="M46 62 L54 62 L50 67Z" fill="#E0567A" /><path d="M50 67 Q44 74 38 70 M50 67 Q56 74 62 70" stroke="#222" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>);
  if (tipo === "maçã") return (<svg viewBox="0 0 100 100" style={st}><path d="M50 30 Q30 18 18 36 Q6 60 26 84 Q38 96 50 88 Q62 96 74 84 Q94 60 82 36 Q70 18 50 30Z" fill="#E5383B" /><path d="M50 30 Q50 18 58 10" stroke="#5B3A1A" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M54 20 Q68 8 78 16 Q66 28 54 20Z" fill="#3FA34D" /></svg>);
  if (tipo === "carro") return (<svg viewBox="0 0 100 100" style={st}><path d="M10 62 L16 44 Q20 36 30 36 L64 36 Q74 36 80 44 L90 58 L92 70 L8 70Z" fill="#3B82F6" /><path d="M28 42 L62 42 L72 54 L22 54Z" fill="#BFE3FF" /><circle cx="28" cy="72" r="10" fill="#222" /><circle cx="72" cy="72" r="10" fill="#222" /></svg>);
  return (<svg viewBox="0 0 100 100" style={st}><path d="M14 48 L50 16 L86 48Z" fill="#D9534F" /><rect x="22" y="46" width="56" height="42" fill="#F2C14E" /><rect x="44" y="62" width="14" height="26" fill="#7A4A21" /><rect x="28" y="54" width="12" height="12" fill="#BFE3FF" /></svg>);
};
const TelaQuiz: React.FC<{ w: number; f: number; toque: number; x: number }> = ({ w, f, toque, x }) => {
  const h = w * (1688 / 780), borda = w * 0.035, raio = w * 0.13, k = w / 740;
  const cartas = ["gato", "maçã", "carro", "casa"];
  const tocou = f >= fr(toque + 0.18);
  const sT = spr(f, toque + 0.18);
  // dedo fantasma: desce até a carta "gato" e aperta
  const dedoY = interpolate(f, [fr(toque - 0.25), fr(toque + 0.1)], [520 * k, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const aperta = interpolate(f, [fr(toque + 0.1), fr(toque + 0.2), fr(toque + 0.35)], [1, 0.82, 1], clamp);
  const sX = spr(f, x, { damping: 9, stiffness: 180, mass: 0.6 });
  const treme = f >= fr(x) && f < fr(x + 0.35) ? Math.sin((f - fr(x)) * 2.4) * 10 * (1 - (f - fr(x)) / fr(0.35)) : 0;
  return (
    <div style={{ position: "relative", width: w + borda * 2, height: h + borda * 2, borderRadius: raio, padding: borda, background: "linear-gradient(160deg,#2e2e35,#0d0d10)", boxShadow: "0 0 0 3px rgba(255,255,255,.14), 0 50px 120px rgba(0,0,0,.55)", transform: `translateX(${treme}px)` }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: raio - borda, overflow: "hidden", background: "#fff", fontFamily: SANS }}>
        {/* topo: fechar + barra de progresso + moedas */}
        <div style={{ position: "absolute", top: 130 * k, left: 44 * k, right: 44 * k, display: "flex", alignItems: "center", gap: 26 * k }}>
          <svg width={46 * k} height={46 * k} viewBox="0 0 24 24" stroke="#9AA0A6" strokeWidth="3" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          <div style={{ flex: 1, height: 34 * k, borderRadius: 99, background: "#ECECEC", overflow: "hidden" }}><div style={{ width: `${interpolate(sT, [0, 1], [55, 70])}%`, height: "100%", borderRadius: 99, background: C.roxo }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 * k, fontWeight: 900, fontSize: 44 * k, color: "#F59E0B" }}><div style={{ width: 40 * k, height: 40 * k, borderRadius: 99, background: "#FBBF24", border: `${5 * k}px solid #F59E0B` }} />{tocou ? 1240 : 1230}</div>
        </div>
        <div style={{ position: "absolute", top: 250 * k, left: 0, right: 0, textAlign: "center", fontWeight: 900, fontSize: 58 * k, color: "#1F2937", letterSpacing: -1 }}>Toque na figurinha certa</div>
        <div style={{ position: "absolute", top: 350 * k, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * k, padding: `${14 * k}px ${34 * k}px`, borderRadius: 24 * k, border: `${4 * k}px solid #E5E7EB`, fontWeight: 900, fontSize: 64 * k, color: C.roxo }}>
            <svg width={56 * k} height={56 * k} viewBox="0 0 24 24" fill={C.roxo}><path d="M3 9v6h4l5 5V4L7 9H3z" /><path d="M16 8.5a4.5 4.5 0 010 7" stroke={C.roxo} strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>cat
          </div>
        </div>
        <div style={{ position: "absolute", top: 520 * k, left: 44 * k, right: 44 * k, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 * k }}>
          {cartas.map((t, i) => {
            const certa = i === 0 && tocou;
            return (
              <div key={t} style={{ height: 380 * k, borderRadius: 34 * k, border: `${6 * k}px solid ${certa ? C.verde : "#E5E7EB"}`, borderBottomWidth: 14 * k, background: certa ? "#E9FBEF" : "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 * k, transform: certa ? `scale(${interpolate(sT, [0, 1], [0.9, 1])})` : undefined }}>
                <Figura tipo={t} s={190 * k} />
                <div style={{ fontWeight: 800, fontSize: 48 * k, color: certa ? "#15803D" : "#374151" }}>{t}</div>
              </div>
            );
          })}
        </div>
        {tocou && (
          <div style={{ position: "absolute", top: 600 * k - interpolate(sT, [0, 1], [0, 90 * k]), left: 250 * k, fontWeight: 900, fontSize: 80 * k, color: C.verde, opacity: interpolate(f, [fr(toque + 0.2), fr(toque + 0.3), fr(toque + 1.0), fr(toque + 1.3)], [0, 1, 1, 0], clamp), textShadow: "0 4px 0 #fff" }}>+10</div>
        )}
        <div style={{ position: "absolute", bottom: 90 * k, left: 44 * k, right: 44 * k, height: 130 * k, borderRadius: 30 * k, background: tocou ? C.verde : "#E5E7EB", borderBottom: `${10 * k}px solid ${tocou ? "#15803D" : "#CFCFCF"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 52 * k, color: tocou ? "#fff" : "#9CA3AF", letterSpacing: 2 }}>VERIFICAR</div>
        {/* dedo */}
        {f >= fr(toque - 0.25) && f < fr(x) && (
          <div style={{ position: "absolute", left: 220 * k, top: 740 * k + dedoY, width: 120 * k, height: 120 * k, borderRadius: 99, background: "rgba(255,255,255,.85)", border: `${6 * k}px solid rgba(0,0,0,.35)`, boxShadow: "0 10px 30px rgba(0,0,0,.35)", transform: `scale(${aperta})` }} />
        )}
        {/* carimbo: X vermelho */}
        {f >= fr(x) && (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,12,.55)", opacity: Math.min(1, sX * 1.4) }} />
            <div style={{ position: "absolute", left: "50%", top: "46%", width: 0, height: 0, transform: `scale(${interpolate(sX, [0, 1], [2.2, 1])}) rotate(-8deg)` }}>
              {[45, -45].map((r) => <div key={r} style={{ position: "absolute", left: -330 * k, top: -46 * k, width: 660 * k, height: 92 * k, borderRadius: 46 * k, background: C.vermelho, transform: `rotate(${r}deg)`, boxShadow: "0 18px 40px rgba(0,0,0,.45)" }} />)}
            </div>
          </>
        )}
      </div>
      <div style={{ position: "absolute", top: borda + w * 0.025, left: "50%", transform: "translateX(-50%)", width: w * 0.3, height: w * 0.085, borderRadius: w, background: "#000" }} />
    </div>
  );
};

// ── chama da ofensiva: conta até 300 no frame 0 e APAGA na palavra "não" ─────────────────────
const Chama: React.FC<{ f: number; apaga: number }> = ({ f, apaga }) => {
  const s0 = spr(f, 0);
  const n = Math.round(interpolate(f, [0, fr(0.6)], [0, 300], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const sA = f >= fr(apaga) ? spr(f, apaga, { damping: 12, stiffness: 160, mass: 0.6 }) : 0;
  const tremula = 1 + Math.sin(f / 2.2) * 0.04 * (1 - sA);
  const risco = interpolate(f, [fr(apaga + 0.05), fr(apaga + 0.3)], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 9 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 46px 22px 30px", borderRadius: 36, background: "#fff", boxShadow: "0 24px 60px rgba(0,0,0,.4)", transform: `rotate(-3deg) scale(${interpolate(s0, [0, 1], [1.6, 1])})`, fontFamily: SANS }}>
        <svg width="150" height="170" viewBox="0 0 100 120" style={{ transform: `scale(${tremula * interpolate(sA, [0, 1], [1, 0.82])})`, filter: `grayscale(${sA})`, opacity: interpolate(sA, [0, 1], [1, 0.55]) }}>
          <path d="M50 6 C58 30 84 40 84 72 C84 98 68 114 50 114 C32 114 16 98 16 74 C16 54 30 46 34 30 C40 42 44 46 48 48 C46 34 46 20 50 6Z" fill="#FF7A1A" />
          <path d="M50 52 C56 66 70 72 70 88 C70 102 61 110 50 110 C39 110 30 102 30 90 C30 80 38 74 40 66 C44 74 48 76 50 76 C49 68 48 60 50 52Z" fill="#FFD60A" />
        </svg>
        <div style={{ position: "relative" }}>
          <div style={{ fontWeight: 900, fontSize: 132, lineHeight: 1, letterSpacing: -4, color: sA > 0.5 ? "#9CA3AF" : "#FF7A1A", fontVariantNumeric: "tabular-nums" }}>{n}</div>
          <div style={{ fontWeight: 800, fontSize: 44, color: "#1F2937", marginTop: 4 }}>dias de ofensiva</div>
          <div style={{ position: "absolute", left: -10, top: 66, height: 16, width: `${risco * 110}%`, borderRadius: 8, background: C.vermelho, transform: "rotate(-6deg)" }} />
        </div>
      </div>
    </div>
  );
};

export const AdFigurinha: React.FC<{ id: string }> = ({ id }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const m = React.useMemo(() => monta(id), [id]);
  const peds = React.useMemo(() => pedacos(m.words), [m]);
  const bi = Math.max(0, m.beats.reduce((acc, b, i) => (t >= b.de ? i : acc), 0));
  const b = m.beats[bi];
  const fimBeat = m.beats[bi + 1]?.de ?? m.total;
  const dur = fimBeat - b.de;
  const tranco = interpolate(spr(f, b.de), [0, 1], [1.07, 1]);
  const v = b.v;
  const fundo = (ela: number, blur: boolean) => (
    <Sequence from={fr(b.de)} durationInFrames={fr(dur) + 2} layout="none">
      <OffthreadVideo src={staticFile("pensar/london-full.mp4")} muted startFrom={fr(ela)} style={blur ? { position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", filter: "blur(38px) brightness(.45)" } : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  );
  const WP = 740, HP = WP * (1688 / 780);
  return (
    <AbsoluteFill style={{ background: "#07070A", overflow: "hidden" }}>
      {m.c.pre > 0 && <Sequence durationInFrames={fr(m.c.pre) + 4}><Audio src={staticFile("friends-ads/c1.mp4")} volume={0.9} /></Sequence>}
      <Sequence from={fr(m.H)}><Audio src={staticFile(`friends-ads/${m.c.voz}.mp3`)} /></Sequence>
      <Sequence from={fr(m.B0)}><Audio src={staticFile("friends-ads/d4-figurinha-tight.mp3")} startFrom={fr(CORPO_DE)} /></Sequence>
      <AbsoluteFill style={{ transform: `scale(${tranco})` }}>
        {v.k === "pessoa" ? (
          <>
            {fundo(v.ela, false)}
            <div style={{ position: "absolute", left: "50%", top: 845 + interpolate(spr(f, b.de, { damping: 14, stiffness: 120, mass: 0.7 }), [0, 1], [260, 0]), transform: `translateX(-50%) rotate(${-4 + Math.sin(f / 22) * 0.8}deg)` }}>
              <Sequence from={fr(b.de)} durationInFrames={fr(dur) + 2} layout="none"><Celular w={560} app={v.app} dur={dur} /></Sequence>
            </div>
          </>
        ) : (
          <>
            {fundo(ELA[bi % ELA.length], true)}
            <div style={{ position: "absolute", left: "50%", top: 70, transform: "translateX(-50%)", width: WP + 52, height: HP + 52 }}>
              {v.k === "quiz" ? (
                <div style={{ transform: `translateY(${interpolate(spr(f, b.de, { damping: 13, stiffness: 170, mass: 0.6 }), [0, 1], [b.de === 0 ? 240 : 0, 0])}px)` }}><TelaQuiz w={WP} f={f} toque={v.toque} x={v.x} /></div>
              ) : (() => {
                const z = v.zoom; const zs = z ? interpolate(f, [fr(z.em), fr(z.em + 0.45)], [1, z.s], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
                return (
                  <div style={{ width: "100%", height: "100%", transform: `scale(${zs})`, transformOrigin: z ? `${z.x * 100}% ${z.y * 100}%` : "50% 50%" }}>
                    <Sequence from={fr(b.de)} durationInFrames={fr(dur) + 2} layout="none"><Celular w={WP} app={v.app} congela={v.congela} dur={dur} /></Sequence>
                    {v.anel && f >= fr(v.anel.em) && (() => { const s = spr(f, v.anel!.em); return <div style={{ position: "absolute", left: 26 + v.anel!.x * WP, top: 26 + v.anel!.y * HP, width: v.anel!.w * WP, height: v.anel!.h * HP, borderRadius: 28, border: `8px solid ${C.amarelo}`, boxShadow: "0 0 0 9999px rgba(0,0,0,.45)", transform: `scale(${interpolate(s, [0, 1], [1.12, 1])})`, opacity: Math.min(1, s * 2) }} />; })()}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </AbsoluteFill>
      {b.chama && <Chama f={f} apaga={b.chama.apaga} />}
      {b.adesivo && <Adesivo txt={b.adesivo} f={f} em={b.de + 0.05} y={150} />}
      {v.k === "pessoa" && v.seta && <Seta f={f} em={b.de + 0.4} />}
      <Legenda a={t} f={f} peds={peds} y={v.k === "pessoa" ? 400 : 1700} quente={m.c.quente} />
    </AbsoluteFill>
  );
};
