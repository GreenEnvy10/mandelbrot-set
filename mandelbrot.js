const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 720;

let zoom = 1;
let offsetX = -0.5;
let offsetY = 0;
let isDragging = false;
let dragStartX, dragStartY;

function drawMandelbrot() {
  const imgData = ctx.createImageData(canvas.width, canvas.height);
  const data = imgData.data;
  const maxIter = 10;

  const w = canvas.width;
  const h = canvas.height;
  const aspect = h / w;
  const scaleX = 3.0 / (w * zoom);
  const scaleY = 3.0 * aspect / (h * zoom);

  for (let y = 0; y < h; y++) {
    let ci = (y - h / 2) * scaleY + offsetY;
    for (let x = 0; x < w; x++) {
      let cr = (x - w / 2) * scaleX + offsetX;
      let zr = cr, zi = ci;
      let i = 0;
      for (; i < maxIter; i++) {
        const zr2 = zr * zr, zi2 = zi * zi;
        if (zr2 + zi2 > 4.0) break;
        const temp = zr2 - zi2 + cr;
        zi = 2 * zr * zi + ci;
        zr = temp;
      }

      const index = 4 * (y * w + x);

      let r = 0, g = 0, b = 0;
      if (i === maxIter) {
        // Inside Mandelbrot set
        r = g = b = 0;
      } else {
        // Smooth coloring (electric blue gradient)
        const log_zn = Math.log(zr * zr + zi * zi) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        const smooth = i + 1 - nu;
        const t = smooth / maxIter;

        r = Math.floor(255 * Math.pow(t, 0.3));              // Slight red tint
        g = Math.floor(255 * Math.pow(t, 0.6));              // Green middle
        b = Math.floor(255 * (1 - Math.pow(1 - t, 4)));      // Strong blue outer
      }

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const scaleX = 3.0 / (canvas.width * zoom);
  const scaleY = 3.0 * (canvas.height / canvas.width) / (canvas.height * zoom);
  const cx = (mx - canvas.width / 2) * scaleX + offsetX;
  const cy = (my - canvas.height / 2) * scaleY + offsetY;

  zoom *= zoomFactor;
  offsetX = cx - (mx - canvas.width / 2) * 3.0 / (canvas.width * zoom);
  offsetY = cy - (my - canvas.height / 2) * 3.0 * (canvas.height / canvas.width) / (canvas.height * zoom);

  drawMandelbrot();
});

canvas.addEventListener('mousedown', e => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
});

canvas.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  dragStartX = e.clientX;
  dragStartY = e.clientY;

  const scaleX = 3.0 / (canvas.width * zoom);
  const scaleY = 3.0 * (canvas.height / canvas.width) / (canvas.height * zoom);
  offsetX -= dx * scaleX;
  offsetY += dy * scaleY;

  drawMandelbrot();
});

canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

drawMandelbrot();
