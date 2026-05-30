/* =============================================
   VIDEO MAKER — app.js
   Fix: concat.txt format, FFmpeg re-use,
        segment render, re-render single segment
   ============================================= */

var APP = {
  mode: 'manual',         // 'manual' | 'auto'
  ff: null,
  ffLoaded: false,

  // Manual
  manualMp3: null,        // File
  manualTxt: null,        // File
  manualImgs: {},         // { 'scene_00000.000s.jpg': File }

  // Auto
  autoMp3: null,
  autoTxt: null,

  // Render state
  scenes: [],             // parsed scenes
  audioDuration: 0,       // giây
  segmentDuration: 600,   // 10 phút mỗi đoạn
  segments: [],           // [{idx, start, end, scenes, blobUrl, size}]
  activeSegIdx: -1,       // đoạn đang mở trong player

  // Re-render
  reRenderOverrides: {},  // { 'scene_XXXXX.XXXs.jpg': File } — ảnh thay thế
};

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', function () {
  setupDropZone('dz-manual-mp3', 'inp-manual-mp3', 'mp3', onManualMp3);
  setupDropZone('dz-manual-txt', 'inp-manual-txt', 'txt', onManualTxt);
  setupDropZoneMulti('dz-manual-imgs', 'inp-manual-imgs', onManualImgs);
  setupDropZone('dz-auto-mp3', 'inp-auto-mp3', 'mp3', onAutoMp3);
  setupDropZone('dz-auto-txt', 'inp-auto-txt', 'txt', onAutoTxt);
});

