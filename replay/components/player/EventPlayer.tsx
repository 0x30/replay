import { Replayer } from "rrweb";
import { defineComponent, inject, nextTick, onMounted, ref } from "vue";
import "rrweb/dist/rrweb.min.css";
import Style from "./EventPlayer.module.scss";
import { eventInjectKey } from "../../util/libInjectKey";
import { useInitPlayer } from "../../util/libPlayState";

export const EventPlayer = defineComponent({
  setup: () => {
    const events = inject(eventInjectKey, []);
    const playerElement = ref<HTMLDivElement>();
    const playerWarpElement = ref<HTMLDivElement>();

    onMounted(async () => {
      await nextTick();
      useInitPlayer(new Replayer(events, { root: playerElement.value }));
    });

    return () => {
      return (
        <div class={Style.playerWarp} ref={playerWarpElement}>
          <div class={Style.player} ref={playerElement}></div>
        </div>
      );
    };
  },
});
