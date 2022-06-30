import { record, addCustomEvent } from "rrweb";
import fetchIntercept from "fetch-intercept";
import { proxy, unProxy } from "ajax-hook";
import type { eventWithTime, recordOptions } from "rrweb/typings/types";

export interface RecordOption
  extends Omit<recordOptions<eventWithTime>, "emit"> {
  snapShotSize?: number;
  onSnapShot: (events: eventWithTime[]) => void;
}

interface RequestRecord {
  // request url
  url: string;
  // 请求参数
  payload: FormData | string;
  // request method
  method: string;
  // response code
  status: number;
  // 资源类型
  // 取自  PerformanceResourceTiming - initiatorType
  type: string;
  // response header
  requestHeader: Record<string, any>;
  // response header
  responseHeader: Record<string, any>;
  // response 返回
  response: any;
  // 获取资源的网络协议，由 ALPN协议ID (RFC7301) https://datatracker.ietf.org/doc/html/rfc7301 标识
  // 取自 PerformanceResourceTiming - duration
  nextHopProtocol: string;
  // 耗时
  // 取自 PerformanceResourceTiming - duration
  duration: number;
}

const useRequestRecord = () => {
  const performance = new PerformanceObserver((entryList) => {
    // 任意资源加载完成基本都会回调（极少数情况不会，可忽略）
    entryList.getEntries().forEach((entry) => {
      // 我们可以通过 entry.name 后缀或 entry.initiatorType 来判断资源类型。代码略
      console.log(
        "performance:",
        entry.name,
        entry.entryType,
        entry.initiatorType,
        entry
      );
    });
  });

  performance.observe({
    entryTypes: ["resource"],
  });

  proxy({
    onRequest(config, handler) {
      handler.next(config);
    },
    onResponse(response, handler) {
      const headers = response.config.headers;

      console.log("axjs-hook resp:", response);
      handler.next(response);
    },
  });

  const stopFetchIntercept = fetchIntercept.register({
    request(url, config) {
      console.log("fetch resp:", url, config);

      return [url, config];
    },
    response(resp) {
      console.log("fetch resp:", resp);
      return resp;
    },
  });

  const stop = () => {
    // stop XMLHttpRequest record
    unProxy();
    // stop Fetch record
    stopFetchIntercept();
    // stop PerformanceObserver record
    performance.disconnect();
  };

  return stop;
};

export const useRecord = (option: RecordOption) => {
  let events: eventWithTime[] = [];

  // 快照，将此刻的时间，进行 clone，并将 event 存储重置
  const snapshot = () => {
    const _es = [...events];
    events = [];
    return _es;
  };

  // 开始录像
  const stopRecord = record({
    ...option,
    emit(e) {
      events.push(e);
      if (events.length > (option.snapShotSize ?? 200)) {
        option.onSnapShot?.(snapshot());
      }
    },
  });

  // 监听请求
  const stopRequestRecord = useRequestRecord();

  const addMessage = () => {};

  // 停止所有的监听
  const stop = () => {
    stopRecord?.();
    stopRequestRecord();
  };

  return { stop, snapshot };
};
