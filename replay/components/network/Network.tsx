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
  ElCheckboxGroup,
  ElCheckboxButton,
  ElInput,
  ElCheckbox,
  ElTooltip,
} from "element-plus";
import { getFontAwesomeIconFromMIME, msToFormatTime } from "../../util/libMisc";
import { getUrlName } from "../../util/libUrlName";
import { usePlayer } from "../../util/libPlayState";
import {
  currentNetwork,
  DataType,
  event2Data,
  NetworkRequestRecord,
} from "./util";
import { NetworkDetail } from "./NetworkDetail";
import { PerformanceTimingComponent as PerformanceTiming } from "./PerformanceTimingComponent";
import { isEmpty, isEqual } from "lodash-es";

const CheckTypePool: Record<string, string[]> = {
  "fetch/xhr": ["xmlhttprequest", "fetch"],
  css: ["css"],
  script: ["script"],
  img: ["img", "image"],
  other: [
    "navigation",
    "beacon",
    "video",
    "audio",
    "track",
    "input",
    "a",
    "iframe",
    "frame",
    "other",
  ],
};

// https://gist.github.com/colemanw/9c9a12aae16a4bfe2678de86b661d922
export const NetworkTable = defineComponent({
  name: "NetworkTable",
  setup: () => {
    const { currentEvent } = usePlayer();
    const events = inject(eventInjectKey, []);

    const searchText = ref<string>("");

    const initiatorTypes = ["fetch/xhr", "css", "script", "img", "other"];
    const checkTypes = ref(initiatorTypes);

    const isAll = computed(() => isEqual(initiatorTypes, checkTypes.value));
    const isIndeterminate = computed(() => {
      return checkTypes.value.length > 0 && isAll.value === false;
    });

    // 参与筛选的 types
    const types = computed(() =>
      checkTypes.value.map((v) => CheckTypePool[v]).flat()
    );

    const networks = computed(() =>
      (
        events.filter(
          (e) => e.type === EventType.Custom && e.data.tag === "network"
        ) as NetworkRequestRecord[]
      )
        .filter(
          (e) =>
            (isEmpty(searchText.value) ||
              e.data.payload.entry.name.includes(searchText.value)) &&
            types.value.includes(e.data.payload.entry.initiatorType)
        )
        .map(event2Data)
    );

    const rowClassName = (event: any) => {
      if (currentNetwork.value) {
        if (
          currentNetwork.value.timestamp === event.row.real.timestamp &&
          currentNetwork.value.data.payload.url ===
            event.row.real.data.payload.url
        ) {
          return Style.selected;
        }
      }
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
          <ElSpace class={Style.searchBar}>
            <ElInput
              v-model={searchText.value}
              size="small"
              placeholder="search"
            />
            <ElCheckbox
              label="all"
              v-model={isAll.value}
              indeterminate={isIndeterminate.value}
              onChange={(val) => {
                checkTypes.value = val === true ? initiatorTypes : [];
              }}
            />
            <ElCheckboxGroup size="small" v-model={checkTypes.value}>
              {initiatorTypes.map((c) => (
                <ElCheckbox key={c} label={c} />
              ))}
            </ElCheckboxGroup>
          </ElSpace>
          <div class={Style.networkBody}>
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
              <ElTableColumn label="name" prop="name" width={230}>
                {({ row }: { row: any }) => {
                  return (
                    <ElTooltip content={row.url} placement="top">
                      <ElSpace>
                        <i class={`fa-solid ${row.icon}`}></i>
                        {row.name}
                      </ElSpace>
                    </ElTooltip>
                  );
                }}
              </ElTableColumn>
              {currentNetwork.value ? null : (
                <>
                  <ElTableColumn
                    label="status"
                    width={70}
                    align="center"
                    formatter={(row) => row.status ?? "-"}
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
        </div>
      );
    };
  },
});
