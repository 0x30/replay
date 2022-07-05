import { EventType } from "rrweb";
import { customEvent, eventWithTime } from "rrweb/typings/types";
import { computed, defineComponent, inject, PropType, ref } from "vue";
import { RequestRecord } from "../../../record/lib/libRequestRecord";
import { eventInjectKey } from "../../util/libInjectKey";
import Style from "./Network.module.scss";
import { bytesToSize } from "../../util/libMisc";

import {
  ElTable,
  ElTableColumn,
  ElSpace,
  ElTabs,
  ElTabPane,
  ElLink,
} from "element-plus";
import { getFontAwesomeIconFromMIME, msToFormatTime } from "../../util/libMisc";
import { getUrlName } from "../../util/libUrlName";
import { usePlayer } from "../../util/libPlayState";

type NetworkRequestRecord = customEvent<RequestRecord> & {
  timestamp: number;
  delay?: number | undefined;
};

const PerformanceTimingComponent = defineComponent({
  props: {
    source: Object as PropType<NetworkRequestRecord>,
  },
  setup: (props) => {
    const { getMeta, isReady } = usePlayer();

    return () => {
      if (isReady.value === false) return null;

      const meta = getMeta();

      const time = props.source?.data.payload.entry!;

      const redirect = time.redirectEnd - time.startTime;
      const appCache = time.domainLookupStart - time.fetchStart;
      const dns = time.domainLookupEnd - time.domainLookupStart;
      const tcp = time.connectEnd - time.connectStart;
      const tcpSSL = time.secureConnectionStart - time.connectStart;
      const request = time.responseStart - time.requestStart;
      const response = time.responseEnd - time.responseStart;

      console.log(time);
      

      const left = (props.source!.timestamp - meta.startTime) / meta.totalTime;
      const width = time.duration / meta.totalTime;

      const redirectWidth = (redirect / time.duration) * 100;
      const appCacheWidth = (appCache / time.duration) * 100;
      const dnsWidth = (dns / time.duration) * 100;
      const tcpWidth = (tcp / time.duration) * 100;
      const tcpSSLWidth = (tcpSSL / time.duration) * 100;
      const requestWidth = (request / time.duration) * 100;
      const responseWidth = (response / time.duration) * 100;

      return (
        <div class={Style.timeRowItem}>
          <div
            class={Style.item}
            style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
          >
            {/* <div
              style={{ width: `${redirectWidth}%` }}
              class={Style.redirect}
            ></div>
            <div
              style={{ width: `${appCacheWidth}%` }}
              class={Style.appCache}
            ></div>
            <div style={{ width: `${dnsWidth}%` }} class={Style.dns}></div>
            <div style={{ width: `${tcpWidth}%` }} class={Style.tcp}></div>
            <div
              style={{ width: `${tcpSSLWidth}%` }}
              class={Style.tcpSSL}
            ></div>
            <div
              style={{ width: `${requestWidth}%` }}
              class={Style.request}
            ></div>
            <div
              style={{ width: `${responseWidth}%` }}
              class={Style.response}
            ></div> */}
          </div>
        </div>
      );
    };
  },
});

type DataType = ReturnType<typeof event2Data>;

const event2Data = (event: NetworkRequestRecord) => {
  const respContentType = event.data.payload.responseHeader?.["content-type"];

  return {
    real: event,
    icon: getFontAwesomeIconFromMIME(respContentType),
    url: event.data.payload.entry.name,
    name: getUrlName(event.data.payload.entry.name),
    status: event.data.payload.status,
    initiator: event.data.payload.entry.initiatorType,
    type: respContentType,
    method: event.data.payload.method,
    duration: event.data.payload.entry.duration,
    transferSize: event.data.payload.entry.transferSize,
  };
};

const NetworkDetail = defineComponent({
  name: "NetworkDetail",
  props: {
    modelValue: Object as PropType<DataType>,
  },
  emits: ["update:modelValue"],
  setup: (props, { emit }) => {
    return () => (
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
  },
});

// https://gist.github.com/colemanw/9c9a12aae16a4bfe2678de86b661d922
export const NetworkTable = defineComponent({
  name: "NetworkTable",
  setup: () => {
    const currentNetwork = ref<ReturnType<typeof event2Data>>();

    const events = inject(eventInjectKey, []);

    const networks = computed(() =>
      (
        events.filter(
          (e) => e.type === EventType.Custom && e.data.tag === "network"
        ) as NetworkRequestRecord[]
      ).map(event2Data)
    );

    return () => {
      return (
        <div class={Style.body}>
          <ElTable
            class={Style.table}
            data={networks.value}
            border
            stripe
            fit={true}
            style={{ width: "unset" }}
            headerCellStyle={{ color: "black" }}
            cellStyle={{ padding: 0 }}
            size="small"
            tableLayout="fixed"
            height="100%"
            width="unset"
            onCell-click={(row) => (currentNetwork.value = row)}
          >
            <ElTableColumn
              label="name"
              prop="name"
              showOverflowTooltip
              width={230}
            >
              {({ row }: { row: any }) => {
                return (
                  <ElSpace>
                    <i class={`fa-solid ${row.icon}`}></i>
                    {row.name}
                  </ElSpace>
                );
              }}
            </ElTableColumn>
            {currentNetwork.value ? null : (
              <>
                <ElTableColumn
                  label="status"
                  width={70}
                  align="center"
                  formatter={(row) => row.status ?? "200"}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="initiator"
                  prop="initiator"
                  width={120}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="type"
                  prop="type"
                  width={120}
                  formatter={(row) => row.type ?? "-"}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="method"
                  prop="method"
                  width={70}
                  formatter={(row) => (row.method ?? "get").toLowerCase()}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="duration"
                  prop="duration"
                  width={80}
                  formatter={(row) => msToFormatTime(row.duration)}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="size"
                  prop="transferSize"
                  width={70}
                  formatter={(row) => bytesToSize(row.transferSize)}
                  showOverflowTooltip
                />
                <ElTableColumn
                  label="waterfall"
                  minWidth={1000}
                  renderHeader={() => {
                    return <div>waterfall</div>;
                  }}
                >
                  {(event: any) => {
                    return (
                      <PerformanceTimingComponent source={event.row.real} />
                    );
                  }}
                </ElTableColumn>
              </>
            )}
          </ElTable>
          {currentNetwork.value ? (
            <NetworkDetail v-model={currentNetwork.value} />
          ) : null}
        </div>
      );
    };
  },
});