/* ============ TABS ============ */
function switchTab(tab) {
  APP.mode = tab;
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

/* ============ DROP ZONES ============ */
function setupDropZone(dzId, inputId, ext, callback) {
  var dz = document.getElementById(dzId);
  var input = document.getElementById(inputId);

  input.addEventListener('change', function () {
    if (input.files[0]) callback(input.files[0]);
  });

  dz.addEventListener('dragover', function (e) {
    e.preventDefault();
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragleave', function () {
    dz.classList.remove('dragover');
  });
  dz.addEventListener('drop', function (e) {
    e.preventDefault();
    dz.classList.remove('dragover');
    var f = e.dataTransfer.files[0];
    if (f) callback(f);
  });
}

function setupDropZoneMulti(dzId, inputId, callback) {
  var dz = document.getElementById(dzId);
  var input = document.getElementById(inputId);

  input.addEventListener('change', function () {
    if (input.files.length > 0) callback(Array.from(input.files));
  });

  dz.addEventListener('dragover', function (e) {
    e.preventDefault();
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
  dz.addEventListener('drop', function (e) {
    e.preventDefault();
    dz.classList.remove('dragover');
    var files = Array.from(e.dataTransfer.files);
    if (files.length > 0) callback(files);
  });
}

/* ============ FILE HANDLERS ============ */
function onManualMp3(f) {
  APP.manualMp3 = f;
  markDz('dz-manual-mp3', f.name);
  setInfo('info-manual-mp3', '✅ ' + f.name + ' (' + fmtSize(f.size) + ')');
  checkManualReady();
}
function onManualTxt(f) {
  APP.manualTxt = f;
  markDz('dz-manual-txt', f.name);
  setInfo('info-manual-txt', '✅ ' + f.name);
  checkManualReady();
}
function onManualImgs(files) {
  var imgs = {};
  var valid = 0;
  files.forEach(function (f) {
    // Chấp nhận bất kỳ tên nào có số timestamp, hoặc tên scene_XXXXX.XXXs
    imgs[f.name] = f;
    valid++;
  });
  APP.manualImgs = imgs;
  var dz = document.getElementById('dz-manual-imgs');
  dz.classList.add('has-file');
  dz.querySelector('.drop-title').textContent = valid + ' ảnh đã chọn';
  setInfo('info-manual-imgs', '✅ ' + valid + ' file ảnh');
  checkManualReady();
}
function onAutoMp3(f) {
  APP.autoMp3 = f;
  markDz('dz-auto-mp3', f.name);
  setInfo('info-auto-mp3', '✅ ' + f.name + ' (' + fmtSize(f.size) + ')');
  checkAutoReady();
}
function onAutoTxt(f) {
  APP.autoTxt = f;
  markDz('dz-auto-txt', f.name);
  setInfo('info-auto-txt', '✅ ' + f.name);
  checkAutoReady();
}

function markDz(id, name) {
  var dz = document.getElementById(id);
  dz.classList.add('has-file');
  dz.querySelector('.drop-title').textContent = name;
}
function setInfo(id, txt) {
  document.getElementById(id).textContent = txt;
}
function checkManualReady() {
  var ok = APP.manualMp3 && APP.manualTxt && Object.keys(APP.manualImgs).length > 0;
  document.getElementById('btn-manual').disabled = !ok;
}
function checkAutoReady() {
  var ok = APP.autoMp3 && APP.autoTxt;
  document.getElementById('btn-auto').disabled = !ok;
}

/* ============ RESET ============ */
function resetManual() {
  APP.manualMp3 = null; APP.manualTxt = null; APP.manualImgs = {};
  ['dz-manual-mp3','dz-manual-txt','dz-manual-imgs'].forEach(function(id){
    var dz = document.getElementById(id);
    dz.classList.remove('has-file','dragover');
  });
  document.getElementById('dz-manual-mp3').querySelector('.drop-title').textContent = 'Kéo thả hoặc click';
  document.getElementById('dz-manual-txt').querySelector('.drop-title').textContent = 'Kéo thả hoặc click';
  document.getElementById('dz-manual-imgs').querySelector('.drop-title').textContent = 'Kéo thả nhiều ảnh';
  ['info-manual-mp3','info-manual-txt','info-manual-imgs'].forEach(function(id){
    document.getElementById(id).textContent = '';
  });
  document.getElementById('btn-manual').disabled = true;
  resetResults();
}
function resetAuto() {
  APP.autoMp3 = null; APP.autoTxt = null;
  ['dz-auto-mp3','dz-auto-txt'].forEach(function(id){
    var dz = document.getElementById(id);
    dz.classList.remove('has-file','dragover');
    dz.querySelector('.drop-title').textContent = 'Kéo thả hoặc click';
  });
  ['info-auto-mp3','info-auto-txt'].forEach(function(id){
    document.getElementById(id).textContent = '';
  });
  document.getElementById('btn-auto').disabled = true;
  resetResults();
}
function resetResults() {
  APP.scenes = []; APP.segments = []; APP.activeSegIdx = -1;
  APP.reRenderOverrides = {};
  document.getElementById('progress-card').style.display = 'none';
  document.getElementById('segments-area').style.display = 'none';
  document.getElementById('player-card').style.display = 'none';
  document.getElementById('empty-state').style.display = 'flex';
  document.getElementById('segments-grid').innerHTML = '';
}

/* ============ FFMPEG INIT ============ */
async function getFF() {
  if (APP.ff && APP.ffLoaded) return APP.ff;
  var ff = FFmpeg.createFFmpeg({
    corePath: 'https://cdnjs.cloudflare.com/ajax/libs/ffmpeg-core/0.11.0/ffmpeg-core.js',
    log: false,
    logger: function (o) {
      if (o.type === 'fferr' && o.message && o.message.trim()) {
        // Chỉ log lỗi quan trọng
        if (/error|Error|failed|Failed/i.test(o.message)) {
          console.warn('[FFERR]', o.message);
        }
      }
    }
  });
  await ff.load();
  APP.ff = ff;
  APP.ffLoaded = true;
  return ff;
}

/* ============ PARSE TXT ============ */
function parseTxtScenes(txt) {
  var scenes = [];
  var lines = txt.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    // Tìm [FILE: scene_XXXXX.XXXs.jpg]
    var fileMatch = line.match(/\[FILE:\s*(scene_[\d.]+s\.(?:jpg|jpeg|png|webp))\s*\]/i);
    if (!fileMatch) continue;

    var fileName = fileMatch[1];

    // Lấy startTime từ tên file
    var timeMatch = fileName.match(/scene_([\d.]+)s\./i);
    var startTime = timeMatch ? parseFloat(timeMatch[1]) : null;

    // Fallback: tìm startTime trong dòng chứa [FILE]
    if (startTime === null) {
      var stm = line.match(/startTime:\s*([\d.]+)s/i);
      if (stm) startTime = parseFloat(stm[1]);
    }

    // Tìm duration trên cùng dòng: → Xs →
    var duration = null;
    var dm = line.match(/→\s*([\d.]+)s\s*→/);
    if (dm) duration = parseFloat(dm[1]);

    // Nếu không có duration, tìm trong các dòng xung quanh
    if (duration === null) {
      for (var j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 2); j++) {
        var dm2 = lines[j].match(/→\s*([\d.]+)s\s*→/);
        if (dm2) { duration = parseFloat(dm2[1]); break; }
      }
    }

    if (startTime !== null) {
      scenes.push({
        fileName: fileName,
        startTime: startTime,
        duration: duration
      });
    }
  }

  // Sort theo startTime
  scenes.sort(function (a, b) { return a.startTime - b.startTime; });

  // Tính duration cho các scene thiếu
  for (var k = 0; k < scenes.length; k++) {
    if (scenes[k].duration === null || scenes[k].duration <= 0) {
      if (k + 1 < scenes.length) {
        scenes[k].duration = scenes[k + 1].startTime - scenes[k].startTime;
      } else {
        scenes[k].duration = null; // sẽ fill từ audio duration sau
      }
    }
  }

  return scenes;
}

/* ============ BUILD FFMPEG SCENE LIST (với fallback ảnh trước) ============ */
// Trả về array [{fileName, startTime, duration}] với đầy đủ mọi khoảng thời gian
// Các khoảng không có ảnh sẽ dùng lại ảnh của cảnh trước đó
function buildFullTimeline(scenes, audioDuration) {
  if (scenes.length === 0) return [];

  var timeline = [];
  var lastFile = scenes[0].fileName;

  for (var i = 0; i < scenes.length; i++) {
    var sc = scenes[i];
    var nextStart = (i + 1 < scenes.length) ? scenes[i + 1].startTime : audioDuration;
    var dur = nextStart - sc.startTime;
    if (dur <= 0) dur = 0.1;
    timeline.push({
      fileName: sc.fileName,
      startTime: sc.startTime,
      duration: dur
    });
    lastFile = sc.fileName;
  }

  // Đảm bảo cover hết audioDuration
  var lastEnd = timeline[timeline.length - 1].startTime + timeline[timeline.length - 1].duration;
  if (lastEnd < audioDuration - 0.1) {
    timeline.push({
      fileName: lastFile,
      startTime: lastEnd,
      duration: audioDuration - lastEnd
    });
  }

  return timeline;
}

/* ============ CONVERT IMAGE → JPEG UINT8ARRAY ============ */
function imgFileToJpeg(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = 1920; canvas.height = 1080;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1920, 1080);
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scale = Math.min(1920 / iw, 1080 / ih);
      var dw = Math.round(iw * scale), dh = Math.round(ih * scale);
      var dx = Math.round((1920 - dw) / 2), dy = Math.round((1080 - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        if (!blob || blob.size < 100) { reject(new Error('toBlob thất bại: ' + file.name)); return; }
        blob.arrayBuffer().then(function (buf) {
          resolve(new Uint8Array(buf));
        }).catch(reject);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error('Không load được ảnh: ' + file.name));
    };
    img.src = url;
  });
}

