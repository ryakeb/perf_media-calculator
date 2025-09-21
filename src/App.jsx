import React from 'react';
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

function ErrorBanner({ errors }) {
  if (!errors.length) {
    return null;
  }

  return (
    <div className="mb-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl p-4 text-sm">
      <ul className="list-disc pl-5 space-y-1">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export default function KPIReachCalculator() {
  const model = useKpiModel();

  const blockingErrorMessages = [];
  if (model.errors.budget) blockingErrorMessages.push(model.errors.budget);
  if (model.errors.cpm) blockingErrorMessages.push(model.errors.cpm);
  if (model.errors.avgFreq) blockingErrorMessages.push(model.errors.avgFreq);
  if (model.errors.audienceSize) blockingErrorMessages.push(model.errors.audienceSize);
  if (model.errors.dateRange) blockingErrorMessages.push(model.errors.dateRange);
  if (model.errors.customShares) blockingErrorMessages.push(model.errors.customShares);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Performance Media Estimator</h1>
          <p className="text-slate-600 mt-1">
Speed through proposal prep, calculate impressions, click volumes, CPM, VTR, viewability, and total projected reach for your campaign timeline.          </p>
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
