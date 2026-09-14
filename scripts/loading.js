// Loading Screen
"use strict";

const soundBytes = {};
let loadingFailed = false;

function loadTrackedSound(path) {
  soundBytes[path] = { loaded: 0, total: 0 };
  return loadSound(
    path,
    () => {
      const bytes = soundBytes[path];
      bytes.total = bytes.total || 1;
      bytes.loaded = bytes.total;
    },
    () => {
      loadingFailed = true;
      document.getElementById("loading-text").textContent =
        `Failed to load ${path}`;
    },
    (_, evt) => {
      if (evt) soundBytes[path] = { loaded: evt.loaded, total: evt.total };
    },
  );
}

function loadingProgress(totalFiles) {
  const files = 1 - window._preloadCount / totalFiles;
  const sounds = Object.values(soundBytes).filter((s) => s.total > 0);
  if (sounds.length === 0) return files / 2;
  const loaded = sounds.reduce((sum, s) => sum + s.loaded, 0);
  const total = sounds.reduce((sum, s) => sum + s.total, 0);
  return (files + loaded / total) / 2;
}

function startLoadingMeter() {
  const totalFiles = window._preloadCount;
  const fill = document.getElementById("loading-fill");
  const label = document.getElementById("loading-text");
  let shown = 0;
  const tick = () => {
    if (gameLoaded || loadingFailed) return;
    shown = Math.max(shown, loadingProgress(totalFiles));
    const percent = Math.floor(shown * 100);
    fill.style.width = percent + "%";
    label.textContent = `Loading... ${percent}%`;
    requestAnimationFrame(tick);
  };
  tick();
}

function showReadyScreen() {
  document.getElementById("loading-fill").style.width = "100%";
  document.getElementById("loading-text").textContent =
    "Click or press any key to continue";
  document.getElementById("loading-screen").classList.add("ready");
  readyScreenActive = true;
}

function dismissReadyScreen() {
  const screen = document.getElementById("loading-screen");
  if (screen.classList.contains("dismissed")) return;
  screen.classList.add("dismissed");
  screen.addEventListener("transitionend", (e) => {
    if (e.target === screen) readyScreenActive = false;
  });
  if (gameMode === "title") assets.titleMusic.loop();
}
