import "./index.css";
import { Composition } from "remotion";
import { AdDemoApp, duracaoDemoApp, AD_DEMOAPP_IDS } from "./ads/friends/AdDemoApp";
import { AdFriendsF, duracaoFriendsF, AD_FRIENDSH_IDS } from "./ads/friends/AdFriendsF";
import { AdFigurinha, duracaoFigurinha, AD_FIGURINHA_IDS } from "./ads/friends/AdFigurinha";
import { AdGS3, duracaoGS3, AD_GS3_IDS } from "./ads/gs3/AdGS3";

export const RemotionRoot: React.FC = () => (
  <>
    {AD_DEMOAPP_IDS.map((id) => (
      <Composition key={id} id={`da-${id}`} component={AdDemoApp} durationInFrames={duracaoDemoApp(id)} fps={30} width={1080} height={1920} defaultProps={{ id }} />
    ))}
    {AD_FRIENDSH_IDS.map((id) => (
      <Composition key={"h" + id} id={`fh-${id}`} component={AdFriendsF} durationInFrames={duracaoFriendsF(id)} fps={30} width={1080} height={1920} defaultProps={{ id, hibrido: true }} />
    ))}
    {AD_FIGURINHA_IDS.map((id) => (
      <Composition key={"fig" + id} id={`fig-${id}`} component={AdFigurinha} durationInFrames={duracaoFigurinha(id)} fps={30} width={1080} height={1920} defaultProps={{ id }} />
    ))}
    {AD_GS3_IDS.flatMap((id) => (["hook", "cena"] as const).map((ordem) => (
      <Composition key={id + ordem} id={`gs3-${id}-${ordem}`} component={AdGS3} durationInFrames={duracaoGS3(id, ordem)} fps={30} width={1080} height={1920} defaultProps={{ id, ordem }} />
    )))}
  </>
);
