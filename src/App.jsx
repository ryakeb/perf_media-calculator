import React, { useMemo, useState } from 'react';
import ControlsPanel from './components/ControlsPanel.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import ReachSummary from './components/ReachSummary.jsx';
import InversionCard from './components/InversionCard.jsx';
import ExportCard from './components/ExportCard.jsx';
import DailyTable from './components/DailyTable.jsx';
import TestsSection from './components/TestsSection.jsx';
import NotesSection from './components/NotesSection.jsx';
import CustomPacingEditor from './components/CustomPacingEditor.jsx';
import { useKpiModel } from './hooks/useKpiModel.js';
import { LocaleProvider, resolveMessage, useLocale } from './i18n.jsx';

function ErrorBanner({ errors }) {
  const { t } = useLocale();
  if (!errors.length) {
    return null;
  }

  return (
    <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-4 text-sm">
      <ul className="list-disc pl-5 space-y-1">
        {errors.map((error, index) => (
          <li key={error?.key ?? index}>{resolveMessage(error, t)}</li>
        ))}
      </ul>
    </div>
  );
}

function KPIReachCalculatorContent() {
  const model = useKpiModel();
  const { t, language, setLanguage } = useLocale();

  const blockingErrorMessages = useMemo(() => {
    const descriptors = [];
    if (model.errors.budget) descriptors.push(model.errors.budget);
    if (model.errors.cpm) descriptors.push(model.errors.cpm);
    if (model.errors.avgFreq) descriptors.push(model.errors.avgFreq);
    if (model.errors.audienceSize) descriptors.push(model.errors.audienceSize);
    if (model.errors.dateRange) descriptors.push(model.errors.dateRange);
    if (model.errors.customShares) descriptors.push(model.errors.customShares);
    return descriptors;
  }, [model.errors]);

  const toggleLabel = language === 'fr' ? t('app.switchToEnglish') : t('app.switchToFrench');

  const handleToggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{t('app.title')}</h1>
            <p className="text-slate-600 mt-1">{t('app.description')}</p>
          </div>
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="px-3 py-1 text-sm rounded-lg border shadow hover:bg-slate-100 transition"
          >
            {toggleLabel}
          </button>
        </header>

        <ErrorBanner errors={blockingErrorMessages} />

        <ControlsPanel
          inputs={model.inputs}
          updateInput={model.updateInput}
          selectedPreset={model.selectedPreset}
          handlePresetChange={model.handlePresetChange}
          updateAudienceSize={model.updateAudienceSize}
          campaignDays={model.campaignDays}
          errors={model.errors}
          customSharesSum={model.customSharesSum}
        />

        <CustomPacingEditor
          pacingMode={model.inputs.pacingMode}
          dateLabels={model.dateLabels}
          customShares={model.customShares}
          updateCustomShareAt={model.updateCustomShareAt}
          resetCustomShares={model.resetCustomShares}
          customSharesSum={model.customSharesSum}
          error={model.errors.customShares}
        />

        <SummaryCards
          metrics={model.metrics}
          currency={model.inputs.currency}
          budget={model.numericValues.budget}
        />

        <ReachSummary
          metrics={model.metrics}
          campaignDays={model.campaignDays}
          pacingMode={model.inputs.pacingMode}
        />

        <section className="mt-4 grid md:grid-cols-2 gap-4">
          <InversionCard
            targetImpr={model.inputs.targetImpr}
            onTargetImprChange={model.updateInput('targetImpr')}
            neededBudget={model.neededBudget}
            currency={model.inputs.currency}
            cpm={model.numericValues.cpm}
            error={model.errors.targetImpr}
          />
          <ExportCard onExport={model.exportCSV} disabled={!model.dailyRows.length || model.hasBlockingErrors} />
        </section>

        <DailyTable dailyRows={model.dailyRows} currency={model.inputs.currency} />

        <TestsSection
          showChecks={model.showChecks}
          onToggle={model.setShowChecks}
          results={model.selfCheckResults}
        />

        <NotesSection />
      </div>
    </div>
  );
}

export default function KPIReachCalculator() {
  const [language, setLanguage] = useState('fr');

  return (
    <LocaleProvider language={language} setLanguage={setLanguage}>
      <KPIReachCalculatorContent />
    </LocaleProvider>
  );
}
