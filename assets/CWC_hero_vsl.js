(function () {
  'use strict';

  /**
   * Convert a Loom share URL or embed URL into the embed URL with autoplay params.
   * Accepts:
   *   https://www.loom.com/share/abc123def456
   *   https://www.loom.com/embed/abc123def456
   *   https://loom.com/share/abc123def456?...
   */
  function getLoomEmbedUrl(loomUrl) {
    if (!loomUrl) return null;
    var match = loomUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
    if (!match || !match[1]) return null;
    return 'https://www.loom.com/embed/' + match[1] +
           '?autoplay=1&hide_owner=true&hide_share=true&hide_title=true';
  }

  function activateLoomVideo(triggerEl, frameEl) {
    var loomUrl = triggerEl.dataset.loomUrl;
    var embedUrl = getLoomEmbedUrl(loomUrl);
    if (!embedUrl) {
      console.warn('[CWC_hero_vsl] Invalid Loom URL:', loomUrl);
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.className = 'cwc_hero-vsl__iframe';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('title', 'Video');
    frameEl.appendChild(iframe);
    triggerEl.style.display = 'none';
  }

  function activateShopifyVideo(triggerEl, frameEl) {
    var template = frameEl.querySelector('template.cwc_hero-vsl__video-template');
    if (!template || !template.content) {
      console.warn('[CWC_hero_vsl] Shopify video template not found.');
      return;
    }

    var clone = template.content.cloneNode(true);
    frameEl.appendChild(clone);

    var videoEl = frameEl.querySelector('video');
    if (videoEl) {
      if (!videoEl.classList.contains('cwc_hero-vsl__video')) {
        videoEl.classList.add('cwc_hero-vsl__video');
      }
      videoEl.setAttribute('controls', '');
      videoEl.setAttribute('playsinline', '');
      var playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          /* autoplay may be blocked — controls are visible so user can still play */
        });
      }
    }

    triggerEl.style.display = 'none';
  }

  function initVideoTrigger(triggerEl) {
    if (!triggerEl || triggerEl.dataset.initialized === 'true') return;
    triggerEl.dataset.initialized = 'true';

    var playButton = triggerEl.querySelector('.cwc_hero-vsl__play-button');
    if (!playButton) return;

    var provider = triggerEl.dataset.provider;
    var frameEl = triggerEl.parentElement;
    if (!frameEl) return;

    function handlePlay(e) {
      e.preventDefault();
      if (provider === 'loom') {
        activateLoomVideo(triggerEl, frameEl);
      } else if (provider === 'shopify') {
        activateShopifyVideo(triggerEl, frameEl);
      }
    }

    playButton.addEventListener('click', handlePlay);
    // Allow clicking anywhere on the trigger (poster), not just the button itself
    triggerEl.addEventListener('click', function (e) {
      if (e.target === playButton || playButton.contains(e.target)) return;
      handlePlay(e);
    });
  }

  function initSection(sectionEl) {
    if (!sectionEl) return;
    var triggers = sectionEl.querySelectorAll('.cwc_hero-vsl__video-trigger');
    triggers.forEach(initVideoTrigger);
  }

  function initAllSections() {
    document.querySelectorAll('.cwc_hero-vsl').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  // Theme Editor live preview support
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.cwc_hero-vsl');
    if (section) initSection(section);
  });
})();
