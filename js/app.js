/* ============================================================
   QR Code Generator — Application Logic
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  const urlInput = document.getElementById('urlInput');
  const urlBadge = document.getElementById('urlBadge');
  const qrPreview = document.getElementById('qrPreview');
  const qrCanvas = document.getElementById('qrCanvas');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const customizeToggle = document.getElementById('customizeToggle');
  const customizePanel = document.getElementById('customizePanel');
  const fgColorInput = document.getElementById('fgColor');
  const bgColorInput = document.getElementById('bgColor');
  const colorPresets = document.getElementById('colorPresets');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeValue = document.getElementById('sizeValue');
  const errorCorrection = document.getElementById('errorCorrection');
  const btnDownloadPNG = document.getElementById('btnDownloadPNG');
  const btnDownloadSVG = document.getElementById('btnDownloadSVG');
  const btnDownloadPDF = document.getElementById('btnDownloadPDF');
  const btnCopyLink = document.getElementById('btnCopyLink');
  const toast = document.getElementById('toast');

  /* ---------- State ---------- */
  var currentURL = '';
  var currentOptions = {
    width: 400,
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  };

  /* ---------- Helpers ---------- */
  function debounce(fn, delay) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, delay);
    };
  }

  function showToast(message, isError) {
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '') + ' show';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }

  function setButtonsEnabled(enabled) {
    btnDownloadPNG.disabled = !enabled;
    btnDownloadSVG.disabled = !enabled;
    btnDownloadPDF.disabled = !enabled;
    btnCopyLink.disabled = !enabled;
  }

  function detectURLType(url) {
    if (!url) return null;
    if (/youtube\.com\/watch|youtu\.be|youtube\.com\/shorts/.test(url)) return 'youtube';
    if (/vimeo\.com\/\d+/.test(url)) return 'vimeo';
    if (/^https?:\/\//.test(url)) return 'website';
    return null;
  }

  function updateURLBadge(url) {
    var type = detectURLType(url);
    urlBadge.className = 'url-badge';
    if (type === 'youtube') {
      urlBadge.className = 'url-badge youtube';
      urlBadge.textContent = 'YouTube';
    } else if (type === 'vimeo') {
      urlBadge.className = 'url-badge vimeo';
      urlBadge.textContent = 'Vimeo';
    } else if (type === 'website') {
      urlBadge.className = 'url-badge website';
      urlBadge.textContent = 'Website';
    } else {
      urlBadge.className = 'url-badge';
      urlBadge.textContent = '';
    }
  }

  /* ---------- QR Generation ---------- */
  function generateQR() {
    if (!currentURL) {
      qrCanvas.style.display = 'none';
      qrPlaceholder.style.display = 'flex';
      qrPreview.classList.remove('active');
      setButtonsEnabled(false);
      updateURLBadge('');
      return;
    }

    updateURLBadge(currentURL);

    try {
      QRCode.toCanvas(qrCanvas, currentURL, currentOptions, function (error) {
        if (error) {
          console.error('QR generation failed:', error);
          qrCanvas.style.display = 'none';
          qrPlaceholder.style.display = 'flex';
          qrPreview.classList.remove('active');
          setButtonsEnabled(false);
          showToast('Could not generate QR code. Check the URL.', true);
          return;
        }
        qrCanvas.style.display = 'block';
        qrPlaceholder.style.display = 'none';
        qrPreview.classList.add('active');
        setButtonsEnabled(true);
      });
    } catch (e) {
      console.error('QR generation error:', e);
      showToast('Something went wrong. Please try again.', true);
    }
  }

  var generateDebounced = debounce(function () {
    var raw = urlInput.value.trim();
    if (raw && !/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
    }
    currentURL = raw;
    generateQR();
  }, 300);

  /* ---------- Customization ---------- */
  function updateOptions() {
    currentOptions.width = parseInt(sizeSlider.value, 10);
    currentOptions.color.dark = fgColorInput.value;
    currentOptions.color.light = bgColorInput.value;
    currentOptions.errorCorrectionLevel = errorCorrection.value;
    sizeValue.textContent = currentOptions.width;
    generateQR();
  }

  function setActivePreset(color) {
    var buttons = colorPresets.querySelectorAll('.color-preset');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('active', buttons[i].dataset.color === color);
    }
  }

  /* ---------- Downloads ---------- */

  function downloadPNG() {
    if (!currentURL) return;
    var link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('QR code downloaded as PNG');
  }

  function downloadSVG() {
    if (!currentURL) return;
    QRCode.toString(currentURL, {
      type: 'svg',
      width: currentOptions.width,
      margin: currentOptions.margin,
      color: currentOptions.color,
      errorCorrectionLevel: currentOptions.errorCorrectionLevel
    }, function (error, svgString) {
      if (error) {
        showToast('Failed to generate SVG.', true);
        return;
      }
      var blob = new Blob([svgString], { type: 'image/svg+xml' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = 'qr-code.svg';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('QR code downloaded as SVG');
    });
  }

  function downloadPDF() {
    if (!currentURL) return;
    try {
      var jsPDF = window.jspdf.jsPDF;
      var imgData = qrCanvas.toDataURL('image/png');
      var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var imgSize = Math.min(pageWidth - 40, 160);
      doc.addImage(imgData, 'PNG', (pageWidth - imgSize) / 2, (pageHeight - imgSize) / 2, imgSize, imgSize);
      doc.save('qr-code.pdf');
      showToast('QR code downloaded as PDF');
    } catch (e) {
      console.error('PDF generation error:', e);
      showToast('Failed to generate PDF.', true);
    }
  }

  /* ---------- Share Link ---------- */
  function copyShareLink() {
    if (!currentURL) return;
    var shareURL = window.location.origin + window.location.pathname + '?url=' + encodeURIComponent(currentURL);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareURL).then(function () {
        showToast('Share link copied to clipboard');
      }, function () {
        fallbackCopy(shareURL);
      });
    } else {
      fallbackCopy(shareURL);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Share link copied to clipboard');
    } catch (e) {
      showToast('Failed to copy. Here is your link: ' + text, true);
    }
    document.body.removeChild(textarea);
  }

  /* ---------- Customization Toggle ---------- */
  function toggleCustomize() {
    var isOpen = customizePanel.classList.toggle('open');
    customizeToggle.classList.toggle('open', isOpen);
    customizeToggle.querySelector('.toggle-label').textContent = isOpen ? 'Customize \u25B2' : 'Customize \u25BC';
  }

  /* ---------- Init ---------- */
  function init() {
    // URL input
    urlInput.addEventListener('input', generateDebounced);
    urlInput.addEventListener('paste', function () {
      setTimeout(generateDebounced, 50);
    });

    // Customization toggle
    customizeToggle.addEventListener('click', toggleCustomize);

    // Color pickers
    fgColorInput.addEventListener('input', function () {
      setActivePreset(fgColorInput.value);
      updateOptions();
    });
    bgColorInput.addEventListener('input', updateOptions);

    // Color presets
    colorPresets.addEventListener('click', function (e) {
      var btn = e.target.closest('.color-preset');
      if (!btn) return;
      var color = btn.dataset.color;
      fgColorInput.value = color;
      setActivePreset(color);
      updateOptions();
    });

    // Size slider
    sizeSlider.addEventListener('input', updateOptions);

    // Error correction
    errorCorrection.addEventListener('change', updateOptions);

    // Download buttons
    btnDownloadPNG.addEventListener('click', downloadPNG);
    btnDownloadSVG.addEventListener('click', downloadSVG);
    btnDownloadPDF.addEventListener('click', downloadPDF);
    btnCopyLink.addEventListener('click', copyShareLink);

    // Check for pre-filled URL from query param
    var params = new URLSearchParams(window.location.search);
    var queryURL = params.get('url');
    if (queryURL) {
      urlInput.value = queryURL;
      generateDebounced();
    }

    // Initial state
    setButtonsEnabled(false);
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
