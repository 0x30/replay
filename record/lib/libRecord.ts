import { record, addCustomEvent } from "rrweb";
import type { eventWithTime, recordOptions } from "rrweb/typings/types";
import { useRequestRecord } from "./libRequestRecord";

export interface RecordOption
  extends Omit<recordOptions<eventWithTime>, "emit"> {
  snapShotSize?: number;
  onEmit?: (event: eventWithTime) => void;
  onSnapShot: (events: eventWithTime[]) => void;
}

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
      option.onEmit?.(e);
      if (events.length > (option.snapShotSize ?? 200)) {
        option.onSnapShot?.(snapshot());
      }
    },
  });

  // 监听请求
  const stopRequestRecord = useRequestRecord();

  const addMessage = (message: string) => {
    addCustomEvent("log", message);
  };

  // 停止所有的监听
  const stop = () => {
    stopRecord?.();
    stopRequestRecord();
  };

  return { stop, snapshot, addMessage };
};
