import { defineComponent } from "vue";
import Style from "./index.module.scss";

export const ConsoleComponent = defineComponent({
  name: "ConsoleComponent",
  setup: () => {
    return () => <div class={Style.body}></div>;
  },
});
