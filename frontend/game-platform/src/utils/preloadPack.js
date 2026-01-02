function preloadImage(src, onProgress) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        console.log("✅ Image loaded:", src);
        onProgress?.();
        resolve({ ok: true, type: "image", src, asset: img });
      };

      img.onerror = () => {
        console.warn("❌ Image failed to load:", src);
        onProgress?.();
        resolve({ ok: false, type: "image", src });
      };
    } catch (err) {
      console.error("🔥 Image preload exception:", src, err);
      onProgress?.();
      resolve({ ok: false, type: "image", src });
    }
  });
}

function preloadVideo(src, onProgress) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.src = src;
      video.preload = "auto";

      video.onloadeddata = () => {
        console.log("✅ Video loaded:", src);
        onProgress?.();
        resolve({ ok: true, type: "video", src, asset: video });
      };

      video.onerror = () => {
        console.warn("❌ Video failed to load:", src);
        onProgress?.();
        resolve({ ok: false, type: "video", src });
      };
    } catch (err) {
      console.error("🔥 Video preload exception:", src, err);
      onProgress?.();
      resolve({ ok: false, type: "video", src });
    }
  });
}

export async function preloadPack(packJson, onProgress) {
  const preloadTasks = [];
  const svgs = [];

  const allAssets = [];

  for (const sign of packJson.signs || []) {
    if (sign.videoUrl) allAssets.push(sign.videoUrl);
    if (sign.visual?.type === "image") allAssets.push(sign.visual.value);
    if (sign.assets?.match?.images) allAssets.push(...sign.assets.match.images);
  }

  let loadedCount = 0;
  const reportProgress = () => {
    loadedCount++;
    onProgress?.(loadedCount, allAssets.length);
  };

  for (const sign of packJson.signs || []) {
    if (sign.videoUrl) preloadTasks.push(preloadVideo(sign.videoUrl, reportProgress));

    if (sign.visual?.type === "image") preloadTasks.push(preloadImage(sign.visual.value, reportProgress));
    if (sign.visual?.type === "svg") svgs.push({ id: sign.id, path: sign.visual.value });

    if (sign.assets?.match?.images) {
      for (const img of sign.assets.match.images) {
        preloadTasks.push(preloadImage(img, reportProgress));
      }
    }
  }

  const results = await Promise.all(preloadTasks);

  const images = {};
  const videos = {};
  for (const res of results) {
    if (!res.ok) continue;
    if (res.type === "image") images[res.src] = res.asset;
    if (res.type === "video") videos[res.src] = res.asset;
  }

  return { images, videos, svgs, totalAssets: allAssets.length };
}
