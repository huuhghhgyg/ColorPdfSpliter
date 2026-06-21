'use strict';

/* =============================================
   ColorPdfSpliter — Web UI Controller
   ============================================= */

// ─── State Enum ─────────────────────────────────
const STATE = Object.freeze({
  LOADING:       'loading',
  READY:         'ready',
  FILE_SELECTED: 'file-selected',
  PROCESSING:    'processing',
  COMPLETED:     'completed',
  ERROR:         'error',
});

// ─── DOM Cache ──────────────────────────────────
const id = (s) => document.getElementById(s);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const DOM = {
  sLoading: id('s-loading'),
  sReady:   id('s-ready'),
  sActive:  id('s-active'),

  stepList: id('stepList'),

  dropZone: id('dropZone'),
  fileInput: id('fileInput'),

  fileCard: id('fileCard'),
  fileName: id('fileName'),
  fileMeta: id('fileMeta'),
  removeBtn: id('removeFileBtn'),

  actionBar: id('actionBar'),
  processBtn: id('processBtn'),

  progressCard: id('progressCard'),
  progressFill: id('progressFill'),
  progressPct:  id('progressPct'),
  progressText: id('progressText'),

  resultsWrap: id('resultsWrap'),
  downloadList: id('downloadList'),
  zipBtn: id('zipBtn'),
  reprocessBtn: id('reprocessBtn'),
  resetBtn: id('resetBtn'),

  errorWrap: id('errorWrap'),
  errorMsg:  id('errorMsg'),
  retryBtn:  id('retryBtn'),

  consolePanel: id('consolePanel'),
  consoleBar:   id('consoleBar'),
  consoleEl:    id('console'),
  consoleToggle: id('consoleToggleBtn'),
  clearLogBtn:  id('clearLogBtn'),

  // Options
  rgbDiff:        id('rgbDiff'),
  rgbDiffRange:   id('rgbDiffRange'),
  duplexCheckbox: id('duplexCheckbox'),
  segmentedCheckbox: id('segmentedCheckbox'),
};

// ─── Internal State ──────────────────────────────
let _file = null;
let _fileBlobs = [];  // {name, blob} for ZIP download

// ─── State Transitions ───────────────────────────
function showScene(name) {
  $$('.scene.active').forEach((el) => el.classList.remove('active'));
  const el = id('s-' + name);
  if (el) el.classList.add('active');
}

function setState(next, data) {
  switch (next) {
    case STATE.LOADING:
      showScene('loading');
      break;

    case STATE.READY:
      showScene('ready');
      break;

    case STATE.FILE_SELECTED: {
      showScene('active');
      DOM.progressCard.hidden = true;
      DOM.resultsWrap.hidden = true;
      DOM.errorWrap.hidden = true;
      DOM.actionBar.hidden = false;
      if (data && data.file) {
        DOM.fileName.textContent = data.file.name;
        DOM.fileMeta.textContent = formatSize(data.file.size);
        _file = data.file;
      }
      break;
    }

    case STATE.PROCESSING:
      DOM.actionBar.hidden = true;
      DOM.progressCard.hidden = false;
      DOM.resultsWrap.hidden = true;
      DOM.errorWrap.hidden = true;
      break;

    case STATE.COMPLETED:
      DOM.progressCard.hidden = true;
      DOM.resultsWrap.hidden = false;
      DOM.errorWrap.hidden = true;
      break;

    case STATE.ERROR:
      DOM.progressCard.hidden = true;
      DOM.resultsWrap.hidden = true;
      DOM.errorWrap.hidden = false;
      if (data && data.message) {
        DOM.errorMsg.textContent = data.message;
      }
      break;
  }
}

// ─── Utilities ───────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function scrollBottom(el) {
  el.scrollTop = el.scrollHeight;
}

