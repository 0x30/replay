import { eventWithTime } from "rrweb/typings/types";
import { InjectionKey } from "vue";

export const eventInjectKey = Symbol() as InjectionKey<eventWithTime[]>;