/* ============ GET AUDIO DURATION ============ */
function getAudioDuration(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = function () {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được audio'));
    };
    audio.src = url;
  });
}

/* ============ LOG HELPERS ============ */
function showProgress(title) {
  document.getElementById('empty-state').style.display = 'none';
  document.getElementById('progress-card').style.display = 'block';
  document.getElementById('progress-title').textContent = title;
  document.getElementById('progress-log').innerHTML = '';
  setProgressPct(0);
}
function setProgressPct(pct) {
  document.getElementById('progress-fill').style.width = Math.min(100, pct) + '%';
}
function addLog(msg, cls) {
  var div = document.createElement('div');
  div.textContent = msg;
  if (cls) div.className = cls;
  var log = document.getElementById('progress-log');
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}
function hideProgress() {
  document.getElementById('progress-card').style.display = 'none';
}

/* ============ RENDER SEGMENT TO MP4 ============ */
// scenesInSeg: [{fileName, startTime, duration}]
// imgMap: { fileName: Uint8Array (jpeg) }
// audioFile: File (mp3)
// segStart, segEnd: giây
async function renderSegMP4(ff, scenesInSeg, imgMap, audioFile, segStart, segEnd, segLabel) {
  var segId = 'seg_' + segLabel;

  // 1. Ghi ảnh vào FS
  var writtenImgs = {};
  for (var i = 0; i < scenesInSeg.length; i++) {
    var sc = scenesInSeg[i];
    if (!writtenImgs[sc.fileName]) {
      var fname = 'img_' + Object.keys(writtenImgs).length + '_' + segId + '.jpg';
      var data = imgMap[sc.fileName];
      if (!data) throw new Error('Thiếu ảnh: ' + sc.fileName);
      ff.FS('writeFile', fname, data);
      writtenImgs[sc.fileName] = fname;
    }
  }

  // 2. Build concat.txt
  var concatLines = [];
  for (var j = 0; j < scenesInSeg.length; j++) {
    var sc2 = scenesInSeg[j];
    var imgFname = writtenImgs[sc2.fileName];
    var dur = sc2.duration;
    if (dur <= 0) dur = 0.04;
    concatLines.push("file '" + imgFname + "'");
    concatLines.push("duration " + dur.toFixed(6));
  }
  // Dòng cuối bắt buộc
  concatLines.push("file '" + writtenImgs[scenesInSeg[scenesInSeg.length - 1].fileName] + "'");
  var concatFname = 'concat_' + segId + '.txt';
  ff.FS('writeFile', concatFname, new TextEncoder().encode(concatLines.join('\n') + '\n'));

  // 3. Ghi TOÀN BỘ audio vào FS (không cắt riêng — dùng -ss -t trong render)
  var mp3Data = new Uint8Array(await audioFile.arrayBuffer());
  var mp3Fname = 'audio_' + segId + '.mp3';
  ff.FS('writeFile', mp3Fname, mp3Data);

  // 4. Render MP4 — dùng -ss -t trực tiếp trên audio input (1 lệnh duy nhất)
  var segDur = segEnd - segStart;
  var outFname = 'out_' + segId + '.mp4';

  await ff.run(
    // Video từ concat images
    '-f', 'concat', '-safe', '0', '-i', concatFname,
    // Audio với trim trực tiếp
    '-ss', segStart.toFixed(3),
    '-t',  segDur.toFixed(3),
    '-i',  mp3Fname,
    // Video codec
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-crf', '23',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
    '-r', '24',
    // Audio codec
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '44100',
    // Output
    '-shortest',
    '-movflags', '+faststart',
    '-y', outFname
  );

  // 5. Đọc output
  var outData;
  try { outData = ff.FS('readFile', outFname); } catch(e) { outData = null; }
  if (!outData || outData.length < 1000) {
    throw new Error('FFmpeg render ra file rỗng tại segment ' + segLabel);
  }

  // 6. Dọn dẹp FS
  var toDelete = [concatFname, mp3Fname, outFname];
  Object.values(writtenImgs).forEach(function(fn) { toDelete.push(fn); });
  toDelete.forEach(function(fn) { try { ff.FS('unlink', fn); } catch(e) {} });

  return outData;
}

