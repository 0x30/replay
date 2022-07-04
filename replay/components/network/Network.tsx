import { EventType } from "rrweb";
import { customEvent, eventWithTime } from "rrweb/typings/types";
import { computed, defineComponent, inject, onMounted, PropType } from "vue";
import { RequestRecord } from "../../../record/lib/libRequestRecord";
import { eventInjectKey } from "../../util.ts/libInjectKey";
import Style from "./Network.module.scss";

type NetworkRequestRecord = customEvent<RequestRecord> & {
  timestamp: number;
  delay?: number | undefined;
};

const PerformanceTimingComponent = defineComponent({
  props: {
    source: Object as PropType<PerformanceResourceTiming>,
  },
  setup: () => {
    return () => {
      return <div></div>;
    };
  },
});

// https://gist.github.com/colemanw/9c9a12aae16a4bfe2678de86b661d922
export const NetworkTable = defineComponent({
  name: "NetworkTable",
  setup: () => {
    const events = inject(eventInjectKey, []);

    const networks = computed(
      () =>
        events.filter(
          (e) => e.type === EventType.Custom && e.data.tag === "network"
        ) as NetworkRequestRecord[]
    );

    return () => {
      return (
        <div class={Style.table}>
          <table>
            <thead>
              <tr>
                <th>url</th>
                <th>status</th>
                <th>type</th>
                <th>method</th>
                <th>time</th>
                <th>size</th>
              </tr>
            </thead>
            <tbody>
              {networks.value.map((network) => {
                return (
                  <tr>
                    <td>{network.data.payload.entry.name}</td>
                    <td>{network.data.payload.status}</td>
                    <td>{network.data.payload.entry.initiatorType}</td>
                    <td>{network.data.payload.method}</td>
                    <td>{network.data.payload.entry.duration}</td>
                    <td>{network.data.payload.entry.transferSize}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    };
  },
});
