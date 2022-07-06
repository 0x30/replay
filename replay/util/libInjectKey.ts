import { eventWithTime } from "rrweb/typings/types";
import { InjectionKey, Ref } from "vue";
import { NetworkRequestRecord } from "../components/network/util";

export const eventInjectKey = Symbol() as InjectionKey<eventWithTime[]>;
export const networkDetailReqObj = Symbol() as InjectionKey<
  Ref<NetworkRequestRecord | undefined>
>;