/* ============ START MANUAL ============ */
async function startManual() {
  try {
    document.getElementById('btn-manual').disabled = true;
    showProgress('Đang khởi tạo...');
    APP.segments = [];
    APP.activeSegIdx = -1;
    document.getElementById('segments-area').style.display = 'none';
    document.getElementById('player-card').style.display = 'none';
    document.getElementById('segments-grid').innerHTML = '';

    // 1. Đọc TXT
    addLog('📄 Đọc file TXT...', 'log-ok');
    var txtContent = await APP.manualTxt.text();
    var scenes = parseTxtScenes(txtContent);
    if (scenes.length === 0) {
      throw new Error('Không tìm thấy [FILE: scene_...] trong TXT. Kiểm tra định dạng file!');
    }
    APP.scenes = scenes;
    addLog('✅ Tìm thấy ' + scenes.length + ' cảnh có ảnh', 'log-ok');
    setProgressPct(5);

    // 2. Đọc audio duration
    addLog('🎵 Đọc thời lượng audio...', '');
    var audioDuration = await getAudioDuration(APP.manualMp3);
    APP.audioDuration = audioDuration;
    addLog('✅ Audio: ' + fmtTime(audioDuration), 'log-ok');
    setProgressPct(10);

    // 3. Build full timeline
    var timeline = buildFullTimeline(scenes, audioDuration);
    addLog('📋 Timeline: ' + timeline.length + ' cảnh · ' + fmtTime(audioDuration), 'log-ok');

    // 4. Kiểm tra ảnh upload có đủ không
    var missingImgs = [];
    scenes.forEach(function (sc) {
      if (!APP.manualImgs[sc.fileName]) missingImgs.push(sc.fileName);
    });
    if (missingImgs.length > 0) {
      addLog('⚠ Thiếu ' + missingImgs.length + ' ảnh: ' + missingImgs.slice(0, 3).join(', ') + (missingImgs.length > 3 ? '...' : ''), 'log-warn');
    }

    // 5. Convert tất cả ảnh sang JPEG
    addLog('🖼 Chuyển đổi ảnh sang JPEG chuẩn...', '');
    var imgMap = {};
    var imgKeys = Object.keys(APP.manualImgs);
    for (var i = 0; i < imgKeys.length; i++) {
      var fname = imgKeys[i];
      try {
        imgMap[fname] = await imgFileToJpeg(APP.manualImgs[fname]);
      } catch (e) {
        addLog('⚠ Bỏ qua ảnh lỗi: ' + fname, 'log-warn');
      }
      setProgressPct(10 + (i / imgKeys.length) * 20);
    }
    addLog('✅ Đã xử lý ' + Object.keys(imgMap).length + ' ảnh', 'log-ok');
    setProgressPct(30);

    // 6. Load FFmpeg
    addLog('⚙ Tải FFmpeg.wasm...', '');
    setProgressPct(35);
    var ff = await getFF();
    addLog('✅ FFmpeg sẵn sàng', 'log-ok');
    setProgressPct(40);

    // 7. Chia segments (mỗi 10 phút)
    var segs = buildSegments(timeline, audioDuration, APP.segmentDuration);
    addLog('📦 Chia thành ' + segs.length + ' đoạn (mỗi 10 phút)', 'log-ok');
    APP.segments = segs.map(function(s, idx){ return Object.assign({}, s, {idx: idx, blobUrl: null, size: 0, status: 'pending'}); });

    // Hiển thị segment cards (pending)
    renderSegmentCards();
    document.getElementById('segments-area').style.display = 'block';

    // 8. Render từng segment
    for (var si = 0; si < APP.segments.length; si++) {
      var seg = APP.segments[si];
      var segLabel = 'Đoạn ' + (si + 1) + '/' + APP.segments.length;
      addLog('🎬 Render ' + segLabel + ' (' + fmtTime(seg.start) + ' → ' + fmtTime(seg.end) + ')...', '');
      setProgressPct(40 + (si / APP.segments.length) * 58);

      // Lọc timeline của đoạn này
      var segTimeline = filterTimelineForSeg(timeline, seg.start, seg.end, imgMap);

      // Giải quyết fallback ảnh cho đoạn
      var fallbackData = getFallbackImgData(imgMap, scenes, seg.start);

      // Đảm bảo mọi cảnh trong segment có ảnh
      segTimeline = segTimeline.map(function(sc){
        if (!imgMap[sc.fileName] && fallbackData) {
          return Object.assign({}, sc, {fileName: '__fallback_' + si});
        }
        return sc;
      });
      if (fallbackData) imgMap['__fallback_' + si] = fallbackData;

      try {
        var outData = await renderSegMP4(ff, segTimeline, imgMap, APP.manualMp3, seg.start, seg.end, 'm_' + si);
        var blob = new Blob([outData], { type: 'video/mp4' });
        APP.segments[si].blobUrl = URL.createObjectURL(blob);
        APP.segments[si].size = outData.length;
        APP.segments[si].status = 'ok';
        addLog('✅ ' + segLabel + ' xong (' + fmtSize(outData.length) + ')', 'log-ok');
        renderSegmentCards();
      } catch (e) {
        APP.segments[si].status = 'error';
        addLog('❌ ' + segLabel + ' lỗi: ' + e.message, 'log-err');
        renderSegmentCards();
      }
    }

    setProgressPct(100);
    addLog('🎉 Hoàn tất! ' + APP.segments.filter(function(s){return s.status==='ok';}).length + '/' + APP.segments.length + ' đoạn thành công.', 'log-ok');
    
  } catch (err) {
    addLog('❌ Lỗi: ' + err.message, 'log-err');
    console.error('[Manual] Error:', err);
  } finally {
    document.getElementById('btn-manual').disabled = false;
  }
}

