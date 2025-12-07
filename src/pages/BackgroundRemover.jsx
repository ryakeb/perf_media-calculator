import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLocale } from '../i18n.jsx';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex) {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const [r, g, b] = sanitized.split('');
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
    };
  }
  if (sanitized.length !== 6) return null;
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function averageColor(samples) {
  if (!samples.length) return null;
  const sums = samples.reduce(
    (acc, color) => ({
      r: acc.r + color.r,
      g: acc.g + color.g,
      b: acc.b + color.b,
    }),
    { r: 0, g: 0, b: 0 },
  );
  return {
    r: Math.round(sums.r / samples.length),
    g: Math.round(sums.g / samples.length),
    b: Math.round(sums.b / samples.length),
  };
}

function sampleBlock(imageData, startX, startY, size = 10) {
  const { data, width, height } = imageData;
  const xEnd = Math.min(width, startX + size);
  const yEnd = Math.min(height, startY + size);
  const samples = [];

  for (let y = startY; y < yEnd; y += 1) {
    for (let x = startX; x < xEnd; x += 1) {
      const idx = (y * width + x) * 4;
      samples.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
  }

  return samples;
}

function detectBackgroundColor(imageData) {
  const { width, height } = imageData;
  const size = Math.max(4, Math.floor(Math.min(width, height) * 0.04));
  const corners = [
    sampleBlock(imageData, 0, 0, size),
    sampleBlock(imageData, Math.max(0, width - size), 0, size),
    sampleBlock(imageData, 0, Math.max(0, height - size), size),
    sampleBlock(imageData, Math.max(0, width - size), Math.max(0, height - size), size),
  ].flat();
  return averageColor(corners);
}

async function loadImage(src) {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  await image.decode();
  return image;
}

async function renderTransparentPng(imageData, backgroundColor, tolerance) {
  const { data, width, height } = imageData;
  const rgb = hexToRgb(backgroundColor) ?? { r: 255, g: 255, b: 255 };
  const output = new Uint8ClampedArray(data);
  const threshold = clamp(tolerance, 0, 255);
  const maxDistance = threshold * threshold * 3;

  for (let i = 0; i < output.length; i += 4) {
    const dr = output[i] - rgb.r;
    const dg = output[i + 1] - rgb.g;
    const db = output[i + 2] - rgb.b;
    const distance = dr * dr + dg * dg + db * db;

    if (distance <= maxDistance) {
      const softness = distance / maxDistance;
      output[i + 3] = Math.round(output[i + 3] * softness * softness);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(output, width, height), 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('to-blob'));
      }
    }, 'image/png');
  });
}

