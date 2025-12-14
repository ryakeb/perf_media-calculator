import React from 'react';
import { useLocale } from '../i18n.jsx';

export default function NotesSection() {
  const { t } = useLocale();
  return (
    <section className="mt-6 text-xs text-slate-500 space-y-2 dark:text-slate-400">
      <p>{t('notes.paragraph1')}</p>
      <p>{t('notes.paragraph2')}</p>
    </section>
  );
}
