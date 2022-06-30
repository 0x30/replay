<template>
  <h1>record</h1>

  <div>
    <p>{{ count }}</p>
    <button @click="count++">add</button>
  </div>
  <div :class="$style.list">
    <p v-for="i in count">{{ i }}</p>
  </div>

  <div>
    <button @click="xhr('http://localhost:3000/record/index.html?a=1')">
      xhr 200
    </button>
    <button @click="xhr('http://localhost:3000')">xhr 404</button>
    <button @click="xhr('https://baidu.com')">xhr cros</button>
    <button @click="xhr('http://localhost:3000/favicon.ico')">xhr img</button>

    <button @click="fe('http://localhost:3000/record/index.html?a=1')">
      fetch 200
    </button>
    <button @click="fe('http://localhost:3000')">fetch 404</button>
    <button @click="fe('https://baidu.com')">fetch cros</button>
    <button @click="fe('http://localhost:3000/favicon.ico')">fetch img</button>

    <button @click="loadImg">加载图片</button>
    <button @click="loadCss">加载 css</button>
    <button @click="loadJs">加载 js</button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRecord } from "./lib/libRecord";

const count = ref(1);

const form = new FormData();
form.append("name", "1");

var enc = new TextEncoder();

form.append("pass", new Blob(enc.encode("13910133521")));
form.append("file", new Blob(["heello"]), "a.txt");

form.append(
  "file",
  new Blob(["heello"], { type: "application/json" }),
  "a.txt"
);

const xhr = (url: string) => {
  const xml = new XMLHttpRequest();
  xml.open("post", url);
  xml.responseType = "blob";
  xml.send(form);
};

const fe = (url: string) => {
  //  Blob | BufferSource | FormData | URLSearchParams
  fetch(url, { method: "post", body: form });
};

const loadImg = () => {
  const ele = document.createElement("img");
  ele.src =
    "https://www.google.com.hk/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png";
  document.body.append(ele);
};

const loadCss = () => {
  const ele = document.createElement("link");
  ele.rel = "stylesheet";
  ele.href = "https://cdn.jsdelivr.net/npm/rrweb@1.1.3/dist/rrweb.min.css";
  document.body.append(ele);
};

const loadJs = () => {
  const ele = document.createElement("script");
  ele.src = "https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js";
  document.body.append(ele);
};

onMounted(() => {
  useRecord({ onSnapShot: () => {} });
});
</script>

<style module lang="scss">
.list {
  height: 200px;
  width: 100px;
  border: 1px solid black;
  overflow: auto;

  p {
    text-align: center;
    font-size: 12px;
    font-family: "Courier New", Courier, monospace;
    background-color: azure;
  }
}
</style>
