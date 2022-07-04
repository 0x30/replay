import { createApp, defineComponent, onMounted, ref } from "vue";
import { Replayer } from "./components/Replayer";
import "./main.css";

const App = defineComponent(() => {
  return () => (
    <Replayer
      events={JSON.parse(localStorage.getItem("events")!)}
      class="replay"
    />
  );
});

createApp(App).mount("#app");
