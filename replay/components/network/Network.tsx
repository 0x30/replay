import { EventType } from "rrweb";
import { computed, defineComponent, inject, onMounted, ref, watch } from "vue";
import { eventInjectKey } from "../../util/libInjectKey";
import Style from "./Network.module.scss";
import { bytesToSize } from "../../util/libMisc";

import {
  ElTable,
  ElTableColumn,
  ElSpace,
  ElCheckboxGroup,
  ElInput,
  ElCheckbox,
  ElTooltip,
  ElLink,
} from "element-plus";
import { msToFormatTime } from "../../util/libMisc";
import { usePlayer } from "../../util/libPlayState";
import { currentNetwork, event2Data, NetworkRequestRecord } from "./util";
import { NetworkDetail } from "./NetworkDetail";
import { PerformanceTimingComponent as PerformanceTiming } from "./PerformanceTimingComponent";
import { debounce, isEmpty, isEqual, throttle } from "lodash-es";

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

const useMutationScroll = (className: string) => {
  // 防止频繁调用
  const scoll = throttle((item: any) => {
    item.scrollIntoView({
      block: "center",
      inline: "start",
    });
  }, 100);

  // 监听器
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      // 获取老的样式表
      const oldClasses = mutation.oldValue?.split(" ") ?? [];
      const oldClassesSet = new Set(oldClasses);

      // 获取差值
      const res = [
        ...Array.from((mutation.target as HTMLDivElement).classList),
      ].filter((c) => !oldClassesSet.has(c));

      if (new Set(res).has(className)) {
        scoll(mutation.target);
      }
    }
  });

  let isStart = false;

  const start = (element: Element) => {
    if (isStart === true) return;

    isStart = true;
    observer.observe(element, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["class"],
    });
  };

  return {
    start,
    stop: () => {
      if (isStart === true) observer.disconnect();
    },
  };
};

// https://gist.github.com/colemanw/9c9a12aae16a4bfe2678de86b661d922
export const NetworkTable = defineComponent({
  name: "NetworkTable",
  setup: () => {
    const { currentEvent } = usePlayer();
    const tableRef = ref<typeof ElTable>();
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

    const isPin = ref(true);
    const { start, stop } = useMutationScroll(Style.olded);

    onMounted(() => {
      if (isPin.value === true) start((tableRef.value as any).$el);
    });

    const rowClassName = (event: any) => {
      // 当前 event 是否正常
      const isSelected =
        currentNetwork.value &&
        currentNetwork.value.timestamp === event.row.real.timestamp &&
        currentNetwork.value.data.payload.url ===
          event.row.real.data.payload.url;

      const selectClass = isSelected ? Style.selected : "";

      // 如果当前的时间 大于 时间对象
      if (currentEvent.value) {
        if (currentEvent.value.timestamp > event.row.real.timestamp) {
          return [Style.olded, selectClass].join(" ");
        }
      }
      return [Style.unReq, selectClass].join(" ");
    };

    return () => {
      return (
        <div class={Style.body}>
          <ElSpace class={Style.searchBar}>
            <ElLink
              type={isPin.value ? "primary" : "default"}
              onClick={() => {
                if (isPin.value === true) {
                  stop();
                } else {
                  start((tableRef.value as any).$el);
                }
              }}
            >
              <i class="fa-solid fa-bullseye"></i>
            </ElLink>
            <ElInput
              v-model={searchText.value}
              size="small"
              placeholder="search"
            />
            <ElCheckbox
              label="all"
              modelValue={isAll.value}
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
              ref={tableRef}
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
                    <ElTooltip
                      content={row.url}
                      placement="top"
                      showAfter={150}
                    >
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