export default function BackgroundRemover() {
  const { t } = useLocale();
  const [sourceUrl, setSourceUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('media-wecommit.png');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [tolerance, setTolerance] = useState(45);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [dimensions, setDimensions] = useState(null);
  const imageDataRef = useRef(null);

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl, sourceUrl]);

  const prepareImage = useCallback(async (url) => {
    try {
      setStatus('loading');
      const image = await loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const data = ctx.getImageData(0, 0, image.width, image.height);
      imageDataRef.current = data;
      setDimensions({ width: image.width, height: image.height });

      const detected = detectBackgroundColor(data);
      if (detected) {
        setBackgroundColor(rgbToHex(detected));
      }
      setStatus('ready');
    } catch (loadError) {
      console.error(loadError);
      imageDataRef.current = null;
      setDimensions(null);
      setStatus('idle');
      setError({ key: 'bgRemover.errors.parse' });
    }
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const nextFile = event.target.files?.[0];
      if (!nextFile) return;

      const baseName = nextFile.name ? nextFile.name.replace(/\.[^/.]+$/, '') : 'media-wecommit';
      setDownloadName(`${baseName}-no-bg.png`);
      setError(null);
      setInfo(null);
      setResultUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setTolerance(45);

      const objectUrl = URL.createObjectURL(nextFile);
      setSourceUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return objectUrl;
      });
      prepareImage(objectUrl);
    },
    [prepareImage],
  );

  const handleConvert = useCallback(async () => {
    if (!imageDataRef.current) {
      setError({ key: 'bgRemover.errors.noFile' });
      return;
    }

    try {
      setStatus('processing');
      setError(null);
      setInfo(null);

      const blob = await renderTransparentPng(imageDataRef.current, backgroundColor, tolerance);
      const url = URL.createObjectURL(blob);
      setResultUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      setInfo({ key: 'bgRemover.info.ready' });
      setStatus('done');
    } catch (processingError) {
      console.error(processingError);
      setStatus('error');
      setError({ key: 'bgRemover.errors.render' });
    }
  }, [backgroundColor, tolerance]);

  const handlePickColor = useCallback((event) => {
    if (!imageDataRef.current) return;
    const { width, height, data } = imageDataRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp(Math.floor(((event.clientX - rect.left) / rect.width) * width), 0, width - 1);
    const y = clamp(Math.floor(((event.clientY - rect.top) / rect.height) * height), 0, height - 1);
    const idx = (y * width + x) * 4;
    setBackgroundColor(rgbToHex({ r: data[idx], g: data[idx + 1], b: data[idx + 2] }));
  }, []);

  const errorMessage = error ? t(error.key, error.params) : '';
  const infoMessage = info ? t(info.key, info.params) : '';
  const detectedLabel = useMemo(() => {
    if (!dimensions) return '';
    return t('bgRemover.dimensions', {
      width: Math.round(dimensions.width),
      height: Math.round(dimensions.height),
    });
  }, [dimensions, t]);
  const isBusy = status === 'processing' || status === 'loading';

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
              {t('converter.backLink')}
            </Link>
            <h1 className="mt-4 text-3xl font-semibold">{t('bgRemover.title')}</h1>
            <p className="mt-2 text-base text-slate-600">{t('bgRemover.description')}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>{t('bgRemover.bullets.detect')}</li>
              <li>{t('bgRemover.bullets.tolerance')}</li>
              <li>{t('bgRemover.bullets.privacy')}</li>
            </ul>
          </div>
          <LanguageToggle />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-5">
              <div>
                <label htmlFor="imageInput" className="text-sm font-medium text-slate-700">
                  {t('bgRemover.uploadLabel')}
                </label>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                />
                {detectedLabel && <div className="mt-2 text-xs text-slate-500">{detectedLabel}</div>}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{t('bgRemover.detectedColor')}</span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-6 w-6 rounded border border-slate-300"
                      style={{ backgroundColor }}
                      aria-label={t('bgRemover.detectedColor')}
                    />
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) => setBackgroundColor(event.target.value)}
                      className="h-8 w-12 cursor-pointer rounded border border-slate-200 bg-white"
                    />
                  </span>
                </div>
                <p className="text-xs text-slate-500">{t('bgRemover.pickInstruction')}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{t('bgRemover.toleranceLabel')}</span>
                  <span>{tolerance}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="1"
                  value={tolerance}
                  onChange={(event) => setTolerance(parseInt(event.target.value, 10))}
                  className="mt-3 w-full accent-blue-600"
                />
                <p className="mt-2 text-xs text-slate-500">{t('bgRemover.toleranceHint')}</p>
              </div>

              <button
                type="button"
                onClick={handleConvert}
                disabled={!sourceUrl || isBusy}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isBusy ? t('bgRemover.button.processing') : t('bgRemover.button.idle')}
              </button>

              {errorMessage && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMessage}</div>
              )}
              {infoMessage && !errorMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 text-sm font-semibold text-slate-700">{t('bgRemover.original')}</div>
                {sourceUrl ? (
                  <img
                    src={sourceUrl}
                    alt={t('bgRemover.originalAlt')}
                    onClick={handlePickColor}
                    className="max-h-72 w-full cursor-crosshair rounded-lg border border-slate-200 object-contain bg-white"
                    title={t('bgRemover.pickInstruction')}
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                    {t('bgRemover.emptyState')}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 text-sm font-semibold text-slate-700">{t('bgRemover.previewTitle')}</div>
                {resultUrl ? (
                  <div className="space-y-3">
                    <img
                      src={resultUrl}
                      alt={t('bgRemover.previewAlt')}
                      className="max-h-72 w-full rounded-lg border border-slate-200 object-contain bg-white"
                    />
                    <a
                      href={resultUrl}
                      download={downloadName}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t('bgRemover.downloadCta')}
                    </a>
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                    {t('bgRemover.previewPlaceholder')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