/* ============ SEGMENT HELPERS ============ */
function buildSegments(timeline, audioDuration, segDur) {
  var segs = [];
  var totalSegs = Math.ceil(audioDuration / segDur);
  for (var i = 0; i < totalSegs; i++) {
    segs.push({
      start: i * segDur,
      end: Math.min((i + 1) * segDur, audioDuration)
    });
  }
  return segs;
}

function filterTimelineForSeg(timeline, segStart, segEnd, imgMap) {
  // Lấy các cảnh nằm trong [segStart, segEnd)
  var result = [];
  var lastValidFile = null;

  // Tìm ảnh fallback trước segStart
  for (var i = 0; i < timeline.length; i++) {
    if (timeline[i].startTime < segStart && imgMap[timeline[i].fileName]) {
      lastValidFile = timeline[i].fileName;
    }
  }

  for (var j = 0; j < timeline.length; j++) {
    var sc = timeline[j];
    var scEnd = sc.startTime + sc.duration;
    // Cảnh overlap với đoạn này
    if (sc.startTime < segEnd && scEnd > segStart) {
      var clampedStart = Math.max(sc.startTime, segStart);
      var clampedEnd = Math.min(scEnd, segEnd);
      var dur = clampedEnd - clampedStart;
      if (dur > 0.01) {
        var useName = imgMap[sc.fileName] ? sc.fileName : (lastValidFile || sc.fileName);
        result.push({
          fileName: useName,
          startTime: sc.startTime,
          duration: dur
        });
        if (imgMap[sc.fileName]) lastValidFile = sc.fileName;
      }
    }
  }

  // Nếu đoạn trống (không có cảnh nào), dùng ảnh cuối trước đó
  if (result.length === 0 && lastValidFile) {
    result.push({
      fileName: lastValidFile,
      startTime: segStart,
      duration: segEnd - segStart
    });
  }

  return result;
}

