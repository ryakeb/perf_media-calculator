import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLocale } from '../i18n.jsx';

function parseDimensions(svgText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return null;

    const widthAttr = svg.getAttribute('width');
    const heightAttr = svg.getAttribute('height');
    const viewBoxAttr = svg.getAttribute('viewBox');

    const viewBoxParts = viewBoxAttr ? viewBoxAttr.trim().split(/[ ,]+/).map(Number) : [];
    const viewWidth = viewBoxParts.length === 4 ? viewBoxParts[2] : undefined;
    const viewHeight = viewBoxParts.length === 4 ? viewBoxParts[3] : undefined;

    const width = Number.isFinite(parseFloat(widthAttr)) ? parseFloat(widthAttr) : viewWidth;
    const height = Number.isFinite(parseFloat(heightAttr)) ? parseFloat(heightAttr) : viewHeight;

    if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
      if (viewWidth && viewHeight) {
        return { width: viewWidth, height: viewHeight };
      }
      return null;
    }

    return { width, height };
  } catch (err) {
    console.error('Failed to parse SVG dimensions', err);
    return null;
  }
}

async function renderSvgToPng(svgText, width, height, backgroundColor) {
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = 'async';
    const loadPromise = new Promise((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('svg-load'));
    });
    image.src = svgUrl;
    await loadPromise;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(image, 0, 0, width, height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('to-blob'));
        }
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export default function SvgToPngConverter() {
  const { t } = useLocale();
  const [svgContent, setSvgContent] = useState('');
  const [pngUrl, setPngUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('media-wecommit.png');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState('idle');
  const [scale, setScale] = useState(2);
  const [fillBackground, setFillBackground] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => () => {
    if (pngUrl) {
      URL.revokeObjectURL(pngUrl);
    }
  }, [pngUrl]);

  const outputSize = useMemo(() => {
    if (!dimensions) return null;
    return {
      width: Math.max(1, Math.round(dimensions.width * scale)),
      height: Math.max(1, Math.round(dimensions.height * scale)),
    };
  }, [dimensions, scale]);

  const handleFileChange = useCallback((event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    const baseName = nextFile.name ? nextFile.name.replace(/\.[^/.]+$/, '') : 'media-wecommit';
    setDownloadName(`${baseName}.png`);
    setError(null);
    setInfo(null);
    setStatus('ready');
    setPngUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setSvgContent(text);
      const parsed = parseDimensions(text);
      setDimensions(parsed);
    };
    reader.onerror = () => {
      setSvgContent('');
      setDimensions(null);
      setError({ key: 'svgConverter.errors.parse' });
    };
    reader.readAsText(nextFile);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!svgContent) {
      setError({ key: 'svgConverter.errors.noFile' });
      return;
    }

    try {
      setStatus('processing');
      setError(null);
      setInfo(null);

      const parsed = dimensions || parseDimensions(svgContent);
      const baseWidth = parsed?.width && Number.isFinite(parsed.width) ? parsed.width : 1024;
      const baseHeight = parsed?.height && Number.isFinite(parsed.height) ? parsed.height : 1024;
      const targetWidth = Math.max(1, Math.round(baseWidth * scale));
      const targetHeight = Math.max(1, Math.round(baseHeight * scale));
      setDimensions(parsed ?? { width: baseWidth, height: baseHeight });

      const blob = await renderSvgToPng(
        svgContent,
        targetWidth,
        targetHeight,
        fillBackground ? backgroundColor : null,
      );
      const url = URL.createObjectURL(blob);
      setPngUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      setInfo({ key: 'svgConverter.info.ready' });
      setStatus('done');
    } catch (conversionError) {
      console.error(conversionError);
      setStatus('error');
      setError({ key: 'svgConverter.errors.render' });
    }
  }, [backgroundColor, dimensions, fillBackground, scale, svgContent]);

  const errorMessage = error ? t(error.key, error.params) : '';
  const infoMessage = info ? t(info.key, info.params) : '';
  const detectedLabel = dimensions
    ? t('svgConverter.detectedSize', {
        width: Math.round(dimensions.width),
        height: Math.round(dimensions.height),
      })
    : t('svgConverter.detectedSizeUnknown');
  const outputLabel = outputSize
    ? t('svgConverter.scaleHint', { width: outputSize.width, height: outputSize.height })
    : t('svgConverter.scaleHint', { width: '—', height: '—' });
  const isProcessing = status === 'processing';

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
              {t('converter.backLink')}
            </Link>
            <h1 className="mt-4 text-3xl font-semibold">{t('svgConverter.title')}</h1>
            <p className="mt-2 text-base text-slate-600">{t('svgConverter.description')}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>{t('svgConverter.bullets.quality')}</li>
              <li>{t('svgConverter.bullets.background')}</li>
              <li>{t('svgConverter.bullets.privacy')}</li>
            </ul>
          </div>
          <LanguageToggle />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label htmlFor="svgInput" className="text-sm font-medium text-slate-700">
                {t('svgConverter.uploadLabel')}
              </label>
              <input
                id="svgInput"
                type="file"
                accept=".svg,image/svg+xml"
                onChange={handleFileChange}
                className="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm"
              />
              <div className="mt-2 text-xs text-slate-500">
                {detectedLabel}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{t('svgConverter.scaleLabel')}</span>
                  <span>×{scale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.25"
                  value={scale}
                  onChange={(event) => setScale(parseFloat(event.target.value))}
                  className="mt-3 w-full accent-blue-600"
                />
                <p className="mt-2 text-xs text-slate-500">{outputLabel}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="text-sm font-medium text-slate-700">{t('svgConverter.backgroundLabel')}</div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="backgroundMode"
                    value="transparent"
                    checked={!fillBackground}
                    onChange={() => setFillBackground(false)}
                  />
                  {t('svgConverter.backgroundOptions.transparent')}
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="backgroundMode"
                    value="color"
                    checked={fillBackground}
                    onChange={() => setFillBackground(true)}
                  />
                  {t('svgConverter.backgroundOptions.color')}
                </label>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <span className="text-xs text-slate-500">{t('svgConverter.colorLabel')}</span>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                    disabled={!fillBackground}
                    className="h-8 w-12 cursor-pointer rounded border border-slate-200 bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={!svgContent || isProcessing}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isProcessing ? t('svgConverter.button.processing') : t('svgConverter.button.idle')}
            </button>

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMessage}</div>
            )}
            {infoMessage && !errorMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>
            )}

            {pngUrl && (
              <div className="mt-4 space-y-3">
                <h2 className="text-base font-semibold">{t('svgConverter.previewTitle')}</h2>
                <img
                  src={pngUrl}
                  alt={t('svgConverter.previewAlt')}
                  className="max-h-80 w-full rounded-xl border border-slate-200 object-contain bg-white"
                />
                <a
                  href={pngUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('svgConverter.downloadCta')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
