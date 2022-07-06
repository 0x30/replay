import { ElPopover, ElPopper, ElTooltip } from "element-plus";
import { EventType } from "rrweb";
import { computed, defineComponent, inject, PropType, ref } from "vue";
import { eventInjectKey } from "../../util/libInjectKey";
import { usePlayer } from "../../util/libPlayState";
import {
  currentNetwork,
  event2Data,
  NetworkRequestRecord,
} from "../network/util";

import Style from "./EventPlayerProgress.module.scss";

const EventBlock = defineComponent({
  name: "EventBlock",
  props: {
    data: {
      required: true,
      type: Object as PropType<NetworkRequestRecord>,
    },
    onProgress: Function as PropType<(progress: number) => void>,
  },
  setup: (props) => {
    const { getMeta } = usePlayer();

    return () => {
      const meta = getMeta();
      const leftProgress =
        (props.data.timestamp - meta.startTime) / meta.totalTime;
      return (
        <i
          title="请求事件，点击可查看详情"
          style={{ left: `${leftProgress * 100}%` }}
          onClick={() => {
            currentNetwork.value = props.data;
            props.onProgress?.(leftProgress);
          }}
        />
      );
    };
  },
});

export const EventPlayerProgress = defineComponent({
  name: "EventPlayerProgress",
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
    const events = inject(eventInjectKey, []);

    const networks = computed(
      () =>
        events.filter(
          (e) => e.type === EventType.Custom && e.data.tag === "network"
        ) as NetworkRequestRecord[]
    );

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
        <div class={Style.eventsBar}>
          {networks.value.map((data) => (
            <EventBlock data={data} onProgress={props.onProgress} />
          ))}
        </div>
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
