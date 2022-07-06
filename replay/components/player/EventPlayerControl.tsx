import { ElButton, ElLink, ElSpace } from "element-plus";
import { defineComponent } from "vue";
import { msToTime } from "../../util/libMisc";
import { usePlayer } from "../../util/libPlayState";
import Style from "./EventPlayerControl.module.scss";
import { EventPlayerProgress } from "./EventPlayerProgress";

export const EventPlayerControl = defineComponent({
  name: "EventPlayerControl",
  setup: () => {
    const {
      isReady,
      pause,
      isPlaying,
      toggle,
      getMeta,
      timeOffest,
      speed,
      setSpeed,
    } = usePlayer();

    const setProgress = (progress: number) => pause(progress);

    return () => {
      if (isReady.value === false) return null;

      return (
        <div class={Style.body}>
          <EventPlayerProgress onProgress={setProgress} />

          <div class={Style.control}>
            <ElSpace>
              <div class={Style.time}>
                {isReady.value
                  ? `${msToTime(timeOffest.value)}/${msToTime(
                      getMeta().totalTime
                    )}`
                  : "00:00:00/00:00:00"}
              </div>
              <ElLink underline={false} class={Style.button} onClick={toggle}>
                {isPlaying.value ? (
                  <i class="fa-solid fa-pause" />
                ) : (
                  <i class="fa-solid fa-play" />
                )}
              </ElLink>
              {[0.5, 1, 2, 4, 8].map((sp) => (
                <ElButton
                  key={sp}
                  circle
                  class={Style.speedButton}
                  type={speed.value === sp ? "primary" : ""}
                  onClick={() => setSpeed(sp)}
                >
                  {sp}
                </ElButton>
              ))}
            </ElSpace>
          </div>
        </div>
      );
    };
  },
});
