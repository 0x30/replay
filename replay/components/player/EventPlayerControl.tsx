import { defineComponent } from "vue";
import Style from "./EventPlayerControl.module.scss";

export const EventPlayerControl = defineComponent({
  name: "EventPlayerControl",
  setup: () => {
    return () => (
      <div class={Style.body}>
        <i class="fa-solid fa-play"></i>
      </div>
    );
  },
});
