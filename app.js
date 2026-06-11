/* =============================================
   VIDEO MAKER — app.js (BATCH RENDERING VERSION)
   Fix: concat.txt format, FFmpeg re-use,
        segment render, re-render single segment,
        Batch Slots Queue, Auto-Download & RAM Revoke
   ============================================= */

var APP = {
  mode: 'manual',         // 'manual' | 'auto'
  ff: null,
  ffLoaded: false,

  // Batch State (Manual)
  manualSlots: [],        // Mảng chứa các job: { id, mp3, txt, imgs, isReady, status }
  slotCounter: 0,         // Để tạo ID duy nhất cho mỗi slot
  isBatchRunning: false,  // Khóa khi đang chạy chuỗi

  // Auto
  autoMp3: null,
  autoTxt: null,

  // Render state (Dùng chung cho slot đang chạy)
  scenes: [],
  audioDuration: 0,
  segmentDuration: 120,
  segments: [],
  activeSegIdx: -1,

  // Re-render
  reRenderOverrides: {},
};

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', function () {
  // Khởi tạo Tab Auto (Giữ nguyên)
  if(document.getElementById('dz-auto-mp3')) {
    setupDropZone('dz-auto-mp3', 'inp-auto-mp3', 'mp3', onAutoMp3);
    setupDropZone('dz-auto-txt', 'inp-auto-txt', 'txt', onAutoTxt);
  }
  
  // Khởi tạo Slot đầu tiên cho Tab Manual
  addManualSlot(); 
});