function getFallbackImgData(imgMap, scenes, segStart) {
  // Tìm ảnh của cảnh gần nhất trước segStart
  var sorted = scenes.slice().sort(function(a,b){ return b.startTime - a.startTime; });
  for (var i = 0; i < sorted.length; i++) {
    if (sorted[i].startTime <= segStart && imgMap[sorted[i].fileName]) {
      return imgMap[sorted[i].fileName];
    }
  }
  // Fallback: lấy ảnh đầu tiên có trong imgMap
  var keys = Object.keys(imgMap);
  return keys.length > 0 ? imgMap[keys[0]] : null;
}

/* ============ RENDER SEGMENT CARDS UI ============ */
function renderSegmentCards() {
  var grid = document.getElementById('segments-grid');
  grid.innerHTML = '';
  APP.segments.forEach(function (seg, idx) {
    var card = document.createElement('div');
    card.className = 'seg-card' + (idx === APP.activeSegIdx ? ' active' : '');
    card.onclick = function () { openSegment(idx); };

    var badgeClass = seg.status === 'ok' ? 'ok' : 'pending';
    var badgeText = seg.status === 'ok' ? '✅ Xong' : (seg.status === 'error' ? '❌ Lỗi' : '⏳ Đang xử lý');

    card.innerHTML =
      '<span class="material-icons seg-card-icon">smart_display</span>' +
      '<div class="seg-card-title">Đoạn ' + (idx + 1) + '</div>' +
      '<div class="seg-card-time">' + fmtTime(seg.start) + ' → ' + fmtTime(seg.end) + '</div>' +
      (seg.size ? '<div class="seg-card-size">' + fmtSize(seg.size) + '</div>' : '') +
      '<span class="seg-card-badge ' + badgeClass + '">' + badgeText + '</span>';

    grid.appendChild(card);
  });
}

/* ============ OPEN SEGMENT ============ */
function openSegment(idx) {
  var seg = APP.segments[idx];
  if (!seg || !seg.blobUrl) return;

  APP.activeSegIdx = idx;
  renderSegmentCards();

  var video = document.getElementById('main-video');
  video.src = seg.blobUrl;
  video.load();

  document.getElementById('player-seg-label').textContent =
    'Đoạn ' + (idx + 1) + ' · ' + fmtTime(seg.start) + ' → ' + fmtTime(seg.end);
  document.getElementById('rerender-panel').style.display = 'none';
  document.getElementById('player-card').style.display = 'block';
  document.getElementById('empty-state').style.display = 'none';
}

function closePlayer() {
  document.getElementById('player-card').style.display = 'none';
  APP.activeSegIdx = -1;
  renderSegmentCards();
}

function downloadSegment() {
  var seg = APP.segments[APP.activeSegIdx];
  if (!seg || !seg.blobUrl) return;
  var a = document.createElement('a');
  a.href = seg.blobUrl;
  a.download = 'segment_' + (APP.activeSegIdx + 1) + '_' + fmtTime(seg.start).replace(':', '-') + '.mp4';
  a.click();
}

function downloadFinal() {
  // Tải toàn bộ: nếu chỉ 1 segment, tải thẳng
  var okSegs = APP.segments.filter(function(s){ return s.status === 'ok'; });
  if (okSegs.length === 0) { alert('Chưa có đoạn nào render xong!'); return; }
  if (okSegs.length === 1) {
    var a = document.createElement('a');
    a.href = okSegs[0].blobUrl;
    a.download = 'video_full.mp4';
    a.click();
    return;
  }
  // Nhiều segment: tải từng file (browser không merge được)
  okSegs.forEach(function(seg, i){
    setTimeout(function(){
      var a = document.createElement('a');
      a.href = seg.blobUrl;
      a.download = 'segment_' + (APP.segments.indexOf(seg) + 1) + '.mp4';
      a.click();
    }, i * 500);
  });
}

