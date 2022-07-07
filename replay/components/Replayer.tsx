import { defineComponent, PropType, provide } from "vue";
import { NetworkTable } from "./network/Network";

import "../style/var.css";
import Style from "./Replayer.module.scss";
import { eventWithTime } from "rrweb/typings/types";
import Player from "./player/index";
import { eventInjectKey } from "../util/libInjectKey";
import { ConsoleComponent } from "./console";
import { DragResize } from "./DragResize";

export const Replayer = defineComponent({
  name: "ReplayComponent",
  props: {
    events: Array as PropType<eventWithTime[]>,
  },
  setup: (props) => {
    provide(eventInjectKey, props.events);

    return () => {
      return (
        <DragResize id="play_body" class={Style.body} direction="vertical" initScale={0.65}>
          <NetworkTable class={Style.network} />
          <DragResize id="bottom_body" class={Style.bottomBody} initScale={0.3}>
            <Player />
            <ConsoleComponent />
          </DragResize>
        </DragResize>
      );
    };
  },
});
