import { defineComponent, PropType, ref, StyleValue, VNode } from "vue";
import Style from "./DragResize.module.scss";

export const DragResize = defineComponent({
  name: "DragResizeComponent",
  props: {
    id: String,
    direction: {
      type: String as PropType<"horizontal" | "vertical">,
      default: "horizontal",
    },
    initScale: { type: Number, default: 0.5 },
    maxScale: {
      type: Number,
      default: 0.8,
      validator: (val: number) => val >= 0 && val <= 1,
    },
    minScale: {
      type: Number,
      default: 0.2,
      validator: (val: number) => val >= 0 && val <= 1,
    },
  },
  setup: (props, { slots }) => {
    const isH = props.direction === "horizontal";

    const id = props.id ? `_|_drag_resize_${props.id}` : props.id;

    const flexBasis = ref(
      id
        ? Number.parseFloat(
            window.localStorage.getItem(id) ?? `${props.initScale}`
          )
        : props.initScale
    );

    const scribeMouseDown = (event: MouseEvent) => {
      const realTarget = (event.target as HTMLDivElement).parentElement;
      if (realTarget === null) return;

      const parentTotal = isH
        ? realTarget.clientWidth
        : realTarget.clientHeight;
      const parentCurrent = isH ? realTarget.offsetLeft : realTarget.offsetTop;

      const mouseMoveHandler = (e: MouseEvent) => {
        e.preventDefault();

        const currentMoveValue = isH ? e.clientX : e.clientY;

        const progress =
          1 -
          Math.min(
            props.maxScale,
            Math.max(
              props.minScale,
              (currentMoveValue - parentCurrent) / parentTotal
            )
          );

        flexBasis.value = progress;
        if (id) window.localStorage.setItem(id, `${progress}`);
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

    return () => {
      const childrens = slots.default?.() as [VNode, VNode];

      if (childrens.length !== 2) {
        return <span>just support two childrenx</span>;
      }

      const [FristChildren, SecondChildren] = childrens as any[];

      const scribeStyle: StyleValue =
        props.direction === "horizontal"
          ? { width: "3px", cursor: "ew-resize" }
          : { height: "3px", cursor: "ns-resize" };

      return (
        <div
          class={Style.body}
          style={{
            flexDirection: props.direction === "horizontal" ? "row" : "column",
          }}
        >
          <FristChildren class={Style.item1}></FristChildren>
          <div
            class={Style.scribe}
            style={scribeStyle}
            onMousedown={scribeMouseDown}
          />
          <SecondChildren
            class={Style.item2}
            style={{
              flexBasis: `${flexBasis.value * 100}%`,
            }}
          ></SecondChildren>
        </div>
      );
    };
  },
});
