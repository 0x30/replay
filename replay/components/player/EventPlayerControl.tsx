import { ElButton, ElLink, ElSpace } from "element-plus";
import { defineComponent, PropType } from "vue";
import { msToTime } from "../../util/libMisc";
import { usePlayer } from "../../util/libPlayState";
import Style from "./EventPlayerControl.module.scss";

const ProgressComponent = defineComponent({
  props: {
    /**
     * 进度改变
     * progress: 进度
     * isMove: 是否采用 滑动的方式 进行切换进度
     */
    onProgress: Function as PropType<
      (progress: number, isMove: boolean) => void
    >,
  },
  setup: (props) => {
    const { progress } = usePlayer();

    // 点击进度条事件处理
    const clickProgressBar = (event: MouseEvent) => {
      event.stopPropagation();
      const target = event.target as HTMLDivElement;
      const clickProgress = event.offsetX / target.clientWidth;
      props.onProgress?.(clickProgress, false);
    };

    // 进度条块 滑动事件处理
    const progressBockMouseDown = (event: MouseEvent) => {
      const realTarget = (event.target as HTMLDivElement).parentElement;
      if (realTarget === null) return;

      const parentWitdh = realTarget.clientWidth,
        parentLeft = realTarget.offsetLeft;

      const mouseMoveHandler = (e: MouseEvent) => {
        e.preventDefault();
        const progress = Math.min(
          1,
          Math.max(0, (e.clientX - parentLeft) / parentWitdh)
        );
        (event.target as HTMLDivElement).style.left = `${progress * 100}%`;
        props.onProgress?.(progress, true);
      };

      /// 鼠标移动
      document.addEventListener("mousemove", mouseMoveHandler, false);
      ///  鼠标抬起 去除 鼠标移动 以及 鼠标抬起 处理方法
      const mouseUpHandle = () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandle);
      };
      document.addEventListener("mouseup", mouseUpHandle);
    };

    return () => (
      <div class={Style.progress}>
        <div class={Style.bar} onClick={clickProgressBar}>
          <div
            style={{ left: `${progress.value * 100}%` }}
            onClick={(e) => e.stopPropagation()}
            onMousedown={progressBockMouseDown}
          ></div>
        </div>
      </div>
    );
  },
});

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
      return (
        <div class={Style.body}>
          <ProgressComponent onProgress={setProgress} />

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
