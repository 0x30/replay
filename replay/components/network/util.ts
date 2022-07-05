import { customEvent } from "rrweb/typings/types";
import { RequestRecord } from "../../../record/lib/libRequestRecord";
import { getFontAwesomeIconFromMIME } from "../../util/libMisc";
import { getUrlName } from "../../util/libUrlName";

export type NetworkRequestRecord = customEvent<RequestRecord> & {
  timestamp: number;
  delay?: number | undefined;
};

export type DataType = ReturnType<typeof event2Data>;

export const event2Data = (event: NetworkRequestRecord) => {
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
