import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLocale } from '../i18n.jsx';

const MAX_DURATION_SECONDS = 30;
const CAPTURE_SECONDS = 30;

export default function Mp4ToGifConverter() {
  const { t } = useLocale();
  const [file, setFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('media-wecommit.gif');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(null);

  const ensureFfmpeg = useCallback(async () => {
    if (!ffmpegRef.current) {
      const instance = new FFmpeg();
      instance.on('progress', ({ progress: value = 0 }) => {
        setProgress(Math.min(100, Math.round(value * 100)));
      });
      ffmpegRef.current = instance;
    }

    if (!ffmpegRef.current.loaded) {
      setStatus('loading-core');
      await ffmpegRef.current.load();
      setStatus('ready');
    }

    return ffmpegRef.current;
  }, []);

  useEffect(() => () => {
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
    }
  }, [gifUrl]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    setFile(nextFile);
    setGifUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    const baseName = nextFile.name ? nextFile.name.replace(/\.[^/.]+$/, '') : 'media-wecommit';
    setDownloadName(`${baseName}.gif`);
    setVideoDuration(null);
    setError(null);
    setInfo(null);
    setStatus('ready');
    setProgress(0);

    const objectUrl = URL.createObjectURL(nextFile);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      setVideoDuration(tempVideo.duration);
      URL.revokeObjectURL(objectUrl);
    };
    tempVideo.onerror = () => {
      setVideoDuration(null);
      setError({ key: 'converter.errors.metadata' });
      URL.revokeObjectURL(objectUrl);
    };
    tempVideo.src = objectUrl;
  };

  const handleConvert = async () => {
    if (!file) {
      setError({ key: 'converter.errors.noFile' });
      return;
    }

    try {
      setError(null);
      setInfo(null);
      setProgress(0);

      const ffmpeg = await ensureFfmpeg();
      setStatus('converting');
      const inputName = 'input.mp4';
      const outputName = 'output.gif';

      try {
        await ffmpeg.deleteFile(inputName);
      } catch (e) {
        // ignore missing files
      }
      try {
        await ffmpeg.deleteFile(outputName);
      } catch (e) {
        // ignore missing files
      }

      const fileBytes = new Uint8Array(await file.arrayBuffer());
      await ffmpeg.writeFile(inputName, fileBytes);
      const captureDuration = Math.min(CAPTURE_SECONDS, videoDuration ?? CAPTURE_SECONDS);

      await ffmpeg.exec([
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        inputName,
        '-t',
        captureDuration.toString(),
        '-vf',
        'fps=12,scale=480:-1:flags=lanczos',
        '-loop',
        '0',
        '-y',
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const binary = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      const gifFileUrl = URL.createObjectURL(new Blob([binary.buffer], { type: 'image/gif' }));
      setGifUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return gifFileUrl;
      });
      setStatus('done');
      setProgress(100);

      if (videoDuration && videoDuration > MAX_DURATION_SECONDS) {
        setInfo({ key: 'converter.info.trimmed' });
      } else {
        setInfo({ key: 'converter.info.ready' });
      }
    } catch (conversionError) {
      console.error(conversionError);
      setStatus('error');
      setError({ key: 'converter.errors.runtime' });
    }
  };

  const isBusy = status === 'converting' || status === 'loading-core';
  const detectedDuration =
    typeof videoDuration === 'number' && Number.isFinite(videoDuration)
      ? `${videoDuration.toFixed(1)} s`
      : '—';

  const errorMessage = error ? t(error.key, error.params) : '';
  const infoMessage = info ? t(info.key, info.params) : '';
  const durationHint = t('converter.durationAndSize', { duration: detectedDuration });

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
              {t('converter.backLink')}
            </Link>
            <h1 className="mt-4 text-3xl font-semibold">{t('converter.title')}</h1>
            <p className="mt-2 text-base text-slate-600">{t('converter.description')}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
              <li>{t('converter.bullets.quality')}</li>
              <li>{t('converter.bullets.trimmed')}</li>
              <li>{t('converter.bullets.privacy')}</li>
            </ul>
          </div>
          <LanguageToggle />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label htmlFor="videoInput" className="text-sm font-medium text-slate-700">
                {t('converter.uploadLabel')}
              </label>
              <input
                id="videoInput"
                type="file"
                accept="video/mp4,video/*"
                onChange={handleFileChange}
                className="mt-2 block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm"
              />
              <div className="mt-2 text-xs text-slate-500">
                {durationHint}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={!file || isBusy}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {status === 'loading-core' && t('converter.button.loadingCore')}
              {status === 'converting' && t('converter.button.converting')}
              {status !== 'loading-core' && status !== 'converting' && t('converter.button.idle')}
            </button>

            {isBusy && (
              <div className="flex flex-col gap-2 text-sm text-slate-600">
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMessage}</div>
            )}
            {infoMessage && !errorMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{infoMessage}</div>
            )}

            {gifUrl && (
              <div className="mt-4 space-y-3">
                <h2 className="text-base font-semibold">{t('converter.previewTitle')}</h2>
                <img
                  src={gifUrl}
                  alt={t('converter.previewAlt')}
                  className="max-h-80 w-full rounded-xl border border-slate-200 object-contain"
                />
                <a
                  href={gifUrl}
                  download={downloadName}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {t('converter.downloadCta')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