/* ============ RE-RENDER SEGMENT ============ */
function reRenderSegment() {
  var idx = APP.activeSegIdx;
  if (idx < 0) return;
  var seg = APP.segments[idx];
  APP.reRenderOverrides = {};

  // Lấy danh sách ảnh của đoạn này
  var timeline = buildFullTimeline(APP.scenes, APP.audioDuration);
  var segTimeline = filterTimelineForSeg(timeline, seg.start, seg.end, {});

  // Lấy unique file names
  var seen = {};
  var items = [];
  segTimeline.forEach(function(sc){
    if (!seen[sc.fileName]) {
      seen[sc.fileName] = true;
      items.push(sc);
    }
  });

  var list = document.getElementById('rerender-img-list');
  list.innerHTML = '';
  items.forEach(function(sc){
    var file = APP.manualImgs[sc.fileName];
    var thumbSrc = file ? URL.createObjectURL(file) : '';

    var row = document.createElement('div');
    row.className = 'rerender-img-row';
    row.innerHTML =
      '<img src="' + thumbSrc + '" alt="" onerror="this.style.background=\'#333\'">' +
      '<div class="img-info">' +
        '<div class="img-name">' + sc.fileName + '</div>' +
        '<div class="img-time">⏱ ' + fmtTime(sc.startTime) + '</div>' +
      '</div>' +
      '<label>' +
        '<span class="material-icons" style="font-size:14px">swap_horiz</span>' +
        'Thay ảnh' +
        '<input type="file" accept="image/*" data-fname="' + sc.fileName + '">' +
      '</label>';

    row.querySelector('input[type=file]').addEventListener('change', function(e){
      var fname = this.getAttribute('data-fname');
      if (this.files[0]) {
        APP.reRenderOverrides[fname] = this.files[0];
        var img = row.querySelector('img');
        img.src = URL.createObjectURL(this.files[0]);
        row.querySelector('.img-name').textContent = '✅ ' + this.files[0].name;
      }
    });

    list.appendChild(row);
  });

  document.getElementById('rerender-panel').style.display = 'block';
}

async function confirmReRender() {
  var idx = APP.activeSegIdx;
  if (idx < 0) return;
  var seg = APP.segments[idx];

  try {
    document.getElementById('btn-confirm-rerender').disabled = true;
    addLog('🔄 Render lại Đoạn ' + (idx+1) + '...', 'log-warn');
    document.getElementById('progress-card').style.display = 'block';
    setProgressPct(0);

    // Áp dụng override ảnh
    Object.keys(APP.reRenderOverrides).forEach(function(fname){
      APP.manualImgs[fname] = APP.reRenderOverrides[fname];
    });

    // Re-convert ảnh bị thay
    var imgMap = {};
    var imgKeys = Object.keys(APP.manualImgs);
    for (var i = 0; i < imgKeys.length; i++) {
      var fname = imgKeys[i];
      try {
        imgMap[fname] = await imgFileToJpeg(APP.manualImgs[fname]);
      } catch(e) { /* skip */ }
      setProgressPct(i / imgKeys.length * 50);
    }

    var ff = await getFF();
    var timeline = buildFullTimeline(APP.scenes, APP.audioDuration);
    var segTimeline = filterTimelineForSeg(timeline, seg.start, seg.end, imgMap);

    setProgressPct(50);
    var outData = await renderSegMP4(ff, segTimeline, imgMap, APP.manualMp3, seg.start, seg.end, 'rerend_' + idx);
    setProgressPct(100);

    // Revoke blob cũ
    if (seg.blobUrl) URL.revokeObjectURL(seg.blobUrl);

    var blob = new Blob([outData], { type: 'video/mp4' });
    APP.segments[idx].blobUrl = URL.createObjectURL(blob);
    APP.segments[idx].size = outData.length;
    APP.segments[idx].status = 'ok';

    // Reload player
    var video = document.getElementById('main-video');
    video.src = APP.segments[idx].blobUrl;
    video.load();

    document.getElementById('rerender-panel').style.display = 'none';
    renderSegmentCards();
    addLog('✅ Render lại Đoạn ' + (idx+1) + ' thành công!', 'log-ok');
    APP.reRenderOverrides = {};

  } catch(e) {
    addLog('❌ Render lại lỗi: ' + e.message, 'log-err');
    console.error(e);
  } finally {
    document.getElementById('btn-confirm-rerender').disabled = false;
  }
}

function cancelReRender() {
  document.getElementById('rerender-panel').style.display = 'none';
  APP.reRenderOverrides = {};
}

