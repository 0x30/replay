import { EventType, Replayer } from "rrweb";
import {
  defineComponent,
  FunctionalComponent,
  inject,
  nextTick,
  onMounted,
  ref,
} from "vue";
import "rrweb/dist/rrweb.min.css";
import Style from "./EventPlayer.module.scss";
import { eventInjectKey } from "../../util/libInjectKey";
import { useInitPlayer } from "../../util/libPlayState";
import { ElLink, ElSpace, ElTooltip } from "element-plus";

import { UAParser } from "ua-parser-js";

const Item: FunctionalComponent<{
  name: string;
  value: string | undefined;
}> = ({ name, value }) => {
  
  const result = typeof value === "string" ? `"${value}"` : "null";
  return (
    <div data-empty={value === undefined}>
      {name}:<span>{result}</span>
    </div>
  );
};

export const EventDeviceInfo = defineComponent({
  name: "EventDeviceInfo",
  setup: () => {
    const isShowDeviceInfoDrawer = ref(false);
    const events = inject(eventInjectKey, []);

    return () => {
      const userAgent = events.find(
        (e) => e.type === EventType.Custom && e.data.tag === "ua"
      );

      if (userAgent === undefined) return null;
      const result = UAParser((userAgent.data as any).payload);

      return (
        <>
          <ElTooltip content="设备信息">
            <ElLink
              underline={false}
              class={Style.deviceInfo}
              onClick={() => (isShowDeviceInfoDrawer.value = true)}
            >
              <i class="fa-solid fa-circle-info"></i>
            </ElLink>
          </ElTooltip>
          {isShowDeviceInfoDrawer.value ? (
            <div class={Style.deviceInfoDrawer}>
              <header>
                <ElLink
                  underline={false}
                  onClick={() => (isShowDeviceInfoDrawer.value = false)}
                >
                  <i class="fa-solid fa-xmark"></i>
                </ElLink>
              </header>
              <main>
                <Item name="ua" value={result.ua} />
                <details open>
                  <summary>browser: Object{"{}"}</summary>
                  <Item name="name" value={result.browser.name} />
                  <Item name="version" value={result.browser.version} />
                </details>
                <details open>
                  <summary>os: Object{"{}"}</summary>
                  <Item name="name" value={result.os.name} />
                  <Item name="version" value={result.os.version} />
                </details>
                <details open>
                  <summary>engine: Object{"{}"}</summary>
                  <Item name="name" value={result.engine.name} />
                  <Item name="version" value={result.engine.version} />
                </details>
                <details open>
                  <summary>device: Object{"{}"}</summary>
                  <Item name="model" value={result.device.model} />
                  <Item name="type" value={result.device.type} />
                  <Item name="vendor" value={result.device.vendor} />
                </details>

                <details open>
                  <summary>cpu: Object{"{}"}</summary>
                  <Item name="architecture" value={result.cpu.architecture} />
                </details>
              </main>
            </div>
          ) : null}
        </>
      );
    };
  },
});

export const EventPlayer = defineComponent({
  name: "EventPlayer",
  setup: () => {
    const events = inject(eventInjectKey, []);
    const playerElement = ref<HTMLDivElement>();
    const playerWarpElement = ref<HTMLDivElement>();

    onMounted(async () => {
      await nextTick();
      useInitPlayer(new Replayer(events, { root: playerElement.value }));
    });

    return () => {
      return (
        <div class={Style.playerWarp} ref={playerWarpElement}>
          <EventDeviceInfo />
          <div class={Style.player} ref={playerElement}></div>
        </div>
      );
    };
  },
});
