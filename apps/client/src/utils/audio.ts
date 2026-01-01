/**
 * iOS対応: 音声コンテキストを有効化する
 * iOSでは最初のユーザーインタラクションが必要
 * use-sound (Howler.js) を使用する前に、音声コンテキストを有効化する必要がある
 */
let audioContextEnabled = false;

export function enableAudioContext() {
  if (audioContextEnabled) return;

  try {
    // 空の音声を作成して再生することで、音声コンテキストを有効化
    const audio = new Audio();
    audio.src =
      "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    audio.volume = 0.01;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audioContextEnabled = true;
        })
        .catch((error) => {
          // エラーは無視（既に有効化されている可能性がある）
          console.debug("Audio context enable attempt:", error);
        });
    }
  } catch (error) {
    console.debug("Audio context enable error:", error);
  }
}

/**
 * ユーザーインタラクション時に音声コンテキストを有効化
 * iOSでは最初のタッチやクリックで音声を有効化する必要がある
 */
export function setupAudioContextOnInteraction() {
  if (audioContextEnabled) return;

  const enableOnInteraction = () => {
    enableAudioContext();
    // 一度有効化したら、イベントリスナーを削除
    document.removeEventListener("touchstart", enableOnInteraction);
    document.removeEventListener("click", enableOnInteraction);
    document.removeEventListener("touchend", enableOnInteraction);
  };

  // iOSでは touchstart が重要
  document.addEventListener("touchstart", enableOnInteraction, {
    once: true,
    passive: true,
  });
  document.addEventListener("touchend", enableOnInteraction, {
    once: true,
    passive: true,
  });
  document.addEventListener("click", enableOnInteraction, { once: true });
}
