// ============================================
// #B0DYSHOT - Tracklist Renderer
// ============================================

(function () {
  'use strict';

  var TRACKS_URL = 'data/tracks.json';
  var container = document.getElementById('tracklist-container');
  var activePlayer = null;

  // オープニング演出の終了処理
  function initOpening() {
    var opening = document.getElementById('opening');
    if (!opening) return;
    setTimeout(function () {
      opening.classList.add('opening--done');
    }, 2200);
  }

  function createSCPlayer(soundcloudUrl, li) {
    // 既に開いているプレイヤーを閉じる
    if (activePlayer) {
      activePlayer.wrapper.remove();
      if (activePlayer.li === li) {
        activePlayer = null;
        return;
      }
    }

    var wrapper = document.createElement('div');
    wrapper.className = 'sc-player';

    var iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '166';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', 'no');
    iframe.setAttribute('allow', 'autoplay');
    iframe.src = 'https://w.soundcloud.com/player/?url=' +
      encodeURIComponent(soundcloudUrl) +
      '&color=%2300b4d8&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false';

    wrapper.appendChild(iframe);
    li.after(wrapper);
    activePlayer = { wrapper: wrapper, li: li };
  }

  function renderTrack(track) {
    var li = document.createElement('li');
    li.className = 'tracklist__item';

    var num = document.createElement('span');
    num.className = 'tracklist__number';
    num.textContent = String(track.number).padStart(2, '0');

    var info = document.createElement('div');
    info.className = 'tracklist__info';

    var title = document.createElement('div');
    title.className = 'tracklist__title';
    title.textContent = track.title;

    var artist = document.createElement('div');
    artist.className = 'tracklist__artist';

    if (track.link) {
      var a = document.createElement('a');
      a.href = track.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = track.artist;
      artist.appendChild(a);
    } else {
      artist.textContent = track.artist;
    }

    info.appendChild(title);
    info.appendChild(artist);
    li.appendChild(num);
    li.appendChild(info);

    // SoundCloudリンクがある場合、再生ボタンを追加
    if (track.soundcloud) {
      var playBtn = document.createElement('button');
      playBtn.className = 'tracklist__play';
      playBtn.innerHTML = '&#9654;';
      playBtn.title = 'SoundCloudで再生';
      playBtn.addEventListener('click', function () {
        createSCPlayer(track.soundcloud, li);
      });
      li.appendChild(playBtn);
    }

    return li;
  }

  function renderTracks(tracks) {
    container.innerHTML = '';
    tracks.forEach(function (track, i) {
      container.appendChild(renderTrack(track));
      // 最後の曲以外に区切り線
      if (i < tracks.length - 1) {
        var divider = document.createElement('li');
        divider.className = 'tracklist__divider';
        divider.setAttribute('aria-hidden', 'true');
        container.appendChild(divider);
      }
    });
  }

  function loadTracks() {
    fetch(TRACKS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load tracks');
        return res.json();
      })
      .then(renderTracks)
      .catch(function () {
        container.innerHTML =
          '<li class="tracklist__item"><div class="tracklist__info"><div class="tracklist__title">トラックリストは準備中です</div></div></li>';
      });
  }

  // スクロールフェードイン（セクション単位）
  function initScrollAnimations() {
    var sections = document.querySelectorAll('.about, .tracklist, .download, .footer');
    sections.forEach(function (el) {
      el.classList.add('fade-section');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    sections.forEach(function (el) {
      observer.observe(el);
    });
  }

  function init() {
    initOpening();
    loadTracks();
    initScrollAnimations();
  }

  // DOMContentLoaded で読み込み
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