/* ============ TABS ============ */
function switchTab(tab) {
  APP.mode = tab;
  document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

/* ============ DROP ZONES (Cơ bản) ============ */
function setupDropZone(dzId, inputId, ext, callback) {
  var dz = document.getElementById(dzId);
  var input = document.getElementById(inputId);
  if(!dz || !input) return;

  input.addEventListener('change', function () {
    if (input.files[0]) callback(input.files[0]);
  });

  dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
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
  if(!dz || !input) return;

  input.addEventListener('change', function () {
    if (input.files.length > 0) callback(Array.from(input.files));
  });

  dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
  dz.addEventListener('drop', function (e) {
    e.preventDefault();
    dz.classList.remove('dragover');
    var files = Array.from(e.dataTransfer.files);
    if (files.length > 0) callback(files);
  });
}

/* =============================================
   HỆ THỐNG HÀNG ĐỢI SLOTS (BATCH PROCESSING)
   ============================================= */

// Thêm 1 Slot mới vào giao diện
function addManualSlot() {
  APP.slotCounter++;
  var sid = APP.slotCounter;
  
  // Tạo dữ liệu trống cho slot này
  APP.manualSlots.push({
    id: sid,
    mp3: null,
    txt: null,
    imgs: {},
    isReady: false,
    status: 'pending' // pending | processing | done | error
  });

  var container = document.getElementById('manual-slots-container');
  var html = `
    <div class="slot-card" id="slot-card-${sid}">
      <div class="slot-header">
        <span>Chương ${sid}</span>
        <button class="btn-remove-slot" onclick="removeManualSlot(${sid})" title="Xóa Chương này"><span class="material-icons">delete_outline</span></button>
      </div>
      <div class="compact-file-group">
        <div class="compact-file-row" id="dz-mp3-${sid}" onclick="document.getElementById('inp-mp3-${sid}').click()">
          <span class="material-icons file-icon" style="color: var(--accent2);">audio_file</span>
          <div class="file-name" id="info-mp3-${sid}">1. Chọn Audio (.mp3)</div>
          <span class="material-icons file-action">add_circle_outline</span>
          <input type="file" id="inp-mp3-${sid}" accept=".mp3" hidden/>
        </div>
        <div class="compact-file-row" id="dz-txt-${sid}" onclick="document.getElementById('inp-txt-${sid}').click()">
          <span class="material-icons file-icon" style="color: var(--success);">text_snippet</span>
          <div class="file-name" id="info-txt-${sid}">2. Chọn Script (.txt)</div>
          <span class="material-icons file-action">add_circle_outline</span>
          <input type="file" id="inp-txt-${sid}" accept=".txt" hidden/>
        </div>
        <div class="compact-file-row" id="dz-imgs-${sid}" onclick="document.getElementById('inp-imgs-${sid}').click()">
          <span class="material-icons file-icon" style="color: var(--warning);">photo_library</span>
          <div class="file-name" id="info-imgs-${sid}">3. Chọn Ảnh (scene_...)</div>
          <span class="material-icons file-action">add_circle_outline</span>
          <input type="file" id="inp-imgs-${sid}" accept="image/*" multiple hidden/>
        </div>
      </div>
    </div>
  `;
  
  // Dùng insertAdjacentHTML để không làm mất event listener của các slot cũ
  container.insertAdjacentHTML('beforeend', html);
  
  // Gắn sự kiện (Event) cho các vùng Drop của Slot mới này
  setupDropZone(`dz-mp3-${sid}`, `inp-mp3-${sid}`, 'mp3', function(f) { onSlotMp3(sid, f); });
  setupDropZone(`dz-txt-${sid}`, `inp-txt-${sid}`, 'txt', function(f) { onSlotTxt(sid, f); });
  setupDropZoneMulti(`dz-imgs-${sid}`, `inp-imgs-${sid}`, function(files) { onSlotImgs(sid, files); });

  checkBatchReady();
}

function removeManualSlot(sid) {
  if (APP.isBatchRunning) { alert('Không thể xóa khi đang Render!'); return; }
  var card = document.getElementById(`slot-card-${sid}`);
  if (card) card.remove();
  APP.manualSlots = APP.manualSlots.filter(function(s) { return s.id !== sid; });
  checkBatchReady();
}

/* ============ SLOT FILE HANDLERS ============ */
function onSlotMp3(sid, f) {
  var slot = APP.manualSlots.find(function(s) { return s.id === sid; });
  if(!slot) return;
  slot.mp3 = f;
  markDz(`dz-mp3-${sid}`, f.name);
  validateSlot(slot);
}
function onSlotTxt(sid, f) {
  var slot = APP.manualSlots.find(function(s) { return s.id === sid; });
  if(!slot) return;
  slot.txt = f;
  markDz(`dz-txt-${sid}`, f.name);
  validateSlot(slot);
}
function onSlotImgs(sid, files) {
  var slot = APP.manualSlots.find(function(s) { return s.id === sid; });
  if(!slot) return;
  var imgs = {};
  var valid = 0;
  files.forEach(function (f) { imgs[f.name] = f; valid++; });
  slot.imgs = imgs;
  markDz(`dz-imgs-${sid}`, valid + ' ảnh đã chọn');
  validateSlot(slot);
}

function validateSlot(slot) {
  slot.isReady = slot.mp3 && slot.txt && Object.keys(slot.imgs).length > 0;
  checkBatchReady();
}

function checkBatchReady() {
  // Bật nút Ghép Hàng Loạt nếu có ÍT NHẤT 1 slot đã sẵn sàng
  var hasReady = APP.manualSlots.some(function(s) { return s.isReady && s.status !== 'done'; });
  var btn = document.getElementById('btn-manual');
  if(btn) btn.disabled = !hasReady || APP.isBatchRunning;
}

// Xóa trắng toàn bộ Batch
function resetManualBatch() {
  if (APP.isBatchRunning) { alert('Phải dừng Render trước khi Xóa hết!'); return; }
  APP.manualSlots = [];
  APP.slotCounter = 0;
  document.getElementById('manual-slots-container').innerHTML = '';
  addManualSlot(); // Tạo lại 1 slot trống
  
  // Dọn RAM (nếu có dư)
  APP.segments.forEach(function(seg){ if (seg.blobUrl) URL.revokeObjectURL(seg.blobUrl); });
  APP.scenes = [];
  APP.segments = [];
  
  // Tắt màn hình progress
  if(document.getElementById('progress-card')) document.getElementById('progress-card').style.display = 'none';
  if(document.getElementById('segments-area')) document.getElementById('segments-area').style.display = 'none';
  if(document.getElementById('player-card')) document.getElementById('player-card').style.display = 'none';
  if(document.getElementById('empty-state')) document.getElementById('empty-state').style.display = 'flex';
  
  console.log('✅ Đã xóa sạch Hàng đợi.');
}

/* ============ AUTO TAB HANDLERS ============ */
function onAutoMp3(f) {
  APP.autoMp3 = f;
  markDz('dz-auto-mp3', f.name);
  checkAutoReady();
}
function onAutoTxt(f) {
  APP.autoTxt = f;
  markDz('dz-auto-txt', f.name);
  checkAutoReady();
}
function checkAutoReady() {
  var ok = APP.autoMp3 && APP.autoTxt;
  var btn = document.getElementById('btn-auto');
  if(btn) btn.disabled = !ok;
}
function resetAuto() {
  APP.autoMp3 = null; APP.autoTxt = null;
  ['dz-auto-mp3','dz-auto-txt'].forEach(function(id){
    var dz = document.getElementById(id);
    if(dz) {
      dz.classList.remove('has-file','dragover');
      dz.style.borderColor = ''; dz.style.background = '';
      var actionIcon = dz.querySelector('.file-action');
      if (actionIcon) { actionIcon.textContent = 'add_circle_outline'; actionIcon.style.color = ''; }
    }
  });
  if(document.getElementById('info-auto-mp3')) document.getElementById('info-auto-mp3').textContent = '1. Chọn Audio (.mp3)';
  if(document.getElementById('info-auto-txt')) document.getElementById('info-auto-txt').textContent = '2. Chọn Script (Có Prompt AI)';
  if(document.getElementById('inp-auto-mp3')) document.getElementById('inp-auto-mp3').value = '';
  if(document.getElementById('inp-auto-txt')) document.getElementById('inp-auto-txt').value = '';
  checkAutoReady();
  APP.segments.forEach(function(seg){ if (seg.blobUrl) URL.revokeObjectURL(seg.blobUrl); });
  if(document.getElementById('progress-card')) document.getElementById('progress-card').style.display = 'none';
  if(document.getElementById('empty-state')) document.getElementById('empty-state').style.display = 'flex';
}


/* ============ UI HELPERS ============ */
function markDz(id, name) {
  var dz = document.getElementById(id);
  if (!dz) return;
  dz.classList.add('has-file');
  var titleEl = dz.querySelector('.file-name');
  if (titleEl) titleEl.textContent = name;
  dz.style.borderColor = 'var(--success)';
  dz.style.background = 'rgba(16, 185, 129, 0.1)';
  var actionIcon = dz.querySelector('.file-action');
  if (actionIcon) {
    actionIcon.textContent = 'check_circle';
    actionIcon.style.color = 'var(--success)';
  }
}
function setInfo(id, txt) {
  var el = document.getElementById(id);
  if(el) el.textContent = txt;
}
function showProgress(title) {
  if(document.getElementById('empty-state')) document.getElementById('empty-state').style.display = 'none';
  if(document.getElementById('progress-card')) document.getElementById('progress-card').style.display = 'block';
  if(document.getElementById('progress-title')) document.getElementById('progress-title').textContent = title;
  if(document.getElementById('progress-log')) document.getElementById('progress-log').innerHTML = '';
  setProgressPct(0);
}
function setProgressPct(pct) {
  var el = document.getElementById('progress-fill');
  if(el) el.style.width = Math.min(100, pct) + '%';
}
function addLog(msg, cls) {
  var div = document.createElement('div');
  div.textContent = msg;
  if (cls) div.className = cls;
  var log = document.getElementById('progress-log');
  if(log) { log.appendChild(div); log.scrollTop = log.scrollHeight; }
}
function hideProgress() {
  if(document.getElementById('progress-card')) document.getElementById('progress-card').style.display = 'none';
}


/* =============================================
   LÕI XỬ LÝ: START BATCH MANUAL (AUTO CÀY CUỐC & FAIL-SAFE)
   ============================================= */
async function startBatchManual() {
  try {
    document.getElementById('btn-manual').disabled = true;
    var mode = await askRenderMode();
    if (mode === null) { checkBatchReady(); return; }
    APP.useKenBurns = mode;
    
    // Lấy danh sách các slot đã sẵn sàng và chưa làm xong
    var queue = APP.manualSlots.filter(function(s) { return s.isReady && s.status !== 'done'; });
    if (queue.length === 0) { alert('Không có Chương nào sẵn sàng!'); checkBatchReady(); return; }

    APP.isBatchRunning = true;
    APP.isPaused = false;
    APP.isCancelled = false;
    document.querySelectorAll('.btn-pause-render, .btn-cancel-render').forEach(function(b){ b.disabled = false; }); 
    
    var inputMin = parseFloat(document.getElementById('cfg-manual-duration').value) || 10;
    APP.segmentDuration = inputMin * 60;

    // VÒNG LẶP CHẠY TỪNG CHƯƠNG (SLOT) MỘT
    for (var q = 0; q < queue.length; q++) {
      var currentSlot = queue[q];
      var slotId = currentSlot.id;
      var slotHasError = false; // 🚩 CỜ ĐÁNH DẤU LỖI CHO CHƯƠNG NÀY
      
      // Đánh dấu UI đang chạy slot này
      var card = document.getElementById(`slot-card-${slotId}`);
      if(card) card.classList.add('processing');
      currentSlot.status = 'processing';
      
      showProgress(`Đang xử lý Chương ${slotId} (${q+1}/${queue.length})...`);
      addLog(`\n========== BẮT ĐẦU CHƯƠNG ${slotId} ==========`, 'log-warn');

      // Tẩy não biến toàn cục để không dính dữ liệu chương cũ
      APP.segments = [];
      APP.activeSegIdx = -1;
      document.getElementById('segments-area').style.display = 'none';
      document.getElementById('segments-grid').innerHTML = '';

      // 1. Đọc TXT
      var txtContent = await currentSlot.txt.text();
      var scenes = parseTxtScenes(txtContent);
      if (scenes.length === 0) throw new Error('TXT không có [FILE: scene_...]');
      APP.scenes = scenes;

      // 2. Đọc Audio
      var audioDuration = await getAudioDuration(currentSlot.mp3);
      APP.audioDuration = audioDuration;

      // 3. Timeline
      var timeline = buildFullTimeline(scenes, audioDuration);

      // 4. Convert Ảnh của SLOT NÀY sang JPEG
      var imgMap = {};
      var imgKeys = Object.keys(currentSlot.imgs);
      for (var i = 0; i < imgKeys.length; i++) {
        var fname = imgKeys[i];
        try { imgMap[fname] = await imgFileToJpeg(currentSlot.imgs[fname]); } catch(e){}
        setProgressPct(10 + (i / imgKeys.length) * 15);
      }

      // 5. Load FFmpeg mới tinh cho Chương này
      try { if (APP.ff) APP.ff.exit(); } catch(ex){}
      APP.ff = null; APP.ffLoaded = false;
      var ff = await getFF();
      
      // 6. Chia đoạn
      var segs = buildSegments(timeline, audioDuration, APP.segmentDuration);
      APP.segments = segs.map(function(s, idx){
        var segTimeline = filterTimelineForSeg(timeline, s.start, s.end, imgMap);
        var thumbUrl = null;
        if (segTimeline && segTimeline.length > 0) {
          var firstScene = segTimeline[0];
          var imgData = imgMap[firstScene.fileName];
          if (imgData) { var blob = new Blob([imgData], { type: 'image/jpeg' }); thumbUrl = URL.createObjectURL(blob); }
        }
        return Object.assign({}, s, { idx: idx, blobUrl: null, size: 0, status: 'pending', thumbUrl: thumbUrl });
      });
      renderSegmentCards();
      document.getElementById('segments-area').style.display = 'block';

      // 7. RENDER TỪNG ĐOẠN CỦA CHƯƠNG NÀY
      for (var si = 0; si < APP.segments.length; si++) {
        var seg = APP.segments[si];
        var segLabel = 'Đoạn ' + (si + 1) + '/' + APP.segments.length;
        addLog('🎬 Render ' + segLabel + '...', '');
        setProgressPct(25 + (si / APP.segments.length) * 65);

        var segTimeline = filterTimelineForSeg(timeline, seg.start, seg.end, imgMap);
        var fallbackData = getFallbackImgData(imgMap, scenes, seg.start);
        segTimeline = segTimeline.map(function(sc){
          if (!imgMap[sc.fileName] && fallbackData) return Object.assign({}, sc, {fileName: '__fb_' + si});
          return sc;
        });
        if (fallbackData) imgMap['__fb_' + si] = fallbackData;

        try {
          var outData = await renderSegMP4(ff, segTimeline, imgMap, currentSlot.mp3, seg.start, seg.end, 'm_' + slotId + '_' + si);
          var blob = new Blob([outData], { type: 'video/mp4' });
          if (APP.segments[si]) {
            APP.segments[si].blobUrl = URL.createObjectURL(blob);
            APP.segments[si].size = outData.length;
            APP.segments[si].status = 'ok';
            addLog('✅ ' + segLabel + ' xong', 'log-ok');
            renderSegmentCards();
          }
        } catch (e) {
          // 🚨 BẮT LỖI VÀ KÍCH HOẠT QUY TRÌNH "FAIL-SAFE"
          if (APP.segments[si]) {
            APP.segments[si].status = 'error';
            addLog('❌ ' + segLabel + ' LỖI: ' + e.message, 'log-err');
            renderSegmentCards();
          }
          slotHasError = true; // Bật cờ lỗi cho Chương này
          break; // THOÁT NGAY VÒNG LẶP ĐOẠN (Không thèm chạy các đoạn sau nữa)
        }

        // Tẩy não FFmpeg sau mỗi đoạn (Nếu không lỗi)
        try { ff.exit(); } catch(ex) {}
        APP.ff = null; APP.ffLoaded = false;
        ff = await getFF(); 
      } // KẾT THÚC CHƯƠNG HIỆN TẠI

      // ==========================================
      // XỬ LÝ KẾT QUẢ CỦA CHƯƠNG
      // ==========================================
      if (slotHasError) {
         // KỊCH BẢN 1: BỊ LỖI -> BỎ QUA NỐI FILE, BÁO ĐỎ
         addLog(`🚨 HỦY BỎ CHƯƠNG ${slotId} do có sự cố. Hệ thống sẽ dọn RAM và chạy tiếp Chương sau...`, 'log-err');
         currentSlot.status = 'error';
         if(card) {
           card.classList.remove('processing');
           card.style.borderColor = 'var(--error)';
           card.querySelector('.slot-header span').textContent += ' (Bị Lỗi)';
           card.querySelector('.slot-header span').style.color = 'var(--error)';
         }
      } else {
         // KỊCH BẢN 2: THÀNH CÔNG -> NỐI FILE (MERGE) VÀ TẢI XUỐNG
         setProgressPct(95);
         addLog(`🎬 Đang nối các đoạn thành 1 file MP4 duy nhất cho Chương ${slotId}...`, 'log-warn');
         try {
           var okSegs = APP.segments.filter(function(s) { return s.status === 'ok'; });
           if (okSegs.length === 1) {
             var a = document.createElement('a'); a.href = okSegs[0].blobUrl; a.download = `Chuong_${slotId}_Full.mp4`; a.click();
           } else if (okSegs.length > 1) {
             var listTxt = '';
             var ffMerge = await getFF(); 
             for (var k = 0; k < okSegs.length; k++) {
               var segBlob = await fetch(okSegs[k].blobUrl).then(r => r.blob());
               var segData = new Uint8Array(await segBlob.arrayBuffer());
               var partName = `part_${k}.mp4`;
               ffMerge.FS('writeFile', partName, segData);
               listTxt += `file '${partName}'\n`;
             }
             ffMerge.FS('writeFile', 'merge_list.txt', new TextEncoder().encode(listTxt));
             await ffMerge.run('-f', 'concat', '-safe', '0', '-i', 'merge_list.txt', '-c', 'copy', 'final_merge.mp4');
             var finalData = ffMerge.FS('readFile', 'final_merge.mp4');
             var finalUrl = URL.createObjectURL(new Blob([finalData], { type: 'video/mp4' }));
             
             addLog(`💾 Tải MP4 Chương ${slotId} hoàn chỉnh xuống máy...`, 'log-ok');
             var a = document.createElement('a'); a.href = finalUrl; a.download = `Chuong_${slotId}_Full.mp4`; a.click();
             
             setTimeout(() => URL.revokeObjectURL(finalUrl), 5000); // Tải xong tự xóa URL sau 5s
           }
         } catch (err) {
           addLog(`❌ Lỗi khi nối file Chương ${slotId}: ` + err.message, 'log-err');
         }

         currentSlot.status = 'done';
         if(card) {
           card.classList.remove('processing');
           card.classList.add('done');
           card.querySelector('.slot-header span').textContent += ' (Hoàn tất)';
         }
      }

      // 🧹 LUÔN DỌN DẸP RAM DÙ THÀNH CÔNG HAY THẤT BẠI
      await sleep(3000); 
      APP.segments.forEach(function(seg){ if (seg.blobUrl) URL.revokeObjectURL(seg.blobUrl); });
      imgMap = {}; // Xóa sạch mảng ảnh trong RAM
      addLog(`♻ Đã dọn dẹp RAM Chương ${slotId}.`, 'log-ok');
      await sleep(1500); // Nghỉ 1.5 giây cho máy nguội trước khi cày Chương mới
      
    } // Đâm vòng lặp sang Chương tiếp theo (Slot 2, 3...)

    setProgressPct(100);
    document.getElementById('progress-title').textContent = '✅ Đã hoàn thành tiến trình Auto!';
    setTimeout(function(){ hideProgress(); }, 5000);
    
  } catch (err) {
    if (err.message === "USER_CANCELLED") {
      addLog('🛑 Đã Hủy tiến trình!', 'log-err');
      document.getElementById('progress-title').textContent = 'Đã hủy!';
    } else {
      addLog('❌ Lỗi: ' + err.message, 'log-err');
    }
  } finally {
    APP.isBatchRunning = false;
    checkBatchReady();
  }
}
/* ============ CÁC HÀM CŨ ĐƯỢC GIỮ NGUYÊN (FFMPEG, PARSE TXT, RENDER SEG MP4...) ============ */
// Từ đây trở xuống tôi copy y nguyên ruột các hàm phụ trợ của bạn để đảm bảo không sai lệch.

async function getFF() {
  if (APP.ff && APP.ffLoaded) return APP.ff;
  var ff = FFmpeg.createFFmpeg({
    corePath: 'https://cdnjs.cloudflare.com/ajax/libs/ffmpeg-core/0.11.0/ffmpeg-core.js',
    log: false,
    logger: function (o) {
      if (o.type === 'fferr' && o.message && o.message.trim()) {
        if (/error|Error|failed|Failed/i.test(o.message)) console.warn('[FFERR]', o.message);
      }
    }
  });
  await ff.load();
  APP.ff = ff;
  APP.ffLoaded = true;
  return ff;
}

function parseTxtScenes(txt) {
  var scenes = [];
  var lines = txt.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var fileMatch = line.match(/\[FILE:\s*(scene_[\d.]+s\.(?:jpg|jpeg|png|webp))\s*\]/i);
    if (!fileMatch) continue;
    var fileName = fileMatch[1];
    var timeMatch = fileName.match(/scene_([\d.]+)s\./i);
    var startTime = timeMatch ? parseFloat(timeMatch[1]) : null;
    if (startTime === null) {
      var stm = line.match(/startTime:\s*([\d.]+)s/i);
      if (stm) startTime = parseFloat(stm[1]);
    }
    var duration = null;
    var dm = line.match(/→\s*([\d.]+)s\s*→/);
    if (dm) duration = parseFloat(dm[1]);
    if (duration === null) {
      for (var j = Math.max(0, i - 4); j <= Math.min(lines.length - 1, i + 2); j++) {
        var dm2 = lines[j].match(/→\s*([\d.]+)s\s*→/);
        if (dm2) { duration = parseFloat(dm2[1]); break; }
      }
    }
    if (startTime !== null) scenes.push({ fileName: fileName, startTime: startTime, duration: duration });
  }
  scenes.sort(function (a, b) { return a.startTime - b.startTime; });
  for (var k = 0; k < scenes.length; k++) {
    if (scenes[k].duration === null || scenes[k].duration <= 0) {
      if (k + 1 < scenes.length) scenes[k].duration = scenes[k + 1].startTime - scenes[k].startTime;
      else scenes[k].duration = null;
    }
  }
  return scenes;
}