function escapeHtml(s) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(s));
  return d.innerHTML;
}
function escapeAttr(s) {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── Logging (called from worker) ───────────────
function logEntry(text, cls) {
  var div = document.createElement('div');
  div.className = 'log-line ' + (cls || 'log-info');
  div.textContent = text;
  DOM.consoleEl.appendChild(div);
  scrollBottom(DOM.consoleEl);
}

window.println = function (msg) { logEntry(msg, 'log-info'); };

window.print = function (msg) {
  var last = DOM.consoleEl.lastElementChild;
  if (last && last.classList.contains('log-info')) {
    last.textContent += msg;
  } else {
    logEntry(msg, 'log-info');
  }
};

window.printError = function (msg) { logEntry(msg, 'log-error'); };

// ─── Progress (called from worker) ──────────────
window.setProgress = function (current, total) {
  var pct = total > 0 ? Math.round((current / total) * 100) : 0;
  DOM.progressFill.style.width = pct + '%';
  DOM.progressPct.textContent = pct + '%';
  DOM.progressText.textContent = current + '/' + total;
};

// ─── Error handler (called from worker) ────────────
window.setError = function (message) {
  setState(STATE.ERROR, { message: message || '文件处理失败' });
};

// ─── Download Link Generation (called from worker) ──
window.generateFileLink = function (filename, blob) {
  var isColor = filename.indexOf('彩色') !== -1;
  var icon = isColor ? '🖨️' : '📄';
  var label = isColor ? '彩色页面' : '黑白页面';
  var size = formatSize(blob.size);

  var card = document.createElement('div');
  card.className = 'download-card';
  card.innerHTML =
    '<span class="dl-icon">' + icon + '</span>' +
    '<div class="dl-info">' +
      '<span class="dl-name">' + escapeHtml(filename) + '</span>' +
      '<span class="dl-meta">' + size + ' · ' + label + '</span>' +
    '</div>' +
    '<button class="dl-btn">⬇ 下载</button>';

  card.querySelector('.dl-btn').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  DOM.downloadList.appendChild(card);

  // 保存blob用于ZIP打包
  _fileBlobs.push({ name: filename, blob: blob });

  // 多个文件时显示「下载全部」按钮
  if (_fileBlobs.length >= 2 && DOM.zipBtn.hidden) {
    DOM.zipBtn.hidden = false;
  }

  // 确保结果显示区域可见
  setState(STATE.COMPLETED);
};

// ─── ZIP Download All ────────────────────────────
function downloadAll() {
  if (!_fileBlobs.length) return;
  var zip = new JSZip();
  _fileBlobs.forEach(function (item) {
    zip.file(item.name, item.blob);
  });
  DOM.zipBtn.disabled = true;
  DOM.zipBtn.textContent = '⏳ 打包中…';
  zip.generateAsync({ type: 'blob' }).then(function (blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    var baseName = _file ? _file.name.replace(/\.pdf$/i, '') : 'output';
    a.download = baseName + '_分段.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    DOM.zipBtn.disabled = false;
    DOM.zipBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h10l1 4v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6l1-4z"/><line x1="2" y1="6" x2="14" y2="6"/><path d="M6 10l2 2 2-2M8 8v4"/></svg> 下载全部 (ZIP)';
  });
}

// ─── Enable components (called from worker) ───────
window.enableComponents = function () {
  DOM.fileInput.disabled = false;

  var steps = DOM.stepList.querySelectorAll('.step');
  steps.forEach(function (s) {
    if (s.classList.contains('active')) {
      s.classList.remove('active');
      s.classList.add('done');
    }
  });

  setTimeout(function () { setState(STATE.READY); }, 400);
};

// ─── Console toggle (called from worker) ──────────
window.switchConsole = function (isOpen) {
  DOM.consolePanel.classList.toggle('collapsed', !isOpen);
};

// ─── Loading steps ────────────────────────────────
function markStepDone(idx) {
  var steps = DOM.stepList.querySelectorAll('.step');
  steps.forEach(function (s) {
    var n = parseInt(s.getAttribute('data-idx'), 10);
    if (n === idx) {
      s.classList.remove('active');
      s.classList.add('done');
    } else if (n === idx + 1) {
      s.classList.add('active');
    }
  });
}

// ─── Web Worker ──────────────────────────────────
var pythonWorker = new Worker('worker.js');

pythonWorker.onmessage = function (e) {
  var fn = e.data.f;
  var args = e.data.args;

  if (fn === 'println') {
    var msg = args;
    if (typeof args === 'string') {
      if (msg.indexOf('micropip') !== -1) markStepDone(1);
      if (msg.indexOf('PyMuPDF') !== -1)  markStepDone(2);
      if (msg.indexOf('numpy') !== -1)    markStepDone(3);
      if (msg.indexOf('准备就绪') !== -1 || msg.indexOf('库引用完成') !== -1) markStepDone(4);
    }
    window[fn](args);
    return;
  }

  if (!Array.isArray(args)) {
    window[fn](args);
    return;
  }
  window[fn].apply(null, args);
};

// ─── Event Handlers ──────────────────────────────

function initDropZone() {
  var zone = DOM.dropZone;

  zone.addEventListener('click', function () {
    if (!DOM.fileInput.disabled) DOM.fileInput.click();
  });

  DOM.fileInput.addEventListener('change', function () {
    var file = DOM.fileInput.files && DOM.fileInput.files[0];
    if (file) handleFile(file);
  });

  ['dragenter', 'dragover'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove('dragover');
    });
  });

  zone.addEventListener('drop', function (e) {
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      handleFile(file);
    } else {
      println('⚠️ 请选择 PDF 格式的文件');
    }
  });
}

