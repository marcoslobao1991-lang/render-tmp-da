import { staticFile } from "remotion";

// ═══════════════════════════════════════════════════════════════
// DE ONDE VÊM OS ARQUIVOS
//
// Os assets dos ads moram no Supabase, não em public/. O motivo é
// prático: o render rápido roda em 20 runners do GitHub em
// paralelo, e cada um faz checkout do repositório. Com os vídeos
// dentro de public/, seriam 773MB baixados 20 vezes por render —
// contra 1GB/mês de banda LFS do plano gratuito.
//
// Por URL, cada worker baixa só o que aquele ad usa (uns poucos
// MB), o repositório fica só com código, e o mesmo componente roda
// igual no Studio local e no runner.
// ═══════════════════════════════════════════════════════════════

export const BASE_ADS =
  "https://petrtewismhpzidcmmwb.supabase.co/storage/v1/object/public/media/ads/";

/**
 * Resolve um caminho de asset. Aceita três formas, pra não quebrar
 * nada que já existe:
 *   "https://..."          → usa como está
 *   "ads/ad-lab/x.mp4"     → completa com a base do Supabase
 *   "ads-campeoes/x.webm"  → cai pro public/ local (legado)
 */
export function asset(src: string): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("ads/")) return BASE_ADS + src.slice(4);
  return staticFile(src);
}