function buildFullTimeline(scenes, audioDuration) {
  if (scenes.length === 0) return [];
  var timeline = [];
  var lastFile = scenes[0].fileName;
  for (var i = 0; i < scenes.length; i++) {
    var sc = scenes[i];
    var nextStart = (i + 1 < scenes.length) ? scenes[i + 1].startTime : audioDuration;
    var dur = nextStart - sc.startTime;
    if (dur <= 0) dur = 0.1;
    timeline.push({ fileName: sc.fileName, startTime: sc.startTime, duration: dur });
    lastFile = sc.fileName;
  }
  var lastEnd = timeline[timeline.length - 1].startTime + timeline[timeline.length - 1].duration;
  if (lastEnd < audioDuration - 0.1) timeline.push({ fileName: lastFile, startTime: lastEnd, duration: audioDuration - lastEnd });
  return timeline;
}

function imgFileToJpeg(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = 1920; canvas.height = 1080;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 1920, 1080);
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scale = Math.min(1920 / iw, 1080 / ih);
      var dw = Math.round(iw * scale), dh = Math.round(ih * scale);
      var dx = Math.round((1920 - dw) / 2), dy = Math.round((1080 - dh) / 2);
      ctx.drawImage(img, dx, dy, dw, dh);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        if (!blob || blob.size < 100) { reject(new Error('toBlob thất bại')); return; }
        blob.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); }).catch(reject);
      }, 'image/jpeg', 0.92);
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Lỗi ảnh')); };
    img.src = url;
  });
}

