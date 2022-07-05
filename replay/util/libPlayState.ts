import { Replayer } from "rrweb";
import { debounce } from "lodash-es";
import { computed, nextTick, reactive, readonly, ref, watch } from "vue";

const isPlaying = ref(false);
const isReady = ref(false);

const speedRef = ref(1);

const currentTimeoffest = ref(0);
const currentProgress = computed(() => {
  return currentTimeoffest.value / (globalPlayer?.getMetaData().totalTime ?? 1);
});

let globalPlayer: Replayer | undefined = undefined;

export const usePlayer = () => {
  const play = (timeoff?: number, isPercentage = true) => {
    const player = globalPlayer!;
    if (timeoff === undefined) player.play();
    else if (isPercentage === false) player.play(timeoff);
    else player.play(player.getMetaData().totalTime * timeoff);
  };

  const pause = (timeoff?: number, isPercentage = true) => {
    const player = globalPlayer!;
    if (timeoff === undefined) player.pause();
    else if (isPercentage === false) player.pause(timeoff);
    else player.pause(player.getMetaData().totalTime * timeoff);
  };

  return {
    timeOffest: readonly(currentTimeoffest),
    progress: readonly(currentProgress),
    isReady: readonly(isReady),
    isPlaying: readonly(isPlaying),
    isPause: readonly(computed(() => !isPlaying.value)),
    toggle: () => {
      if (isPlaying.value === true) pause();
      else play(currentTimeoffest.value, false);
    },
    play,
    pause,
    speed: readonly(speedRef),
    setSpeed: (speed: number) => {
      const player = globalPlayer!;
      player.setConfig({ speed });
      speedRef.value = speed;
    },
    getMeta: () => {
      const player = globalPlayer!;
      return player.getMetaData();
    },
  };
};

export const useInitPlayer = async (player: Replayer) => {
  if (globalPlayer) return;

  let timer: number | null = null;

  const startLoopTime = async () => {
    if (isPlaying.value === false) return;
    currentTimeoffest.value = player.getCurrentTime();
    if (currentTimeoffest.value < player.getMetaData().totalTime) {
      timer = requestAnimationFrame(startLoopTime);
    }
  };

  const stopLoopTime = () => {
    if (timer) cancelAnimationFrame(timer);
  };

  // 主播放功能
  globalPlayer = player;

  player.on("start", () => {
    isPlaying.value = true;
    startLoopTime();
  });
  player.on("pause", () => {
    isPlaying.value = false;
    stopLoopTime();
  });
  player.on("finish", () => {
    currentTimeoffest.value = 0;
    isPlaying.value = false;
    stopLoopTime();
    player.pause(0);
  });

  // 播放器比例是配
  const size = reactive({
    playerWidth: 0,
    playerHeight: 0,
    playerWarpWidth: 0,
    playerWarpHeight: 0,
  });

  player.on("resize", ({ width, height }: any) => {
    size.playerWidth = width;
    size.playerHeight = height;
  });

  const resizeObserver = new ResizeObserver((entries) => {
    size.playerWarpWidth = entries[0].contentRect.width;
    size.playerWarpHeight = entries[0].contentRect.height;
  });
  resizeObserver.observe(player.config.root);

  watch(
    size,
    debounce(() => {
      const wScale = size.playerWarpWidth / size.playerWidth;
      const hScale = size.playerWarpHeight / size.playerHeight;
      player.wrapper.style.transform = `scale(${Math.min(wScale, hScale)})`;
    })
  );

  await nextTick();
  isReady.value = true;
};
