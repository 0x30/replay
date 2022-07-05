import { ElLink, ElTabPane, ElTabs } from "element-plus";
import { defineComponent, PropType } from "vue";
import Style from "./NetworkDetail.module.scss";
import { DataType, NetworkRequestRecord } from "./util";

export const NetworkDetail = defineComponent({
  name: "NetworkDetail",
  props: {
    modelValue: Object as PropType<NetworkRequestRecord>,
  },
  emits: ["update:modelValue"],
  setup: (props, { emit }) => {
    return () => {
      if (props.modelValue === undefined) return null;
      return (
        <div class={Style.networkDetail}>
          <ElLink
            underline={false}
            class={Style.closeBtn}
            onClick={() => emit("update:modelValue", undefined)}
          >
            <i class="fa-solid fa-xmark"></i>
          </ElLink>
          <ElTabs>
            <ElTabPane class={Style.item} label="header">
              <details>
                <summary>Details</summary>
              </details>
              <details>
                <summary>Request Header</summary>
              </details>
              <details>
                <summary>Response Header</summary>
              </details>
            </ElTabPane>
            <ElTabPane label="Config">payload</ElTabPane>
            <ElTabPane label="Role">response</ElTabPane>
            <ElTabPane label="Task">timing</ElTabPane>
          </ElTabs>
        </div>
      );
    };
  },
});
