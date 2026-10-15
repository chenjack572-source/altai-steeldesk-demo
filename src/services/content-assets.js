const VIDEO_PLATFORM = /TikTok|Shorts|Reels|抖音|视频号|YouTube|视频/i;

export function contentAssetSpec(variant = {}) {
  const isVideo = VIDEO_PLATFORM.test(`${variant.platform || ''} ${variant.format || ''}`);
  return isVideo
    ? { width: 1080, height: 1920, kind: 'video-cover', label: '1080 × 1920 PNG' }
    : { width: /Facebook/i.test(variant.platform || '') ? 1200 : 1080, height: /Facebook/i.test(variant.platform || '') ? 1500 : 1350, kind: 'post', label: /Facebook/i.test(variant.platform || '') ? '1200 × 1500 PNG' : '1080 × 1350 PNG' };
}

export function contentVisualFrame(content = {}, variant = {}, index = 0) {
  const plan = variant.visualPlan || [];
  const safeIndex = Math.max(0, Math.min(Number(index) || 0, Math.max(plan.length - 1, 0)));
  const frame = plan[safeIndex] || {};
  return {
    index: safeIndex,
    marker: frame.index || frame.time || String(safeIndex + 1).padStart(2, '0'),
    total: Math.max(plan.length, 1),
    title: frame.overlay || variant.hook || content.title || 'ALTAI STAINLESS',
    detail: frame.detail || frame.shot || content.title || '',
    shot: frame.shot || '',
    kicker: `${content.campaign || content.pillar || 'MATERIAL NOTE'}`
  };
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function fitImage(ctx, image, x, y, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function splitLongToken(ctx, token, maxWidth) {
  const parts = [];
  let current = '';
  for (const character of token) {
    if (ctx.measureText(`${current}${character}`).width > maxWidth && current) {
      parts.push(current);
      current = character;
    } else current += character;
  }
  if (current) parts.push(current);
  return parts;
}

function wrapText(ctx, value, maxWidth) {
  const source = String(value || '').trim();
  if (!source) return [];
  const tokens = /\s/.test(source) ? source.split(/\s+/) : [...source];
  const lines = [];
  let line = '';
  for (const rawToken of tokens) {
    const candidates = ctx.measureText(rawToken).width > maxWidth ? splitLongToken(ctx, rawToken, maxWidth) : [rawToken];
    for (const token of candidates) {
      const spacer = line && /\s/.test(source) ? ' ' : '';
      const candidate = `${line}${spacer}${token}`;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = token;
      } else line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(ctx, value, x, y, maxWidth, lineHeight, maxLines) {
  const lines = wrapText(ctx, value, maxWidth);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines && visible.length) {
    let last = visible.at(-1);
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    visible[visible.length - 1] = `${last}…`;
  }
  visible.forEach((line, lineIndex) => ctx.fillText(line, x, y + (lineIndex * lineHeight)));
  return y + (visible.length * lineHeight);
}

function drawBrand(ctx, logo, { x, y, width = 360, height = 112 }) {
  ctx.save();
  ctx.fillStyle = '#f7fafb';
  ctx.fillRect(x, y, 112, height);
  fitImage(ctx, logo, x + 12, y + 20, 88, height - 40);
  ctx.fillStyle = '#dce6eb';
  ctx.font = '600 25px Bahnschrift, "Microsoft YaHei", sans-serif';
  ctx.fillText('ALTAI STAINLESS', x + 136, y + 48);
  ctx.fillStyle = '#91a3ae';
  ctx.font = '18px "Cascadia Code", Consolas, monospace';
  ctx.fillText('MATERIAL INTELLIGENCE', x + 136, y + 80);
  ctx.strokeStyle = '#425461';
  ctx.strokeRect(x + .5, y + .5, width - 1, height - 1);
  ctx.restore();
}

function drawPost(ctx, spec, frame, logo, content) {
  const { width, height } = spec;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#101820');
  gradient.addColorStop(.72, '#1e2d37');
  gradient.addColorStop(1, '#314550');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#c8ff3d';
  ctx.beginPath();
  ctx.moveTo(width * .82, height);
  ctx.lineTo(width, height * .78);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  drawBrand(ctx, logo, { x: 72, y: 72, width: 390, height: 112 });
  ctx.fillStyle = '#c8ff3d';
  ctx.font = '700 54px "Cascadia Code", Consolas, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(frame.marker, width - 78, 128);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#536672';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(72, 236);
  ctx.lineTo(width - 72, 236);
  ctx.stroke();

  ctx.fillStyle = '#c8ff3d';
  ctx.font = '500 23px "Cascadia Code", Consolas, monospace';
  ctx.fillText(`ALTAI / ${frame.kicker.toUpperCase()}`, 78, 318);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${width > 1100 ? 96 : 88}px Bahnschrift, "Microsoft YaHei", sans-serif`;
  const titleEnd = drawWrappedText(ctx, frame.title, 76, 432, width - 172, width > 1100 ? 108 : 100, 5);

  ctx.fillStyle = '#c1cdd3';
  ctx.font = '30px Aptos, "Microsoft YaHei", sans-serif';
  drawWrappedText(ctx, frame.detail, 80, Math.min(titleEnd + 44, height - 330), width - 250, 45, 4);

  ctx.fillStyle = '#0c1117';
  ctx.fillRect(0, height - 136, width, 136);
  ctx.fillStyle = '#c8ff3d';
  ctx.font = '600 23px "Cascadia Code", Consolas, monospace';
  ctx.fillText('ALTAI-STAINLESS.NETLIFY.APP', 76, height - 72);
  ctx.fillStyle = '#9aabb5';
  ctx.textAlign = 'right';
  ctx.fillText(`${String(frame.index + 1).padStart(2, '0')} / ${String(frame.total).padStart(2, '0')}`, width - 76, height - 72);
  ctx.textAlign = 'left';
}

function drawVideoCover(ctx, spec, frame, logo, content) {
  const { width, height } = spec;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#243842');
  gradient.addColorStop(.58, '#0c1117');
  gradient.addColorStop(1, '#16251f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(200,255,61,.34)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width + 120, 240);
  ctx.lineTo(120, 1180);
  ctx.stroke();

  drawBrand(ctx, logo, { x: 76, y: 150, width: 390, height: 112 });
  ctx.fillStyle = '#9dafb9';
  ctx.font = '500 22px "Cascadia Code", Consolas, monospace';
  ctx.textAlign = 'right';
  ctx.fillText('9:16 SAFE COVER', width - 82, 205);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#c8ff3d';
  ctx.fillRect(78, 420, 360, 58);
  ctx.fillStyle = '#0c1117';
  ctx.font = '700 24px Bahnschrift, "Microsoft YaHei", sans-serif';
  ctx.fillText(String(frame.shot || content.pillar || 'MATERIAL NOTE').toUpperCase().slice(0, 30), 98, 458);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 104px Bahnschrift, "Microsoft YaHei", sans-serif';
  const titleEnd = drawWrappedText(ctx, frame.title, 78, 620, 840, 116, 6);

  ctx.fillStyle = '#bdc9d0';
  ctx.font = '31px Aptos, "Microsoft YaHei", sans-serif';
  drawWrappedText(ctx, frame.detail, 82, Math.min(titleEnd + 50, 1440), 760, 46, 5);

  ctx.fillStyle = 'rgba(12,17,23,.9)';
  ctx.fillRect(0, height - 250, width, 250);
  ctx.fillStyle = '#c8ff3d';
  ctx.font = '700 27px Bahnschrift, "Microsoft YaHei", sans-serif';
  ctx.fillText('@ALTAI.STAINLESS', 78, height - 158);
  ctx.fillStyle = '#aab9c1';
  ctx.font = '24px Aptos, "Microsoft YaHei", sans-serif';
  ctx.fillText('Review the specification before quotation.', 78, height - 108);
}

export async function renderContentImage(content, variant, index, logoSource) {
  const spec = contentAssetSpec(variant);
  const frame = contentVisualFrame(content, variant, index);
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d');
  const logo = await loadImage(logoSource);
  if (spec.kind === 'video-cover') drawVideoCover(ctx, spec, frame, logo, content);
  else drawPost(ctx, spec, frame, logo, content);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片生成失败')), 'image/png'));
}

export function contentAssetFilename(content, variant, index = 0) {
  const safeTitle = String(content.title || 'content').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-').slice(0, 48);
  const frame = contentVisualFrame(content, variant, index);
  return `altai-${String(variant.platform || 'social').toLowerCase()}-${safeTitle}-${String(frame.index + 1).padStart(2, '0')}.png`;
}

export function downloadContentImage(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
