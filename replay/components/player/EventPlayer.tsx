import { Replayer } from "rrweb";
import { eventWithTime } from "rrweb/typings/types";
import {
  defineComponent,
  inject,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import "rrweb/dist/rrweb.min.css";
import Style from "./EventPlayer.module.scss";
import { debounce } from "lodash-es";
import { eventInjectKey } from "../../util.ts/libInjectKey";

export const EventPlayer = defineComponent({
  setup: () => {
    const events = inject(eventInjectKey);
    const playerElement = ref<HTMLDivElement>();
    const playerWarpElement = ref<HTMLDivElement>();

    const size = reactive({
      playerWidth: 0,
      playerHeight: 0,
      playerWarpWidth: 0,
      playerWarpHeight: 0,
    });

    let player: Replayer | undefined = undefined;

    onMounted(async () => {
      await nextTick();

      player = new Replayer(events ?? [], {
        liveMode: true,
        root: playerElement.value,
      });

      player.on("resize", ({ width, height }: any) => {
        size.playerWidth = width;
        size.playerHeight = height;
      });

      if (playerWarpElement.value) {
        const resizeObserver = new ResizeObserver((entries) => {
          size.playerWarpWidth = entries[0].contentRect.width;
          size.playerWarpHeight = entries[0].contentRect.height;
        });
        resizeObserver.observe(playerWarpElement.value);
      }
    });

    watch(
      size,
      debounce(() => {
        if (player === undefined) return;
        const wScale = size.playerWarpWidth / size.playerWidth;
        const hScale = size.playerWarpHeight / size.playerHeight;
        player.wrapper.style.transform = `scale(${Math.min(wScale, hScale)})`;
      })
    );

    return () => {
      return (
        <div class={Style.playerWarp} ref={playerWarpElement}>
          <div class={Style.player} ref={playerElement}></div>
        </div>
      );
    };
  },
});
