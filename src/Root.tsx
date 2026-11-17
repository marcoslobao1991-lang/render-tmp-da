import "./index.css";
import { Composition } from "remotion";
import { AdDemoApp, duracaoDemoApp, AD_DEMOAPP_IDS } from "./ads/friends/AdDemoApp";

export const RemotionRoot: React.FC = () => (
  <>
    {AD_DEMOAPP_IDS.map((id) => (
      <Composition key={id} id={`da-${id}`} component={AdDemoApp} durationInFrames={duracaoDemoApp(id)} fps={30} width={1080} height={1920} defaultProps={{ id }} />
    ))}
  </>
);
