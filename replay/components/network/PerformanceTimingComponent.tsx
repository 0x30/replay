import { defineComponent, PropType } from "vue";
import { usePlayer } from "../../util/libPlayState";
import { NetworkRequestRecord } from "./util";
import Style from "./PerformanceTimingComponent.module.scss";

export const PerformanceTimingComponent = defineComponent({
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
