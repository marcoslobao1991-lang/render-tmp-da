type BlocoLegenda = { de: number; ate: number; texto: string; enfase?: "normal" | "impacto" | "mega" };

// ═══════════════════════════════════════════════════════════════
// CREATOR 2B — o ad campeão: 124 vendas, CPA R$126.
//
// Estrutura mais simples que a da menina: um ponto de corte só.
// A cena toca sozinha no começo e ele entra falando depois, sem
// buraco nenhum no meio (fala de 1,10s a 30,80s quase sem pausa).
//
// Por isso falaAntes = 0: não existe fala antes da cena.
// ═══════════════════════════════════════════════════════════════

export const CORTES_2B = {
  /** não há fala antes da cena: ela abre o ad */
  falaAntes: 0,
  /** ele começa a falar aqui, na gravação original */
  falaVolta: 1.1,
  /** respiro entre o fim da cena e ele entrar */
  respiro: 0.25,
  /**
   * duração útil da gravação original.
   *
   * 30,9 e não 31,14 de propósito: o webm com alpha tem 31,00s
   * exatos, e pedir range além do fim do arquivo faz o Chrome
   * devolver NotSupportedError no play. A última palavra dele
   * termina em 30,80, então nada de fala se perde aqui.
   */
  trilhaSeg: 30.9,
};

/**
 * Posição dele no quadro. O webm com alpha foi recortado de
 * (260,540) num quadro 712x1280, então em 1080x1920 a escala é
 * 1080/712 = 1,5169.
 */
export const MOLDURA_2B = {
  left: 394,
  top: 819,
  width: 686,
  height: 1122,
};

/**
 * Legendas em tempo da trilha ORIGINAL, cravadas no whisper
 * word-level (creator-2b-words.json). A montagem desloca sozinha.
 * Correções do whisper: "silks" = simples, "serve mais" = saiba mais.
 */
export const LEGENDAS_2B: BlocoLegenda[] = [
  { de: 1.1, ate: 2.04, texto: "imagina repetir" },
  { de: 2.04, ate: 3.0, texto: "essa mesma cena" },
  { de: 3.0, ate: 3.82, texto: "47", enfase: "mega" },
  { de: 3.82, ate: 5.16, texto: "vezes seguidas", enfase: "impacto" },
  { de: 5.16, ate: 6.12, texto: "no automático" },
  { de: 6.12, ate: 6.5, texto: "o que você" },
  { de: 6.5, ate: 6.78, texto: "acha que vai" },
  { de: 6.78, ate: 7.42, texto: "acontecer?", enfase: "impacto" },
  { de: 7.42, ate: 8.48, texto: "é muito simples" },
  { de: 8.48, ate: 8.82, texto: "você vai" },
  { de: 8.82, ate: 9.1, texto: "entender" },
  { de: 9.1, ate: 9.9, texto: "100%", enfase: "mega" },
  { de: 9.9, ate: 10.78, texto: "dela" },
  { de: 10.78, ate: 11.32, texto: "talvez você não" },
  { de: 11.32, ate: 11.94, texto: "sabia que" },
  { de: 11.94, ate: 12.5, texto: "tudo começa" },
  { de: 12.5, ate: 13.08, texto: "a se repetir" },
  { de: 13.08, ate: 13.78, texto: "e a próxima" },
  { de: 13.78, ate: 14.6, texto: "cena que você fizer" },
  { de: 14.6, ate: 15.28, texto: "a mesma coisa" },
  { de: 15.28, ate: 15.94, texto: "vai ficar" },
  { de: 15.94, ate: 16.72, texto: "muito mais fácil" },
  { de: 16.72, ate: 17.28, texto: "aqui, muito" },
  { de: 17.28, ate: 17.9, texto: "muito mais fácil", enfase: "impacto" },
  { de: 17.9, ate: 18.84, texto: "mesmo", enfase: "impacto" },
  { de: 18.84, ate: 19.26, texto: "e esse foi" },
  { de: 19.26, ate: 19.78, texto: "o jeito" },
  { de: 19.78, ate: 20.68, texto: "sem graça", enfase: "impacto" },
  { de: 20.68, ate: 21.14, texto: "que eu" },
  { de: 21.14, ate: 21.52, texto: "usei pra" },
  { de: 21.52, ate: 22.24, texto: "ficar muito" },
  { de: 22.24, ate: 22.7, texto: "bom em" },
  { de: 22.7, ate: 23.18, texto: "ouvir" },
  { de: 23.18, ate: 24.24, texto: "e conversar também" },
  { de: 24.24, ate: 24.8, texto: "eu fiz um" },
  { de: 24.8, ate: 25.44, texto: "vídeo mostrando" },
  { de: 25.44, ate: 26.1, texto: "como que isso" },
  { de: 26.1, ate: 26.9, texto: "funciona de um" },
  { de: 26.9, ate: 27.44, texto: "jeito que dá" },
  { de: 27.44, ate: 28.08, texto: "pra você começar" },
  { de: 28.08, ate: 28.56, texto: "a aplicar" },
  { de: 28.56, ate: 28.96, texto: "agora mesmo", enfase: "impacto" },
  { de: 28.96, ate: 29.36, texto: "e pra você" },
  { de: 29.36, ate: 29.62, texto: "assistir" },
  { de: 29.62, ate: 30.12, texto: "é só" },
  { de: 30.12, ate: 30.44, texto: "clicar em" },
  { de: 30.44, ate: 31.14, texto: "saiba mais", enfase: "mega" },
];
