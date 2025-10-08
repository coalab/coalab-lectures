/* -----------------------------------------
   간단한 플레이리스트 → 플레이어 로딩 스크립트 (정리 버전)
   - YouTube(iframe) / MP4(video) 모두 지원
   - 핵심: 랩퍼(iframe-16x9 / video-wrap)는 hidden만 토글
------------------------------------------ */

// ====== 유틸 ======
function normalizeYouTubeURL(url) {
  // watch?v=, youtu.be → embed(nocookie)로 정규화
  try {
    const u = new URL(url);
    // youtu.be/VIDEOID
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.slice(1);
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    // youtube.com/watch?v=VIDEOID
    if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    // 이미 embed면 nocookie 도메인으로 치환
    if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
      const id = u.pathname.split('/').pop();
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch (_) {}
  return url;
}

function fallbackToYoutube(src) {
  // nocookie가 차단될 때 www.youtube.com/embed 로 폴백
  try {
    const u = new URL(src);
    if (u.hostname === 'www.youtube-nocookie.com' && u.pathname.startsWith('/embed/')) {
      const id = u.pathname.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
  } catch (_) {}
  return src;
}

function toWatchUrl(embedUrl) {
  // embed → watch 로 변환 (새 탭 열기용)
  try {
    const u = new URL(embedUrl);
    if (u.pathname.startsWith('/embed/')) {
      const id = u.pathname.split('/').pop();
      return `https://www.youtube.com/watch?v=${id}`;
    }
  } catch (_) {}
  return embedUrl;
}

function guessMime(url) {
  const lower = String(url).toLowerCase();
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.ogv') || lower.endsWith('.ogg')) return 'video/ogg';
  if (lower.endsWith('.m3u8')) return 'application/x-mpegURL';
  return 'video/mp4';
}

// ====== 전역 요소 ======
const playlist = document.getElementById('playlist');
const items = playlist ? Array.from(playlist.querySelectorAll('.item')) : [];

const iframeWrap = document.getElementById('iframeWrap');
const ytFrame = document.getElementById('ytFrame');

const videoWrap = document.getElementById('videoWrap');
const html5Video = document.getElementById('html5Video');

const videoTitleEl = document.getElementById('videoTitle');
const openOnYouTube = document.getElementById('openOnYouTube'); // 선택(없어도 됨)

// 현재 타입 추적
let currentType = null;

// ====== 핵심 로더 ======
function loadEntry(el) {
  if (!el) return;
  const type = el.dataset.type;         // "youtube" | "mp4"
  const srcRaw = el.dataset.src;
  const title = el.dataset.title || '강의 영상';

  // active 표시
  items.forEach(li => {
    li.classList.remove('is-active');
    li.setAttribute('aria-selected', 'false');
  });
  el.classList.add('is-active');
  el.setAttribute('aria-selected', 'true');

  // 이전 재생 중지
  stopAll();

  if (type === 'youtube') {
    // iframe 표시
    iframeWrap.hidden = false;
    videoWrap.hidden = true;

    // 1차: nocookie 정규화
    let finalSrc = normalizeYouTubeURL(srcRaw);
    ytFrame.src = finalSrc;
    currentType = 'youtube';

    // (선택) 외부열기 버튼 href 세팅
    if (openOnYouTube) {
      openOnYouTube.href = toWatchUrl(finalSrc);
    }

    // 간단 폴백: 1.2초 뒤에도 문제가 있으면 www.youtube.com으로 교체
    setTimeout(() => {
      if (ytFrame && ytFrame.src && ytFrame.src.includes('youtube-nocookie.com')) {
        const fb = fallbackToYoutube(finalSrc);
        if (fb !== finalSrc) {
          ytFrame.src = fb;
          if (openOnYouTube) openOnYouTube.href = toWatchUrl(fb);
        }
      }
    }, 1200);

  } else if (type === 'mp4') {
    iframeWrap.hidden = true;
    videoWrap.hidden = false;

    setVideoSource(srcRaw);
    currentType = 'mp4';
  }

  // 제목 갱신
  if (videoTitleEl) videoTitleEl.textContent = title;
}

// ====== 정지 처리 ======
function stopAll() {
  if (currentType === 'youtube') {
    if (ytFrame) ytFrame.src = 'about:blank';
  }
  if (currentType === 'mp4') {
    if (html5Video) {
      html5Video.pause();
      while (html5Video.firstChild) html5Video.removeChild(html5Video.firstChild);
      html5Video.load();
    }
  }
}

/** MP4 소스 주입 & 로드 */
function setVideoSource(src) {
  if (!html5Video) return;
  while (html5Video.firstChild) html5Video.removeChild(html5Video.firstChild);

  const source = document.createElement('source');
  source.src = src;
  source.type = guessMime(src);
  html5Video.appendChild(source);

  html5Video.load();
  // 자동재생은 정책상 차단될 수 있어 play()는 생략
}

// ====== 초기 바인딩 ======
document.addEventListener('DOMContentLoaded', () => {
  if (!playlist || items.length === 0) return;

  // 키보드 접근성
  playlist.addEventListener('keydown', (e) => {
    const current = document.activeElement.closest('.item');
    if (!current) return;
    const idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[Math.min(items.length - 1, idx + 1)];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[Math.max(0, idx - 1)];
      prev?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      loadEntry(current);
    }
  });

  // 클릭 로딩
  items.forEach(li => li.addEventListener('click', () => loadEntry(li)));

  // 첫 항목 로드
  loadEntry(items[0]);
});
