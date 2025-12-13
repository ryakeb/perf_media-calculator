import React from 'react';
import { Link } from 'react-router-dom';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { useLocale } from '../i18n.jsx';

function ToolCard({ title, description, to, badge, cta }) {
  return (
    <Link
      to={to}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {badge}
        </span>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 group-hover:text-blue-600">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-5 text-sm font-medium text-blue-600">{cta}</div>
    </Link>
  );
}

export default function Home() {
  const { t } = useLocale();
  const tools = [
    {
      title: t('home.cards.kpi.title'),
      description: t('home.cards.kpi.description'),
      badge: t('home.cards.kpi.badge'),
      to: '/outils/kpi-reach',
    },
    {
      title: t('home.cards.percentage.title'),
      description: t('home.cards.percentage.description'),
      badge: t('home.cards.percentage.badge'),
      to: '/outils/pourcentages',
    },
    {
      title: t('home.cards.gif.title'),
      description: t('home.cards.gif.description'),
      badge: t('home.cards.gif.badge'),
      to: '/outils/mp4-vers-gif',
    },
    {
      title: t('home.cards.svgPng.title'),
      description: t('home.cards.svgPng.description'),
      badge: t('home.cards.svgPng.badge'),
      to: '/outils/svg-vers-png',
    },
    {
      title: t('home.cards.bgRemover.title'),
      description: t('home.cards.bgRemover.description'),
      badge: t('home.cards.bgRemover.badge'),
      to: '/outils/remove-background',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600">{t('home.brand')}</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{t('home.title')}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">{t('home.subtitle')}</p>
          </div>
          <LanguageToggle />
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.to} {...tool} cta={t('home.cardCta')} />
          ))}
        </section>
      </div>
    </div>
  );
}
