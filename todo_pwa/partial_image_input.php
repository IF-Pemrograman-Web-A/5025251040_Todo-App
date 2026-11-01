<?php /** Bagian form untuk upload gambar (file handling) + opsi kamera. */ ?>
<fieldset class="camera-fieldset">
    <legend>Gambar Tugas</legend>
    <p>Pilih file gambar (JPG/PNG/WEBP, maks. 2 MB) atau ambil foto dengan kamera.</p>

    <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/webp">

    <div class="camera-controls">
        <button type="button" id="start-camera" class="secondary-btn">Buka Kamera</button>
        <button type="button" id="capture-photo" class="secondary-btn" disabled>Ambil Gambar</button>
        <button type="button" id="stop-camera" class="secondary-btn" disabled>Tutup Kamera</button>
    </div>

    <video id="camera-preview" class="camera-preview" autoplay playsinline muted hidden
           aria-label="Pratinjau kamera"></video>
    <canvas id="photo-canvas" hidden></canvas>
    <img id="photo-preview" class="photo-preview" alt="Pratinjau gambar yang dipilih" hidden>
    <p id="camera-status" class="status-message" aria-live="polite"></p>
</fieldset>