function handleFile(file) {
  _file = file;
  setState(STATE.FILE_SELECTED, { file: file });
  println('📎 已选择文件: ' + file.name + ' (' + formatSize(file.size) + ')');
}

function removeFile() {
  _file = null;
  DOM.fileInput.value = '';
  DOM.downloadList.innerHTML = '';
  setState(STATE.READY);
}

function startProcessing() {
  if (!_file) return;

  var rgbDiff = parseInt(DOM.rgbDiff.value, 10) || 30;
  var duplex = DOM.duplexCheckbox.checked;
  var segmented = DOM.segmentedCheckbox.checked;

  // Send settings to worker
  pythonWorker.postMessage({ f: 'setValue', args: ['RGBDiff', rgbDiff] });
  pythonWorker.postMessage({ f: 'setValue', args: ['if_duplex', duplex] });
  pythonWorker.postMessage({ f: 'setValue', args: ['if_segmented', segmented] });

  println('☑ RGBDiff = ' + rgbDiff);
  println('☑ 双面打印 = ' + (duplex ? '开' : '关'));
  println('☑ 分段导出 = ' + (segmented ? '开' : '关'));

  // Reset UI
  DOM.progressFill.style.width = '0%';
  DOM.progressPct.textContent = '0%';
  DOM.progressText.textContent = '0/0';
  DOM.downloadList.innerHTML = '';
  DOM.zipBtn.hidden = true;
  _fileBlobs = [];

  setState(STATE.PROCESSING);
  pythonWorker.postMessage({ f: 'processFile', args: _file });
}

function resetAll() {
  DOM.downloadList.innerHTML = '';
  _file = null;
  DOM.zipBtn.hidden = true;
  _fileBlobs = [];
  DOM.fileInput.value = '';
  setState(STATE.READY);
}

function retryProcessing() {
  startProcessing();
}

// ─── Options Bar ─────────────────────────────────
function initOptions() {
  // Sync range slider <-> number input
  DOM.rgbDiffRange.addEventListener('input', function () {
    DOM.rgbDiff.value = this.value;
  });

  DOM.rgbDiff.addEventListener('change', function () {
    var val = parseInt(this.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 255) val = 255;
    this.value = val;
    DOM.rgbDiffRange.value = val;
  });

  // Defaults
  DOM.rgbDiff.value = '30';
  DOM.rgbDiffRange.value = '30';
  DOM.duplexCheckbox.checked = false;
  DOM.segmentedCheckbox.checked = false;
}

// ─── Console Panel ────────────────────────────────
function initConsole() {
  DOM.consoleBar.addEventListener('click', function (e) {
    if (e.target.closest('.btn-icon')) return;
    DOM.consolePanel.classList.toggle('collapsed');
  });

  DOM.consoleToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    DOM.consolePanel.classList.toggle('collapsed');
  });

  DOM.clearLogBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    DOM.consoleEl.innerHTML = '';
  });
}

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initDropZone();
  initConsole();
  initOptions();

  DOM.processBtn.addEventListener('click', startProcessing);
  DOM.removeBtn.addEventListener('click', removeFile);
  DOM.reprocessBtn.addEventListener('click', startProcessing);
  DOM.resetBtn.addEventListener('click', resetAll);
  DOM.retryBtn.addEventListener('click', retryProcessing);
  DOM.zipBtn.addEventListener('click', downloadAll);

  println('⏳ 正在准备 Pyodide 和相关依赖…');

  var firstStep = DOM.stepList.querySelector('.step[data-idx="1"]');
  if (firstStep) firstStep.classList.add('active');
});
