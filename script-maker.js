<div class="page-header">
  <h1>Trợ Lý Kịch Bản AI</h1>
  <p>Phân vai & Thu âm miễn phí không giới hạn.</p>
</div>

<div class="app-grid">
  <div class="glass-card">
    <h3><span class="material-icons">settings</span> Cấu hình</h3>
    <div id="voice-settings-area">
      </div>
    <div class="upload-area" onclick="document.getElementById('docxInput').click()">
      <span class="material-icons">file_upload</span>
      <p>Tải file Word (.docx)</p>
      <input type="file" id="docxInput" accept=".docx" style="display:none">
    </div>
    <button class="convert-btn" id="buildScriptBtn" onclick="buildScript()">
      <span class="material-icons">auto_awesome</span> Phân Vai AI
    </button>
  </div>

  <div class="glass-card">
    <h3><span class="material-icons">edit</span> Kịch bản</h3>
    <textarea id="scriptOutput" placeholder="Kết quả kịch bản sẽ hiện ở đây..."></textarea>
    <button class="convert-btn" onclick="startAudioGeneration()" style="background:var(--primary-grad)">
      <span class="material-icons">headphones</span> Thu Âm MP3
    </button>
  </div>
</div>
