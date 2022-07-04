import { defineComponent } from "vue";
import { EventPlayer } from "./EventPlayer";
import { EventPlayerControl } from "./EventPlayerControl";
import Style from "./index.module.scss";

import "element-plus/dist/index.css"

export default defineComponent(() => {
  return () => {
    return (
      <div class={Style.body}>
        <EventPlayer />
        <EventPlayerControl />
      </div>
    );
  };
});