function getAudioDuration(file) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(file);
    var audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = function () { URL.revokeObjectURL(url); resolve(audio.duration); };
    audio.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Lỗi audio')); };
    audio.src = url;
  });
}

async function renderSegMP4(ff, scenesInSeg, imgMap, audioFile, segStart, segEnd, segLabel) {
  var segId = 'seg_' + segLabel;
  var FPS = 24;

  // NHÁNH 1: RENDER BASIC TĨNH (GIỮ NGUYÊN)
  if (!APP.useKenBurns) {
    var concatLines = []; var frameFiles = [];
    for (var i = 0; i < scenesInSeg.length; i++) {
      var sc = scenesInSeg[i]; var fname = 'basic_' + segId + '_' + i + '.jpg';
      ff.FS('writeFile', fname, imgMap[sc.fileName]);
      if (!frameFiles.includes(fname)) frameFiles.push(fname);
      concatLines.push("file '" + fname + "'"); concatLines.push("duration " + sc.duration.toFixed(6));
    }
    concatLines.push("file '" + frameFiles[frameFiles.length - 1] + "'");
    var concatFname = 'concat_basic_' + segId + '.txt';
    ff.FS('writeFile', concatFname, new TextEncoder().encode(concatLines.join('\n') + '\n'));
    var mp3Data = new Uint8Array(await audioFile.arrayBuffer());
    var mp3Fname = 'audio_basic_' + segId + '.mp3';
    ff.FS('writeFile', mp3Fname, mp3Data);
    var outFname = 'out_basic_' + segId + '.mp4';
    await ff.run('-f', 'concat', '-safe', '0', '-i', concatFname, '-ss', segStart.toFixed(3), '-t', (segEnd - segStart).toFixed(3), '-i', mp3Fname, '-c:v', 'libx264', '-crf', '23', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', '-movflags', '+faststart', '-y', outFname);
    var outData; try { outData = ff.FS('readFile', outFname); } catch(e) { outData = null; }
    frameFiles.forEach(function(f) { try { ff.FS('unlink', f); } catch(e){} });
    try { ff.FS('unlink', concatFname); } catch(e){} try { ff.FS('unlink', mp3Fname); } catch(e){} try { ff.FS('unlink', outFname); } catch(e){}
    if (!outData || outData.length < 1000) throw new Error('Render rỗng');
    return outData;
  }

  // NHÁNH 2: RENDER KEN BURNS (ĐÃ NÂNG CẤP 8 HIỆU ỨNG & CROSSFADE)
  var TRANSITION_FRAMES = 24; 
  var KEYFRAME_INTERVAL = 1 / FPS; 
  var sceneMp4Files = [];
  
  // Biến tạm lưu dữ liệu cảnh trước để làm Crossfade
  var prevImgObj = null;
  var prevEffectIdx = 0;
  var prevTotalFrames = 0;

  for (var i = 0; i < scenesInSeg.length; i++) {
    var sc = scenesInSeg[i]; 
    var jpegData = imgMap[sc.fileName];
    if (!jpegData) throw new Error('Thiếu ảnh');
    var totalFrames = Math.max(2, Math.round(sc.duration * FPS));
    
    // 🌟 MỞ RỘNG THÀNH 8 HIỆU ỨNG
    var effect = i % 8;
    
    var url = URL.createObjectURL(new Blob([jpegData], {type:'image/jpeg'}));
    var img = await new Promise(function(resolve, reject) { var i_obj = new Image(); i_obj.onload = function() { resolve(i_obj); }; i_obj.onerror = reject; i_obj.src = url; });
    URL.revokeObjectURL(url);
    
    var canvas = document.createElement('canvas'); canvas.width = 1920; canvas.height = 1080;
    var ctx = canvas.getContext('2d'); 
    var frameFiles = []; var concatLines = [];

    // HÀM VẼ 1 FRAME (Tính toán tọa độ cho 8 góc)
    function drawKenBurnsFrame(targetCtx, imgObj, fx, fIdx, maxFrames) {
      var t = maxFrames <= 1 ? 0 : fIdx / (maxFrames - 1);
      var easeT = -(Math.cos(Math.PI * t) - 1) / 2;
      var iw = imgObj.naturalWidth, ih = imgObj.naturalHeight;
      var baseScale = Math.max(1920/iw, 1080/ih);
      var scale, ox, oy;

      if (fx === 0) { // 1. Zoom In
        scale = baseScale * (1.00 + 0.12 * easeT); ox = (1920 - iw * scale) / 2; oy = (1080 - ih * scale) / 2; 
      } else if (fx === 1) { // 2. Zoom Out
        scale = baseScale * (1.12 - 0.12 * easeT); ox = (1920 - iw * scale) / 2; oy = (1080 - ih * scale) / 2; 
      } else if (fx === 2) { // 3. Pan Right
        scale = baseScale * 1.08; var mp = Math.max(0, (iw * scale - 1920) / 2); ox = (1920 - iw * scale) / 2 - mp * (easeT * 2 - 1); oy = (1080 - ih * scale) / 2; 
      } else if (fx === 3) { // 4. Pan Left
        scale = baseScale * 1.08; var mp2 = Math.max(0, (iw * scale - 1920) / 2); ox = (1920 - iw * scale) / 2 + mp2 * (easeT * 2 - 1); oy = (1080 - ih * scale) / 2; 
      } else if (fx === 4) { // 5. Pan Down
        scale = baseScale * 1.08; var mp3 = Math.max(0, (ih * scale - 1080) / 2); ox = (1920 - iw * scale) / 2; oy = (1080 - ih * scale) / 2 - mp3 * (easeT * 2 - 1);
      } else if (fx === 5) { // 6. Pan Up
        scale = baseScale * 1.08; var mp4 = Math.max(0, (ih * scale - 1080) / 2); ox = (1920 - iw * scale) / 2; oy = (1080 - ih * scale) / 2 + mp4 * (easeT * 2 - 1);
      } else if (fx === 6) { // 7. Zoom Top-Left
        scale = baseScale * (1.00 + 0.12 * easeT); ox = - (iw * scale - 1920) * (1 - easeT) * 0.2; oy = - (ih * scale - 1080) * (1 - easeT) * 0.2;
      } else { // 8. Zoom Bottom-Right
        scale = baseScale * (1.00 + 0.12 * easeT); ox = (1920 - iw * scale) + (iw * scale - 1920) * (1 - easeT) * 0.2; oy = (1080 - ih * scale) + (ih * scale - 1080) * (1 - easeT) * 0.2;
      }
      targetCtx.drawImage(imgObj, ox, oy, iw * scale, ih * scale);
    }

    for (var fi = 0; fi < totalFrames; fi++) {
      ctx.clearRect(0, 0, 1920, 1080);
      ctx.fillStyle = '#000'; 
      ctx.fillRect(0, 0, 1920, 1080);

      // 🌟 THỰC HIỆN CROSSFADE (CHỒNG MỜ)
      if (i > 0 && fi < TRANSITION_FRAMES && prevImgObj) {
        // Vẽ ảnh cũ nằm dưới (Opacity 100%)
        ctx.globalAlpha = 1.0;
        var virtualFrameIdx = prevTotalFrames - TRANSITION_FRAMES + fi;
        drawKenBurnsFrame(ctx, prevImgObj, prevEffectIdx, virtualFrameIdx, prevTotalFrames);

        // Vẽ ảnh mới đè lên trên với Opacity tăng dần từ 0 -> 100%
        var alpha = fi / TRANSITION_FRAMES;
        ctx.globalAlpha = alpha;
        drawKenBurnsFrame(ctx, img, effect, fi, totalFrames);
        ctx.globalAlpha = 1.0; // Trả lại chuẩn
      } else {
        // Vẽ bình thường nếu không nằm trong vùng chuyển cảnh
        ctx.globalAlpha = 1.0;
        drawKenBurnsFrame(ctx, img, effect, fi, totalFrames);
      }

      var dataUrl = canvas.toDataURL('image/jpeg', 0.85); var binary = atob(dataUrl.split(',')[1]);
      var bytes = new Uint8Array(binary.length); for (var b = 0; b < binary.length; b++) bytes[b] = binary.charCodeAt(b);
      var fname = 'f_' + segId + '_' + i + '_' + fi + '.jpg';
      ff.FS('writeFile', fname, bytes); frameFiles.push(fname);
      concatLines.push("file '" + fname + "'"); concatLines.push("duration " + KEYFRAME_INTERVAL.toFixed(6));
      if (fi % 5 === 0) { await new Promise(function(r){ setTimeout(r, 0); }); await checkPauseCancel(); }
    }
    
    // Lưu lại ảnh này để làm nền cho cảnh sau
    prevImgObj = img;
    prevEffectIdx = effect;
    prevTotalFrames = totalFrames;

    concatLines.push("file '" + frameFiles[frameFiles.length - 1] + "'");
    var concatFname = 'concat_' + segId + '_' + i + '.txt';
    ff.FS('writeFile', concatFname, new TextEncoder().encode(concatLines.join('\n') + '\n'));
    var sceneOutFname = 'scene_' + segId + '_' + i + '.mp4';
    await ff.run('-f', 'concat', '-safe', '0', '-i', concatFname, '-c:v', 'libx264', '-crf', '23', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-y', sceneOutFname);
    sceneMp4Files.push(sceneOutFname);
    frameFiles.forEach(function(f) { try { ff.FS('unlink', f); } catch(e){} });
    try { ff.FS('unlink', concatFname); } catch(e){}
  }
  
  var videoConcatFname = 'video_list_' + segId + '.txt';
  ff.FS('writeFile', videoConcatFname, new TextEncoder().encode(sceneMp4Files.map(function(f){ return "file '" + f + "'"; }).join('\n')));
  var mp3Data = new Uint8Array(await audioFile.arrayBuffer()); var mp3Fname = 'audio_' + segId + '.mp3';
  ff.FS('writeFile', mp3Fname, mp3Data);
  var outFname = 'out_' + segId + '.mp4';
  await ff.run('-f', 'concat', '-safe', '0', '-i', videoConcatFname, '-ss', segStart.toFixed(3), '-t', (segEnd - segStart).toFixed(3), '-i', mp3Fname, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', '-movflags', '+faststart', '-y', outFname);
  var outData; try { outData = ff.FS('readFile', outFname); } catch(e) { outData = null; }
  sceneMp4Files.forEach(function(f) { try { ff.FS('unlink', f); } catch(e){} });
  try { ff.FS('unlink', videoConcatFname); } catch(e){} try { ff.FS('unlink', mp3Fname); } catch(e){} try { ff.FS('unlink', outFname); } catch(e){}
  if (!outData || outData.length < 1000) throw new Error('Render rỗng');
  return outData;
}

function buildSegments(timeline, audioDuration, segDur) {
  var segs = []; var totalSegs = Math.ceil(audioDuration / segDur);
  for (var i = 0; i < totalSegs; i++) segs.push({ start: i * segDur, end: Math.min((i + 1) * segDur, audioDuration) });
  return segs;
}

function filterTimelineForSeg(timeline, segStart, segEnd, imgMap) {
  var result = []; var lastValidFile = null;
  for (var i = 0; i < timeline.length; i++) if (timeline[i].startTime < segStart && imgMap[timeline[i].fileName]) lastValidFile = timeline[i].fileName;
  for (var j = 0; j < timeline.length; j++) {
    var sc = timeline[j]; var scEnd = sc.startTime + sc.duration;
    if (sc.startTime < segEnd && scEnd > segStart) {
      var clampedStart = Math.max(sc.startTime, segStart); var clampedEnd = Math.min(scEnd, segEnd); var dur = clampedEnd - clampedStart;
      if (dur > 0.01) {
        var useName = imgMap[sc.fileName] ? sc.fileName : (lastValidFile || sc.fileName);
        result.push({ fileName: useName, startTime: sc.startTime, duration: dur });
        if (imgMap[sc.fileName]) lastValidFile = sc.fileName;
      }
    }
  }
  if (result.length === 0 && lastValidFile) result.push({ fileName: lastValidFile, startTime: segStart, duration: segEnd - segStart });
  return result;
}

function getFallbackImgData(imgMap, scenes, segStart) {
  var sorted = scenes.slice().sort(function(a,b){ return b.startTime - a.startTime; });
  for (var i = 0; i < sorted.length; i++) if (sorted[i].startTime <= segStart && imgMap[sorted[i].fileName]) return imgMap[sorted[i].fileName];
  var keys = Object.keys(imgMap); return keys.length > 0 ? imgMap[keys[0]] : null;
}

function renderSegmentCards() {
  var grid = document.getElementById('segments-grid'); if (!grid) return; var html = '';
  APP.segments.forEach(function(seg) {
    var label = 'Đoạn ' + (seg.idx + 1); var timeStr = fmtTime(seg.start) + ' → ' + fmtTime(seg.end); var sizeStr = seg.size > 0 ? fmtSize(seg.size) : '';
    var badgeClass = 'badge-pending'; var badgeText = 'Chờ xử lý';
    if (seg.status === 'ok') { badgeClass = 'badge-ok'; badgeText = 'Xong'; }
    else if (seg.status === 'error') { badgeClass = 'badge-err'; badgeText = 'Lỗi'; }
    else if (seg.status === 'processing') { badgeClass = 'badge-proc'; badgeText = 'Đang xử lý'; }
    var cardStyle = seg.thumbUrl ? 'style="background: linear-gradient(rgba(23, 23, 33, 0.75), rgba(15, 15, 22, 0.93)), url(' + seg.thumbUrl + ') center/cover no-repeat;"' : '';
    html += '<div class="segment-card ' + seg.status + '" ' + cardStyle + ' onclick="openSegment(' + seg.idx + ')"><span class="material-icons card-icon">play_arrow</span><div class="card-title" style="font-weight: 700; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">' + label + '</div><div class="card-time" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">' + timeStr + '</div>';
    if (sizeStr) html += '<div class="card-size" style="font-size: 11px; color: var(--text3); margin-top: 2px;">' + sizeStr + '</div>';
    html += '<div class="card-status ' + badgeClass + '">' + badgeText + '</div></div>';
  });
  grid.innerHTML = html;
}

function openSegment(idx) {
  var seg = APP.segments[idx]; if (!seg || !seg.blobUrl) return; APP.activeSegIdx = idx; renderSegmentCards();
  var video = document.getElementById('main-video'); video.src = seg.blobUrl; video.load();
  document.getElementById('player-seg-label').textContent = 'Đoạn ' + (idx + 1) + ' · ' + fmtTime(seg.start) + ' → ' + fmtTime(seg.end);
  document.getElementById('rerender-panel').style.display = 'none'; document.getElementById('player-card').style.display = 'block'; document.getElementById('empty-state').style.display = 'none';
}
function closePlayer() { document.getElementById('player-card').style.display = 'none'; APP.activeSegIdx = -1; renderSegmentCards(); }

// 🌟 NÂNG CẤP: Nhận slotId để tải tên file đẹp hơn (VD: chuong_1_full.mp4)
function downloadFinal(slotId) {
  var okSegs = APP.segments.filter(function(s){ return s.status === 'ok'; });
  if (okSegs.length === 0) return;
  var prefix = slotId ? ('Chuong_' + slotId) : 'Video';
  if (okSegs.length === 1) {
    var a = document.createElement('a'); a.href = okSegs[0].blobUrl; a.download = prefix + '_full.mp4'; a.click(); return;
  }
  okSegs.forEach(function(seg, i){
    setTimeout(function(){
      var a = document.createElement('a'); a.href = seg.blobUrl; a.download = prefix + '_Phan_' + (APP.segments.indexOf(seg) + 1) + '.mp4'; a.click();
    }, i * 500);
  });
}

// Các hàm Re-render, Parse Auto, Utils và Popup giữ nguyên không đổi
function fmtTime(sec) { if (!sec && sec !== 0) return '?'; var m = Math.floor(sec / 60); var s = Math.floor(sec % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
function fmtSize(bytes) { if (bytes < 1024) return bytes + ' B'; if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / 1024 / 1024).toFixed(1) + ' MB'; }
function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

function askRenderMode() {
  return new Promise(function(resolve) {
    var modal = document.getElementById('custom-confirm-modal');
    var btnOk = document.getElementById('btn-modal-ok'); var btnCancel = document.getElementById('btn-modal-cancel'); var btnClose = document.getElementById('btn-modal-close');
    modal.style.display = 'flex';
    var cleanup = function() { modal.style.display = 'none'; btnOk.removeEventListener('click', onOk); btnCancel.removeEventListener('click', onCancel); btnClose.removeEventListener('click', onClose); modal.removeEventListener('mousedown', onOutsideClick); };
    var onOk = function() { cleanup(); resolve(true); }; var onCancel = function() { cleanup(); resolve(false); }; var onClose = function() { cleanup(); resolve(null); }; var onOutsideClick = function(e) { if(e.target === modal) { cleanup(); resolve(null); } };
    btnOk.addEventListener('click', onOk); btnCancel.addEventListener('click', onCancel); btnClose.addEventListener('click', onClose); modal.addEventListener('mousedown', onOutsideClick);
  });
}
function togglePause() {
  APP.isPaused = !APP.isPaused;
  var btns = document.querySelectorAll('.btn-pause-text'); var icons = document.querySelectorAll('.btn-pause-icon');
  if (APP.isPaused) { btns.forEach(function(b){ b.textContent = 'Tiếp tục'; }); icons.forEach(function(i){ i.textContent = 'play_arrow'; }); addLog('⏸ Đã tạm dừng.', 'log-warn'); } 
  else { btns.forEach(function(b){ b.textContent = 'Tạm dừng'; }); icons.forEach(function(i){ i.textContent = 'pause'; }); addLog('▶ Đang tiếp tục xử lý...', 'log-ok'); }
}
function askCancelConfirm() {
  return new Promise(function(resolve) {
    var modal = document.getElementById('cancel-confirm-modal');
    var btnYes = document.getElementById('btn-cancel-yes'); var btnNo = document.getElementById('btn-cancel-no');
    modal.style.display = 'flex';
    var cleanup = function() { modal.style.display = 'none'; btnYes.removeEventListener('click', onYes); btnNo.removeEventListener('click', onNo); modal.removeEventListener('mousedown', onOutsideClick); };
    var onYes = function() { cleanup(); resolve(true); }; var onNo = function() { cleanup(); resolve(false); }; var onOutsideClick = function(e) { if(e.target === modal) { cleanup(); resolve(false); } };
    btnYes.addEventListener('click', onYes); btnNo.addEventListener('click', onNo); modal.addEventListener('mousedown', onOutsideClick);
  });
}
async function cancelRender() {
  var wasPaused = APP.isPaused; APP.isPaused = true; 
  var isConfirmed = await askCancelConfirm();
  if (isConfirmed) { APP.isCancelled = true; APP.isPaused = false; document.querySelectorAll('.btn-cancel-render, .btn-pause-render').forEach(function(b){ b.disabled = true; }); } 
  else { APP.isPaused = wasPaused; }
}
async function checkPauseCancel() {
  if (APP.isCancelled) throw new Error("USER_CANCELLED");
  while (APP.isPaused) { await new Promise(function(r) { setTimeout(r, 500); }); if (APP.isCancelled) throw new Error("USER_CANCELLED"); }
}

/* ==============================================================================
   TAB AUTO AI (SỬ DỤNG LẠI LOGIC CŨ KẾT HỢP FLUX SCHNELL)
   ============================================================================== */

async function startAuto() {
  try {
    document.getElementById('btn-auto').disabled = true;
    showProgress('Đang khởi tạo Tab Auto AI...');
    APP.segments = [];

    var txtContent = await APP.autoTxt.text();
    var scenes = parseAutoScenes(txtContent);
    if (scenes.length === 0) throw new Error('Không tìm thấy [IMAGE PROMPT] hợp lệ trong TXT!');

    addLog('✅ ' + scenes.length + ' cảnh · Bắt đầu tạo ảnh AI...', 'log-ok');
    APP.scenes = scenes;

    var audioDuration = await getAudioDuration(APP.autoMp3);
    APP.audioDuration = audioDuration;

    var imgMap = {};
    for (var i = 0; i < scenes.length; i++) {
      var sc = scenes[i];
      addLog('🎨 Tạo ảnh ' + (i+1) + '/' + scenes.length + '...', '');
      setProgressPct(10 + (i / scenes.length) * 60);
      
      try {
        // GỌI HÀM API THEO PHONG CÁCH APP.JS CŨ
        var data = await fetchPollinationImage(sc.prompt, sc.model);
        if (!data) throw new Error('Không thể tải ảnh sau 3 lần thử');
        
        imgMap[sc.fileName] = data;
        addLog('  ✅ Cảnh ' + (i+1) + ' xong', 'log-ok');
      } catch(e) {
        addLog('  ⚠ Cảnh ' + (i+1) + ' lỗi: ' + e.message, 'log-warn');
      }
      // Dù thành công hay thất bại cũng nên nghỉ 1 nhịp ngắn
      await sleep(1500); 
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
    addLog('🎉 Hoàn tất Tab Auto!', 'log-ok');

  } catch(err) {
    addLog('❌ ' + err.message, 'log-err');
    console.error(err);
  } finally {
    document.getElementById('btn-auto').disabled = false;
  }
}

/* ============ PARSE AUTO SCENES (Giữ nguyên thuật toán quét Dẫn Truyện) ============ */
function parseAutoScenes(txt) {
  var scenes = [];
  var lines = txt.split('\n');
  var currentStartTime = null;
  var currentDuration = null;
  
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    var timeMatch = line.match(/duration:\s*([\d.]+)s[\s\S]*startTime:\s*([\d.]+)s/i);
    var oldStartTimeMatch = line.match(/startTime:\s*([\d.]+)s/i);
    var oldDurationMatch = line.match(/→\s*([\d.]+)s\s*→/i);

    if (timeMatch) {
      currentDuration = parseFloat(timeMatch[1]); currentStartTime = parseFloat(timeMatch[2]);
    } else {
      if (oldStartTimeMatch) currentStartTime = parseFloat(oldStartTimeMatch[1]);
      if (oldDurationMatch) currentDuration = parseFloat(oldDurationMatch[1]);
    }

    var promptIdx = line.indexOf('[IMAGE PROMPT:');
    if (promptIdx !== -1) {
      var prompt = line.substring(promptIdx + 14).trim();
      if (prompt.endsWith(']')) prompt = prompt.slice(0, -1).trim();
      prompt = prompt.replace(/\[MODEL:[^\]]+\]/gi, '').trim();
      prompt = prompt.replace(/\[Người Dẫn Truyện\]:?\s*/gi, '').replace(/\[Dẫn Truyện\]:?\s*/gi, '').trim();

      if (currentStartTime !== null && prompt !== 'CHƯA TẠO' && prompt.length > 5) {
        var timeParts = currentStartTime.toFixed(3).split('.');
        var secPadded = timeParts[0].padStart(5, '0');
        var virtualFileName = 'scene_' + secPadded + '.' + (timeParts[1] || '000') + 's.jpg';
        
        // Cố định dùng model flux-schnell theo phát hiện của bạn
        scenes.push({ prompt: prompt, model: 'flux-schnell', startTime: currentStartTime, duration: currentDuration, fileName: virtualFileName });
        currentStartTime = null; currentDuration = null;
      }
    }
  }
  
  scenes.sort(function(a,b){ return a.startTime - b.startTime; });
  for (var k = 0; k < scenes.length; k++) {
    if (scenes[k].duration === null || scenes[k].duration <= 0) {
      if (k + 1 < scenes.length) scenes[k].duration = scenes[k + 1].startTime - scenes[k].startTime;
      else scenes[k].duration = null;
    }
  }
  return scenes;
}

/* ============ GỌI API (Y HỆT BẢN APP.JS CŨ CỦA BẠN, ĐỔI FLUX-SCHNELL) ============ */
async function fetchPollinationImage(prompt, model) {
  model = model || 'flux-schnell'; // Đổi theo Web UI
  
  // ĐÃ SỬA: Xóa bỏ &enhance=true&nologo=true
  var url = 'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(prompt) +
    '?width=1920&height=1080&model=' + encodeURIComponent(model) +
    '&seed=' + Math.floor(Math.random() * 999999);

  // Vòng lặp retry 3 lần
  for (var attempt = 0; attempt < 3; attempt++) {
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(function(){ ctrl.abort(); }, 90000); // Chờ tối đa 90s
      
      var resp = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      var blob = await resp.blob();
      
      // Dùng hàm imgFileToJpeg có sẵn để ép thành Uint8Array cho FFmpeg
      return await imgFileToJpeg(blob); 
    } catch(e) {
      if (attempt === 2) throw e;
      console.warn("Thử lại lần " + (attempt + 1) + " do lỗi mạng hoặc máy chủ bận...");
      await sleep(3000); // Nghỉ 3 giây trước khi thử lại
    }
  }
}
