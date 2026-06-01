/* ============================================================
   QR Code Generator — Application Logic
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM refs ---------- */
  var urlInput = document.getElementById('urlInput');
  var urlBadge = document.getElementById('urlBadge');
  var qrPreview = document.getElementById('qrPreview');
  var qrCanvas = document.getElementById('qrCanvas');
  var qrHidden = document.getElementById('qrHidden');
  var qrPlaceholder = document.getElementById('qrPlaceholder');
  var customizeToggle = document.getElementById('customizeToggle');
  var customizePanel = document.getElementById('customizePanel');
  var fgColorInput = document.getElementById('fgColor');
  var bgColorInput = document.getElementById('bgColor');
  var colorPresets = document.getElementById('colorPresets');
  var sizeSlider = document.getElementById('sizeSlider');
  var sizeValue = document.getElementById('sizeValue');
  var errorCorrection = document.getElementById('errorCorrection');
  var btnDownloadPNG = document.getElementById('btnDownloadPNG');
  var btnDownloadSVG = document.getElementById('btnDownloadSVG');
  var btnDownloadPDF = document.getElementById('btnDownloadPDF');
  var btnCopyLink = document.getElementById('btnCopyLink');
  var toast = document.getElementById('toast');

  /* ---------- State ---------- */
  var currentURL = '';
  var currentOptions = {
    width: 400,
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
    errorCorrectionLevel: 'M'
  };
  var qrInstance = null;

  /* ---------- Helpers ---------- */
  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
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

  function getCorrectLevel(level) {
    var map = { L: QRCode.CorrectLevel.L, M: QRCode.CorrectLevel.M, Q: QRCode.CorrectLevel.Q, H: QRCode.CorrectLevel.H };
    return map[level] || QRCode.CorrectLevel.M;
  }

  /* ---------- Canvas rendering ---------- */
  function renderToCanvas(modules, moduleCount) {
    var size = currentOptions.width;
    var quiet = currentOptions.margin;
    var totalModules = moduleCount + quiet * 2;
    var moduleSize = Math.floor(size / totalModules);
    var offset = quiet * moduleSize;
    var renderSize = moduleCount * moduleSize;

    qrCanvas.width = size;
    qrCanvas.height = size;

    var ctx = qrCanvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = currentOptions.color.light;
    ctx.fillRect(0, 0, size, size);

    // Modules
    ctx.fillStyle = currentOptions.color.dark;
    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        if (modules && modules[row] && modules[row][col]) {
          ctx.fillRect(offset + col * moduleSize, offset + row * moduleSize, moduleSize, moduleSize);
        }
      }
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
      qrInstance = null;
      return;
    }

    updateURLBadge(currentURL);

    try {
      // Clear hidden div and recreate QRCode instance
      qrHidden.innerHTML = '';
      qrInstance = new QRCode(qrHidden, {
        text: currentURL,
        width: currentOptions.width,
        height: currentOptions.width,
        colorDark: currentOptions.color.dark,
        colorLight: currentOptions.color.light,
        correctLevel: getCorrectLevel(currentOptions.errorCorrectionLevel)
      });

      // Extract module data and render to canvas
      var modules = qrInstance._oQRCode.modules;
      var moduleCount = qrInstance._oQRCode.moduleCount;
      renderToCanvas(modules, moduleCount);

      // Show canvas
      qrCanvas.style.display = 'block';
      qrPlaceholder.style.display = 'none';
      qrPreview.classList.add('active');
      setButtonsEnabled(true);
    } catch (e) {
      console.error('QR generation error:', e);
      qrCanvas.style.display = 'none';
      qrPlaceholder.style.display = 'flex';
      qrPreview.classList.remove('active');
      setButtonsEnabled(false);
      showToast('Could not generate QR code. Check the URL.', true);
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
    if (!currentURL || !qrInstance) return;
    try {
      var modules = qrInstance._oQRCode.modules;
      var moduleCount = qrInstance._oQRCode.moduleCount;
      var size = currentOptions.width;
      var quiet = currentOptions.margin;
      var totalModules = moduleCount + quiet * 2;
      var moduleSize = size / totalModules;
      var dark = currentOptions.color.dark;
      var light = currentOptions.color.light;

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
      svg += '<rect width="' + size + '" height="' + size + '" fill="' + light + '"/>';

      var offset = quiet * moduleSize;
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          if (modules[row] && modules[row][col]) {
            var x = offset + col * moduleSize;
            var y = offset + row * moduleSize;
            svg += '<rect x="' + x + '" y="' + y + '" width="' + moduleSize + '" height="' + moduleSize + '" fill="' + dark + '"/>';
          }
        }
      }
      svg += '</svg>';

      var blob = new Blob([svg], { type: 'image/svg+xml' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = 'qr-code.svg';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('QR code downloaded as SVG');
    } catch (e) {
      console.error('SVG generation error:', e);
      showToast('Failed to generate SVG.', true);
    }
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
    urlInput.addEventListener('input', generateDebounced);
    urlInput.addEventListener('paste', function () {
      setTimeout(generateDebounced, 50);
    });

    customizeToggle.addEventListener('click', toggleCustomize);

    fgColorInput.addEventListener('input', function () {
      setActivePreset(fgColorInput.value);
      updateOptions();
    });
    bgColorInput.addEventListener('input', updateOptions);

    colorPresets.addEventListener('click', function (e) {
      var btn = e.target.closest('.color-preset');
      if (!btn) return;
      var color = btn.dataset.color;
      fgColorInput.value = color;
      setActivePreset(color);
      updateOptions();
    });

    sizeSlider.addEventListener('input', updateOptions);
    errorCorrection.addEventListener('change', updateOptions);

    btnDownloadPNG.addEventListener('click', downloadPNG);
    btnDownloadSVG.addEventListener('click', downloadSVG);
    btnDownloadPDF.addEventListener('click', downloadPDF);
    btnCopyLink.addEventListener('click', copyShareLink);

    var params = new URLSearchParams(window.location.search);
    var queryURL = params.get('url');
    if (queryURL) {
      urlInput.value = queryURL;
      generateDebounced();
    }

    setButtonsEnabled(false);
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
