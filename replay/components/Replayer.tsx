import { defineComponent, PropType, provide } from "vue";
import { NetworkTable } from "./network/Network";

import "../style/var.css";
import Style from "./Replayer.module.scss";
import { eventWithTime } from "rrweb/typings/types";
import Player from "./player/index";
import { eventInjectKey } from "../util/libInjectKey";
import { ConsoleComponent } from "./console";

export const Replayer = defineComponent({
  name: "ReplayComponent",
  props: {
    events: Array as PropType<eventWithTime[]>,
  },
  setup: (props) => {
    provide(eventInjectKey, props.events);

    return () => {
      return (
        <div class={Style.body}>
          <NetworkTable class={Style.network} />
          <div class={Style.bottomBody}>
            <Player />
            <ConsoleComponent />
          </div>
        </div>
      );
    };
  },
});