/* ============ START AUTO (giữ nguyên logic cũ) ============ */
async function startAuto() {
  try {
    document.getElementById('btn-auto').disabled = true;
    showProgress('Đọc file...');
    APP.segments = [];

    var txtContent = await APP.autoTxt.text();
    var scenes = parseAutoScenes(txtContent);
    if (scenes.length === 0) throw new Error('Không tìm thấy [IMAGE PROMPT] trong TXT!');

    addLog('✅ ' + scenes.length + ' cảnh · Bắt đầu tạo ảnh AI...', 'log-ok');
    APP.scenes = scenes;

    var audioDuration = await getAudioDuration(APP.autoMp3);
    APP.audioDuration = audioDuration;

    // Tạo ảnh từ Pollinations
    var imgMap = {};
    for (var i = 0; i < scenes.length; i++) {
      var sc = scenes[i];
      addLog('🎨 Tạo ảnh ' + (i+1) + '/' + scenes.length + '...', '');
      setProgressPct(10 + (i / scenes.length) * 60);
      try {
        var data = await fetchPollinationImage(sc.prompt, sc.model);
        imgMap[sc.fileName || ('auto_' + i + '.jpg')] = data;
        sc.fileName = sc.fileName || ('auto_' + i + '.jpg');
        addLog('  ✅ Cảnh ' + (i+1) + ' xong', 'log-ok');
      } catch(e) {
        addLog('  ⚠ Cảnh ' + (i+1) + ' lỗi: ' + e.message, 'log-warn');
      }
      await sleep(2500);
    }

    setProgressPct(70);
    addLog('⚙ Load FFmpeg...', '');
    var ff = await getFF();

    var timeline = buildFullTimeline(scenes.filter(function(s){ return imgMap[s.fileName]; }), audioDuration);
    var segs = buildSegments(timeline, audioDuration, APP.segmentDuration);
    APP.segments = segs.map(function(s,idx){ return Object.assign({},s,{idx:idx,blobUrl:null,size:0,status:'pending'}); });
    renderSegmentCards();
    document.getElementById('segments-area').style.display = 'block';

    for (var si = 0; si < APP.segments.length; si++) {
      var seg = APP.segments[si];
      var segTimeline = filterTimelineForSeg(timeline, seg.start, seg.end, imgMap);
      setProgressPct(70 + (si / APP.segments.length) * 28);
      try {
        var outData = await renderSegMP4(ff, segTimeline, imgMap, APP.autoMp3, seg.start, seg.end, 'a_' + si);
        var blob = new Blob([outData], { type: 'video/mp4' });
        APP.segments[si].blobUrl = URL.createObjectURL(blob);
        APP.segments[si].size = outData.length;
        APP.segments[si].status = 'ok';
        addLog('✅ Đoạn ' + (si+1) + ' xong', 'log-ok');
      } catch(e) {
        APP.segments[si].status = 'error';
        addLog('❌ Đoạn ' + (si+1) + ' lỗi: ' + e.message, 'log-err');
      }
      renderSegmentCards();
    }

    setProgressPct(100);
    addLog('🎉 Hoàn tất!', 'log-ok');

  } catch(err) {
    addLog('❌ ' + err.message, 'log-err');
    console.error(err);
  } finally {
    document.getElementById('btn-auto').disabled = false;
  }
}

/* ============ PARSE AUTO SCENES (Pollinations) ============ */
function parseAutoScenes(txt) {
  var scenes = [];
  var lines = txt.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    var imgMatch = line.match(/\[IMAGE PROMPT:\s*([\s\S]*?)\]/);
    if (!imgMatch) continue;

    var prompt = imgMatch[1].trim();
    var model = 'flux';
    var modelMatch = prompt.match(/\[MODEL:([\w-]+)\]/i);
    if (modelMatch) {
      model = modelMatch[1];
      prompt = prompt.replace(/\[MODEL:[\w-]+\]/i, '').trim();
    }

    var startTime = null, duration = null;
    for (var j = Math.max(0, i-6); j <= i; j++) {
      var pl = lines[j];
      var stm = pl.match(/startTime:\s*([\d.]+)s/i);
      if (stm && startTime === null) startTime = parseFloat(stm[1]);
      var dm = pl.match(/→\s*([\d.]+)s\s*→/);
      if (dm && duration === null) duration = parseFloat(dm[1]);
    }

    var fileMatch = line.match(/\[FILE:\s*([\w.]+)\]/);
    var fileName = fileMatch ? fileMatch[1] : ('auto_scene_' + (scenes.length) + '.jpg');

    if (startTime !== null) {
      scenes.push({ prompt, model, startTime, duration, fileName });
    }
  }
  scenes.sort(function(a,b){ return a.startTime - b.startTime; });
  return scenes;
}

/* ============ POLLINATIONS ============ */
async function fetchPollinationImage(prompt, model) {
  model = model || 'flux';
  var url = 'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=1920&height=1080&enhance=true&nologo=true&model=' + encodeURIComponent(model) +
    '&seed=' + Math.floor(Math.random() * 999999);

  for (var attempt = 0; attempt < 3; attempt++) {
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ ctrl.abort(); }, 90000);
      var resp = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var blob = await resp.blob();
      return await imgFileToJpeg(blob);
    } catch(e) {
      if (attempt === 2) throw e;
      await sleep(3000);
    }
  }
}

/* ============ UTILS ============ */
function fmtTime(sec) {
  if (!sec && sec !== 0) return '?';
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }
