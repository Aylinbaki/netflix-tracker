const API_URL = "http://localhost:5000/api/add";
const COMPLETE_RATIO = 0.88;
const sentKeys = new Set();

let attachedVideo = null;

function textOf(el) {
  return (el && el.textContent ? el.textContent : "").replace(/\s+/g, " ").trim();
}

function parseSeasonEpisode(text) {
  if (!text) {
    return { season: null, episode: null, episodeTitle: "" };
  }

  const patterns = [
    /S(?:eason)?\s*(\d+)\s*[:\-–]\s*E(?:p(?:isode)?)?\s*(\d+)/i,
    /S(?:eason)?\s*(\d+)\s*[:\-–]\s*B(?:ölüm)?\s*(\d+)/i,
    /(\d+)\.\s*Sezon\s+(\d+)\.\s*Bölüm/i,
    /Sezon\s*(\d+)\s*[:\-–]\s*Bölüm\s*(\d+)/i,
    /Season\s*(\d+)\s*[:\-–]?\s*Episode\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        season: Number(match[1]),
        episode: Number(match[2]),
        episodeTitle: text.replace(match[0], "").replace(/^[:\-–.\s]+/, "").trim(),
      };
    }
  }

  return { season: null, episode: null, episodeTitle: text };
}

function getPlayerTitleRoot() {
  return (
    document.querySelector('[data-uia="video-title"]') ||
    document.querySelector(".video-title") ||
    document.querySelector('[class*="watch-video--player-view-title"]')
  );
}

function getWatchInfo() {
  const root = getPlayerTitleRoot();
  const heading = root ? root.querySelector("h4") : null;
  const spans = root ? Array.from(root.querySelectorAll("span")) : [];
  const titleFromPlayer = textOf(heading) || textOf(root);

  const metaText = spans.map(textOf).filter(Boolean).join(" ");
  const parsed = parseSeasonEpisode(metaText || titleFromPlayer);

  let title = titleFromPlayer;
  if (heading) {
    title = textOf(heading);
  } else if (parsed.season !== null) {
    title = (metaText || titleFromPlayer).replace(
      /S(?:eason)?\s*\d+\s*[:\-–]\s*E(?:p(?:isode)?)?\s*\d+.*/i,
      ""
    ).trim();
  }

  if (!title) {
    const pageTitle = document.title.replace(/\s*[|\-–]\s*Netflix.*$/i, "").trim();
    title = pageTitle;
  }

  return {
    title: title || "",
    season: parsed.season,
    episode: parsed.episode,
    episodeTitle: parsed.episodeTitle || "",
  };
}

function watchKey(info) {
  return [info.title, info.season ?? "", info.episode ?? ""].join("|");
}

async function reportCompletion(info) {
  const key = watchKey(info);
  if (!info.title || sentKeys.has(key)) {
    return;
  }
  sentKeys.add(key);

  const payload = {
    title: info.title,
    status: "completed",
    season: info.season,
    episode: info.episode,
    notes: info.episodeTitle || "",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      sentKeys.delete(key);
      console.warn("Netflix Tracker: API yanıtı başarısız", response.status);
    }
  } catch (error) {
    sentKeys.delete(key);
    console.warn("Netflix Tracker: API isteği gönderilemedi", error);
  }
}

function onTimeUpdate(event) {
  const video = event.target;
  if (!video.duration || !Number.isFinite(video.duration) || video.duration <= 0) {
    return;
  }

  const progress = video.currentTime / video.duration;
  if (progress < COMPLETE_RATIO) {
    return;
  }

  const info = getWatchInfo();
  reportCompletion(info);
}

function attachToVideo(video) {
  if (!video || video === attachedVideo) {
    return;
  }

  if (attachedVideo) {
    attachedVideo.removeEventListener("timeupdate", onTimeUpdate);
  }

  attachedVideo = video;
  video.addEventListener("timeupdate", onTimeUpdate);
}

function findPlayerVideo() {
  const videos = Array.from(document.querySelectorAll("video"));
  return videos.find((video) => video.offsetWidth > 0 && video.readyState > 0) || videos[0] || null;
}

function syncPlayer() {
  attachToVideo(findPlayerVideo());
}

syncPlayer();

const observer = new MutationObserver(() => {
  syncPlayer();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
