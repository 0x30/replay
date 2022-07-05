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
import { DataType, event2Data, NetworkRequestRecord } from "./util";
import { NetworkDetail } from "./NetworkDetail";
import { PerformanceTimingComponent as PerformanceTiming } from "./PerformanceTimingComponent";

// https://gist.github.com/colemanw/9c9a12aae16a4bfe2678de86b661d922
export const NetworkTable = defineComponent({
  name: "NetworkTable",
  setup: () => {
    const currentNetwork = ref<NetworkRequestRecord>();

    const { currentEvent } = usePlayer();
    const events = inject(eventInjectKey, []);

    const networks = computed(() =>
      (
        events.filter(
          (e) => e.type === EventType.Custom && e.data.tag === "network"
        ) as NetworkRequestRecord[]
      ).map(event2Data)
    );

    const rowClassName = (event: any) => {
      if (currentEvent.value) {
        if (currentEvent.value.timestamp > event.row.real.timestamp) {
          return Style.olded;
        }
      }
      return Style.unReq;
    };

    return () => {
      return (
        <div class={Style.body}>
          <ElTable
            class={Style.table}
            data={networks.value}
            border
            stripe
            fit={true}
            style={currentNetwork.value ? { width: "unset" } : {}}
            headerCellStyle={{ color: "black" }}
            cellStyle={{ padding: 0 }}
            size="small"
            tableLayout="fixed"
            height="100%"
            rowClassName={rowClassName}
            onCell-click={(row) => (currentNetwork.value = row.real)}
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
                  minWidth={800}
                  showOverflowTooltip
                >
                  {(event: any) => (
                    <PerformanceTiming source={event.row.real} />
                  )}
                </ElTableColumn>
              </>
            )}
          </ElTable>
          <NetworkDetail v-model={currentNetwork.value} />
        </div>
      );
    };
  },
});
