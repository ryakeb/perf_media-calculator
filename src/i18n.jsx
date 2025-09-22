/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo } from 'react';

const TRANSLATIONS = {
  fr: {
    app: {
      title: 'Estimateur de performance média',
      description: "Accélère la préparation de tes recommandations, calcule impressions, clics, CPM, VTR, viewability et reach projeté sur toute la campagne.",
      switchToEnglish: 'Passer en anglais',
      switchToFrench: 'Passer en français',
    },
    controls: {
      section: {
        purchase: "Paramètres d'achat",
        reach: 'Reach et univers',
        pacing: 'Dates et pacing',
      },
      fields: {
        currency: 'Devise',
        budget: 'Budget total',
        cpm: 'CPM',
        ctr: 'CTR %',
        vtr: 'VTR %',
        viewability: 'Viewability %',
        presets: "Préréglages d'univers",
        avgFreq: 'Fréquence moyenne',
        audienceSize: "Taille d'univers",
        reachModel: 'Modèle de reach',
        start: 'Début',
        end: 'Fin',
        pacing: 'Pacing',
      },
      helper: {
        poissonInfo: 'Poisson reflète la duplication probable, Simple divise les impressions par la fréquence moyenne.',
        pacingEven: 'Répartition égale sur {{days}} jour(s).',
        pacingCustom: 'Répartition personnalisée, total actuel {{sum}}%.',
        pacingDisabled: 'Ajoute des dates pour activer le pacing.',
      },
      campaignDays: 'Jours de campagne, {{count}}',
      reachModelOptions: {
        Poisson: 'Poisson',
        Simple: 'Simple',
      },
      pacingOptions: {
        Even: 'Uniforme',
        Custom: 'Personnalisé',
      },
    },
    customPacing: {
      title: 'Répartition personnalisée du budget',
      subtitle: 'Ajuste les pourcentages par jour (total 100%).',
      reset: 'Répartir équitablement',
      table: {
        date: 'Date',
        share: 'Pourcentage du budget',
      },
      total: 'Total : {{value}}%',
    },
    summary: {
      cards: {
        impressions: {
          title: 'Impressions estimées',
          subtitle: 'Budget cumulé, {{value}}',
        },
        clicks: {
          title: 'Clics estimés',
          subtitle: 'eCPC, {{value}}',
        },
        completeViews: {
          title: 'Vues complètes',
          subtitle: 'eCPCV, {{value}}',
        },
        viewable: {
          title: 'Impressions visibles',
          subtitle: 'vCPM, {{value}}',
        },
      },
    },
    reachSummary: {
      reachTitle: 'Reach cumulé estimé',
      reachPct: '{{value}}',
      frequencyTitle: 'Fréquence moyenne observée',
      frequencyGrps: 'GRPs estimés, {{grps}}',
      daysTitle: 'Jours de campagne',
      pacingMode: 'Pacing, {{mode}}',
    },
    inversion: {
      title: 'Objectif impressions, budget requis',
      targetLabel: 'Impressions cibles',
      budgetLabel: 'Budget requis estimé',
      cpmNote: 'Hypothèse, CPM, {{value}}',
    },
    export: {
      title: 'Export journalier',
      description: 'Télécharge le CSV avec budget, impressions, reach incrémental et cumulé.',
      button: 'Exporter CSV',
    },
    dailyTable: {
      title: 'Pacing et reach par jour',
      rowsCount: '{{count}} ligne(s)',
      headers: {
        date: 'Date',
        budget: 'Budget {{currency}}',
        impressions: 'Impressions',
        incrReach: 'Reach incrémental',
        cumReach: 'Reach cumulé',
      },
      empty: 'Renseigne des dates et un budget pour voir le détail journalier.',
    },
    tests: {
      title: 'Tests intégrés',
      show: 'Afficher',
      ok: 'OK',
      ko: 'KO',
      names: {
        daysBetweenSameDay: 'daysBetweenInclusive même jour',
        daysBetweenThreeDays: 'daysBetweenInclusive 3 jours',
        distributeEvenSum: 'distributeEven somme',
        distributeEvenLength: 'distributeEven longueur',
        baseImpressions: 'impressions base',
        poissonReachRange: 'reach Poisson dans la plage',
        poissonGrpIdentity: 'GRPs identité Poisson',
      },
    },
    notes: {
      paragraph1: "Notes : le modèle Poisson suppose une distribution aléatoire des impressions sur l'univers, la formule de reach cumulé est N × (1 − exp(−I/N)). Le modèle Simple estime le reach comme impressions divisées par la fréquence moyenne. Ajuste fréquence moyenne et taille d'univers selon ton contexte.",
      paragraph2: 'Ce calculateur couvre vidéo et display, CTR, VTR et viewability paramétrables. Les GRPs affichés sont calculés comme Reach% × fréquence moyenne observée.',
    },
    pacingModes: {
      Even: 'Uniforme',
      Custom: 'Personnalisé',
    },
    errors: {
      budgetPositive: 'Budget total doit être un nombre positif.',
      cpmPositive: 'CPM doit être un nombre positif.',
      ctrRange: 'CTR doit être compris entre 0 et 100%.',
      vtrRange: 'VTR doit être compris entre 0 et 100%.',
      viewabilityRange: 'Viewability doit être comprise entre 0 et 100%.',
      avgFreqPositive: 'Fréquence moyenne doit être > 0.',
      audiencePositive: "Taille d'univers doit être > 0.",
      dateOrder: 'La date de fin doit être postérieure ou égale à la date de début.',
      targetImprValid: 'Impressions cibles doit être un nombre valide.',
      customShares: 'La somme des pourcentages de pacing doit faire 100% (actuellement {{sum}}%).',
    },
  },
  en: {
    app: {
      title: 'Performance Media Estimator',
      description: 'Speed through proposal prep, calculate impressions, clicks, CPM, VTR, viewability and projected reach across your campaign timeline.',
      switchToEnglish: 'Switch to English',
      switchToFrench: 'Switch to French',
    },
    controls: {
      section: {
        purchase: 'Buying settings',
        reach: 'Reach & universe',
        pacing: 'Dates & pacing',
      },
      fields: {
        currency: 'Currency',
        budget: 'Total budget',
        cpm: 'CPM',
        ctr: 'CTR %',
        vtr: 'VTR %',
        viewability: 'Viewability %',
        presets: 'Universe presets',
        avgFreq: 'Average frequency',
        audienceSize: 'Universe size',
        reachModel: 'Reach model',
        start: 'Start',
        end: 'End',
        pacing: 'Pacing',
      },
      helper: {
        poissonInfo: 'Poisson reflects expected duplication, Simple divides impressions by the average frequency.',
        pacingEven: 'Even pacing across {{days}} day(s).',
        pacingCustom: 'Custom pacing, current total {{sum}}%.',
        pacingDisabled: 'Add start and end dates to enable pacing.',
      },
      campaignDays: 'Campaign days, {{count}}',
      reachModelOptions: {
        Poisson: 'Poisson',
        Simple: 'Simple',
      },
      pacingOptions: {
        Even: 'Even',
        Custom: 'Custom',
      },
    },
    customPacing: {
      title: 'Custom budget pacing',
      subtitle: 'Adjust daily percentages (must total 100%).',
      reset: 'Distribute evenly',
      table: {
        date: 'Date',
        share: 'Share of budget',
      },
      total: 'Total: {{value}}%',
    },
    summary: {
      cards: {
        impressions: {
          title: 'Estimated impressions',
          subtitle: 'Cumulative budget, {{value}}',
        },
        clicks: {
          title: 'Estimated clicks',
          subtitle: 'eCPC, {{value}}',
        },
        completeViews: {
          title: 'Completed views',
          subtitle: 'eCPCV, {{value}}',
        },
        viewable: {
          title: 'Viewable impressions',
          subtitle: 'vCPM, {{value}}',
        },
      },
    },
    reachSummary: {
      reachTitle: 'Estimated cumulative reach',
      reachPct: '{{value}}',
      frequencyTitle: 'Observed average frequency',
      frequencyGrps: 'Estimated GRPs, {{grps}}',
      daysTitle: 'Campaign days',
      pacingMode: 'Pacing, {{mode}}',
    },
    inversion: {
      title: 'Impression goal & required budget',
      targetLabel: 'Target impressions',
      budgetLabel: 'Estimated required budget',
      cpmNote: 'Assuming CPM {{value}}',
    },
    export: {
      title: 'Daily export',
      description: 'Download the CSV with budget, impressions, incremental and cumulative reach.',
      button: 'Export CSV',
    },
    dailyTable: {
      title: 'Daily pacing & reach',
      rowsCount: '{{count}} row(s)',
      headers: {
        date: 'Date',
        budget: 'Budget {{currency}}',
        impressions: 'Impressions',
        incrReach: 'Incremental reach',
        cumReach: 'Cumulative reach',
      },
      empty: 'Enter dates and a budget to see the daily breakdown.',
    },
    tests: {
      title: 'Built-in checks',
      show: 'Show',
      ok: 'OK',
      ko: 'Fail',
      names: {
        daysBetweenSameDay: 'daysBetweenInclusive same day',
        daysBetweenThreeDays: 'daysBetweenInclusive 3 days',
        distributeEvenSum: 'distributeEven sum',
        distributeEvenLength: 'distributeEven length',
        baseImpressions: 'base impressions',
        poissonReachRange: 'Poisson reach within range',
        poissonGrpIdentity: 'Poisson GRP identity',
      },
    },
    notes: {
      paragraph1: 'Notes: the Poisson model assumes impressions are randomly distributed in the universe, reach is N × (1 − exp(−I/N)). The Simple model estimates reach as impressions divided by the average frequency. Adjust frequency and universe size to match your context.',
      paragraph2: 'Works for video and display, CTR, VTR and viewability are configurable. GRPs are computed as Reach% × observed average frequency.',
    },
    pacingModes: {
      Even: 'Even',
      Custom: 'Custom',
    },
    errors: {
      budgetPositive: 'Total budget must be a positive number.',
      cpmPositive: 'CPM must be a positive number.',
      ctrRange: 'CTR must be between 0 and 100%.',
      vtrRange: 'VTR must be between 0 and 100%.',
      viewabilityRange: 'Viewability must be between 0 and 100%.',
      avgFreqPositive: 'Average frequency must be > 0.',
      audiencePositive: 'Universe size must be > 0.',
      dateOrder: 'End date must be after or equal to the start date.',
      targetImprValid: 'Target impressions must be a valid number.',
      customShares: 'Pacing percentages must total 100% (currently {{sum}}%).',
    },
  },
};

function formatMessage(template, params = {}) {
  if (typeof template !== 'string') {
    return '';
  }
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : match
  ));
}

function getFromDictionary(language, key) {
  const dictionary = TRANSLATIONS[language] ?? {};
  const segments = key.split('.');
  let current = dictionary;
  for (const segment of segments) {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
    } else {
      return undefined;
    }
  }
  return current;
}

const LocaleContext = createContext({
  language: 'fr',
  setLanguage: () => {},
  t: (key, params) => formatMessage(key, params),
});

export function LocaleProvider({ language, setLanguage, children }) {
  const translator = useCallback((key, params = {}) => {
    const value = getFromDictionary(language, key);
    if (typeof value === 'string') {
      return formatMessage(value, params);
    }
    return key;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t: translator,
  }), [language, setLanguage, translator]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function resolveMessage(descriptor, t) {
  if (!descriptor) {
    return '';
  }
  if (typeof descriptor === 'string') {
    return t(descriptor);
  }
  if (typeof descriptor === 'object' && descriptor.key) {
    return t(descriptor.key, descriptor.params);
  }
  return '';
}

export { TRANSLATIONS };
