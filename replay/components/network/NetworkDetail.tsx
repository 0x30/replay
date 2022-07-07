import {
  ElDescriptions,
  ElDescriptionsItem,
  ElLink,
  ElTable,
  ElTableColumn,
  ElTabPane,
  ElTabs,
} from "element-plus";
import { isEmpty } from "lodash-es";
import { defineComponent, inject, PropType, provide, toRef, toRefs } from "vue";
import { networkDetailReqObj } from "../../util/libInjectKey";
import Style from "./NetworkDetail.module.scss";
import { DataType, NetworkRequestRecord } from "./util";

import "highlight.js/styles/stackoverflow-light.css";
import "highlight.js/lib/common";
import hljs from "@highlightjs/vue-plugin";

const HeaderView = defineComponent({
  name: "NetworkHeaderView",
  props: {
    title: String,
    header: Object,
  },
  setup: (props) => {
    return () => {
      if (isEmpty(props.header)) return null;
      return (
        <details open>
          <summary>{props.title}</summary>
          <table>
            {Object.entries(props.header!).map(([key, value]) => (
              <tr>
                <th>{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </table>
        </details>
      );
    };
  },
});

const NetworkDetailHeaderPane = defineComponent({
  name: "NetworkDetailHeaderPane",
  setup: () => {
    const requestObject = inject(networkDetailReqObj);

    return () => {
      const request = requestObject?.value;
      const payload = request?.data.payload;
      if (request === undefined || payload === undefined) return null;

      return (
        <div class={Style.networkDetailHeaderPane}>
          <details open>
            <summary>Details</summary>
            <table>
              <tr>
                <th>Request URL</th>
                <td>{payload.url}</td>
              </tr>
              <tr>
                <th>Request Method</th>
                <td>{payload.method}</td>
              </tr>
              <tr>
                <th>Request Time</th>
                <td>{new Date(request.timestamp).toLocaleString()}</td>
              </tr>
            </table>
          </details>
          <HeaderView title="Request Header" header={payload.requestHeader} />
          <HeaderView title="Response Header" header={payload.responseHeader} />
        </div>
      );
    };
  },
});

const NetworkDetailResponsePane = defineComponent({
  name: "NetworkDetailResponsePane",
  setup: () => {
    const requestObject = inject(networkDetailReqObj);
    return () => {
      const resp = requestObject?.value?.data.payload;
      if (resp === undefined || resp.responseHeader === undefined)
        return <pre>null</pre>;

      const contentType = resp.responseHeader["content-type"];
      if (contentType === undefined) {
        return <pre>null</pre>;
      }

      if (contentType.includes("application/json")) {
        return <hljs.component code={JSON.stringify(resp.response, null, 2)} />;
      }

      if (typeof resp.response === "string") {
        return <hljs.component code={resp.response} />;
      }
      return <div>{JSON.stringify(resp.response)}</div>;
    };
  },
});

export const NetworkDetail = defineComponent({
  name: "NetworkDetail",
  props: {
    modelValue: Object as PropType<NetworkRequestRecord>,
  },
  emits: ["update:modelValue"],
  setup: (props, { emit }) => {
    provide(networkDetailReqObj, toRef(props, "modelValue"));

    return () => {
      if (props.modelValue === undefined) return null;

      const request = props.modelValue.data.payload;

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
              <NetworkDetailHeaderPane />
            </ElTabPane>
            <ElTabPane label="payload">payload</ElTabPane>
            <ElTabPane label="response">
              <NetworkDetailResponsePane />
            </ElTabPane>
            <ElTabPane label="time">timing</ElTabPane>
          </ElTabs>
        </div>
      );
    };
  },
});
