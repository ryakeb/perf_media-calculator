/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo } from 'react';

const TRANSLATIONS = {
  fr: {
    app: {
      title: 'Estimateur de performance média',
      description: "Accélère la préparation de tes recommandations, calcule impressions, clics, CPM, VTR, viewability et reach projeté sur toute la campagne.",
      switchToEnglish: 'Passer en anglais',
      switchToFrench: 'Passer en français',
      switchToDark: 'Passer en mode sombre',
      switchToLight: 'Passer en mode clair',
    },
    home: {
      brand: 'media.wecommit.be',
      title: 'Tous les outils internes WeCommit à portée de clic.',
      subtitle: 'Sélectionnez un module pour optimiser vos performances média ou accélérer la production créative.',
      cardCta: 'Accéder à l’outil →',
      cards: {
        kpi: {
          title: 'Calculateur KPI / Reach',
          description: 'Planifiez vos campagnes en quelques minutes avec un modèle flexible et des exports prêts à envoyer.',
          badge: 'Performance média',
        },
        gif: {
          title: 'Convertisseur MP4 → GIF',
          description: 'Chargez une courte vidéo, nous générons automatiquement un GIF optimisé à partager partout.',
          badge: 'Outil image',
        },
        percentage: {
          title: 'Calculateur de pourcentages',
          description: 'Des mini-outils pour calculer rapidement des variations, parts et ajustements sur tes montants.',
          badge: 'Raccourci chiffrage',
        },
        svgPng: {
          title: 'Convertisseur SVG → PNG',
          description: 'Transforme tes assets vectoriels en PNG nets, échelle ajustable pour garder la qualité.',
          badge: 'Outil image',
        },
        bgRemover: {
          title: 'Suppression de fond',
          description: 'Retire un fond blanc ou uni et récupère un PNG transparent en quelques secondes.',
          badge: 'Retouche express',
        },
      },
    },
    converter: {
      backLink: '← Retour aux outils',
      title: 'Convertisseur MP4 → GIF',
      description: 'Conversion 100 % navigateur : importez un MP4 (30s max conseillées) et récupérez un GIF optimisé sans quitter media.wecommit.be.',
      bullets: {
        quality: 'Aucune option à régler : framerate 12 FPS et largeur 480 px par défaut.',
        trimmed: 'Si la vidéo dépasse 30 secondes, nous convertissons uniquement les 30 premières secondes.',
        privacy: 'Rien ne part sur un serveur : tout reste dans votre navigateur.',
      },
      uploadLabel: 'Sélectionnez votre fichier MP4',
      durationAndSize: 'Durée détectée : {{duration}} · Taille recommandée <= 200 Mo',
      button: {
        loadingCore: 'Chargement du moteur…',
        converting: 'Conversion en cours…',
        idle: 'Convertir en GIF',
      },
      info: {
        trimmed: 'Votre vidéo dépasse 30 s. Nous avons converti uniquement les 30 premières secondes.',
        ready: 'GIF prêt à télécharger.',
      },
      errors: {
        metadata: 'Impossible de lire la durée de la vidéo. Merci de réessayer avec un MP4 valide.',
        noFile: 'Sélectionnez une vidéo MP4 avant de lancer la conversion.',
        runtime: 'La conversion a échoué. Essayez avec un autre fichier ou réduisez la taille de la vidéo.',
      },
      previewTitle: 'Aperçu & téléchargement',
      previewAlt: 'Prévisualisation du GIF converti',
      downloadCta: 'Télécharger le GIF',
    },
    svgConverter: {
      title: 'Convertisseur SVG → PNG',
      description: 'Importe un SVG vectoriel, choisis le facteur d’échelle et récupère un PNG net prêt à partager.',
      bullets: {
        quality: 'Préserve la netteté vectorielle, échelle réglable de 1 à 4.',
        background: 'Garde la transparence ou ajoute un fond uni de ton choix.',
        privacy: 'Traitement 100 % navigateur : aucun upload vers un serveur.',
      },
      uploadLabel: 'Sélectionne ton fichier SVG',
      detectedSize: 'Dimensions détectées : {{width}} × {{height}} px',
      detectedSizeUnknown: 'Dimensions non détectées (par défaut 1024 px).',
      scaleLabel: 'Échelle de sortie',
      scaleHint: 'PNG généré : {{width}} × {{height}} px',
      backgroundLabel: 'Fond',
      backgroundOptions: {
        transparent: 'Transparent',
        color: 'Couleur unie',
      },
      colorLabel: 'Couleur du fond',
      button: {
        processing: 'Rendu en cours…',
        idle: 'Générer le PNG',
      },
      errors: {
        noFile: 'Charge un fichier SVG avant de lancer la conversion.',
        parse: 'Impossible de lire ce SVG. Vérifie que le fichier est valide.',
        render: 'Le rendu PNG a échoué. Réessaie avec un autre fichier.',
      },
      info: {
        ready: 'PNG prêt à télécharger.',
      },
      previewTitle: 'Aperçu & téléchargement',
      previewAlt: 'Aperçu du PNG généré',
      downloadCta: 'Télécharger le PNG',
    },
    bgRemover: {
      title: 'Suppression de fond (PNG)',
      description: 'Charge une image, clique sur la couleur du fond, ajuste la tolérance et récupère un PNG transparent.',
      bullets: {
        detect: 'Couleur dominante des bords détectée automatiquement (modifiable au pipette).',
        tolerance: 'Tolérance réglable pour protéger les détails fins et le texte.',
        privacy: 'Traitement 100 % navigateur : aucun upload, tes visuels restent locaux.',
      },
      uploadLabel: 'Sélectionne ton image (PNG, JPG, WebP)',
      detectedColor: 'Couleur cible',
      pickInstruction: 'Clique dans l’image originale pour pipeter la couleur à supprimer.',
      toleranceLabel: 'Tolérance de suppression',
      toleranceHint: 'Augmente si des zones restent visibles, diminue si le sujet se perce.',
      button: {
        processing: 'Nettoyage…',
        idle: 'Supprimer le fond',
      },
      errors: {
        noFile: 'Charge une image avant de lancer la suppression.',
        parse: 'Impossible de lire ce fichier. Essaie avec un PNG, JPG ou WebP.',
        render: 'Le rendu transparent a échoué. Réessaie avec une autre image.',
      },
      info: {
        ready: 'PNG sans fond prêt à télécharger.',
      },
      previewTitle: 'Aperçu & téléchargement',
      previewAlt: 'Aperçu du PNG sans fond',
      downloadCta: 'Télécharger le PNG',
      previewPlaceholder: 'Lance le traitement pour voir le résultat.',
      emptyState: 'Charge une image pour commencer.',
      original: 'Image originale',
      originalAlt: 'Aperçu de l’image originale',
      dimensions: 'Dimensions détectées : {{width}} × {{height}} px',
    },
    percentageTool: {
      title: 'Calculateur de pourcentages express',
      description: 'Quatre mini-outils pour calculer rapidement un pourcentage, une part, une variation ou une hausse/baisse de budget sans ouvrir de tableur.',
      bullets: {
        quick: 'Pensé pour les réponses rapides : deux champs suffisent pour obtenir un résultat.',
        variations: 'Gère autant les parts (%) que les variations positives/négatives.',
        cleanUi: 'Interface épurée, résultats lisibles en un coup d’œil.',
      },
      cards: {
        percentOf: {
          title: 'Combien fait X % de…',
          subtitle: 'Exemple : 20% de 8850.',
          percentLabel: 'Pourcentage',
          baseLabel: 'Montant de base',
          resultLabel: 'Résultat',
        },
        share: {
          title: 'Quelle part représente…',
          subtitle: 'Calcule le pourcentage que représente une valeur par rapport au total.',
          partLabel: 'Valeur partielle',
          totalLabel: 'Total',
          resultLabel: 'Part en %',
        },
        adjust: {
          title: 'Augmenter / réduire un montant',
          subtitle: 'Applique une variation pour simuler un budget ou un KPI ajusté.',
          increase: 'Augmenter',
          decrease: 'Réduire',
          baseLabel: 'Montant initial',
          changeLabel: 'Variation %',
          resultLabel: 'Montant ajusté',
          deltaUp: 'Gain : {{value}}',
          deltaDown: 'Perte : {{value}}',
          deltaPlaceholder: 'Saisis une variation pour voir l’écart.',
        },
        change: {
          title: 'Variation entre deux valeurs',
          subtitle: 'Pourcentage d’évolution entre un avant et un après.',
          fromLabel: 'Valeur de départ',
          toLabel: 'Valeur d’arrivée',
          resultLabel: 'Variation %',
        },
      },
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
        costType: "Type de coût",
        cpm: 'CPM',
        cpc: 'CPC',
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
        presetsHint: 'Ouvre la liste et coche un ou plusieurs univers pour cumuler leur reach.',
        presetsButtonEmpty: 'Sélectionne un univers',
        presetsButtonCustom: 'Univers personnalisé · {{uu}} UU',
        presetsButtonMultiple: '{{count}} univers sélectionnés',
        presetsTotalsCustom: 'Univers personnalisé : {{uu}} UU.',
        presetsTotalsWithPv: 'Univers sélectionnés : {{uu}} UU et {{pv}} PV.',
        presetsTotalsNoPv: 'Univers sélectionnés : {{uu}} UU.',
      },
      campaignDays: 'Jours de campagne, {{count}}',
      costTypeOptions: {
        CPM: 'CPM',
        CPC: 'CPC',
      },
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
      costNote: 'Hypothèse, {{label}}, {{value}}',
    },
    export: {
      title: 'Export journalier',
      description: 'Télécharge le CSV avec budget, impressions, reach incrémental et cumulé.',
      button: 'Exporter CSV',
    },
    dailyTable: {
      title: 'Pacing et reach par jour',
      rowsCount: '{{count}} ligne(s)',
      showDetails: 'Afficher le détail',
      hideDetails: 'Masquer le détail',
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
      cpcPositive: 'CPC doit être un nombre positif.',
      cpcCtrRequired: 'CPC nécessite un CTR strictement positif.',
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
      switchToDark: 'Switch to dark mode',
      switchToLight: 'Switch to light mode',
    },
    home: {
      brand: 'media.wecommit.be',
      title: 'Every internal WeCommit tool at your fingertips.',
      subtitle: 'Pick a module to boost media performance or speed up creative production.',
      cardCta: 'Open tool →',
      cards: {
        kpi: {
          title: 'KPI / Reach Calculator',
          description: 'Plan your campaigns in minutes with a flexible model and share-ready exports.',
          badge: 'Media performance',
        },
        gif: {
          title: 'MP4 → GIF Converter',
          description: 'Upload a short video, we instantly generate a high quality GIF you can share anywhere.',
          badge: 'Image tool',
        },
        percentage: {
          title: 'Percentage calculator',
          description: 'Quick helpers to compute shares, variations, and adjusted amounts without a spreadsheet.',
          badge: 'Math shortcut',
        },
        svgPng: {
          title: 'SVG → PNG Converter',
          description: 'Turn vector assets into crisp PNGs with adjustable scale.',
          badge: 'Image tool',
        },
        bgRemover: {
          title: 'Background remover',
          description: 'Strip white or solid backgrounds and export a transparent PNG in seconds.',
          badge: 'Quick retouch',
        },
      },
    },
    converter: {
      backLink: '← Back to tools',
      title: 'MP4 → GIF Converter',
      description: 'Browser-only conversion: upload an MP4 (30 s max recommended) and get an optimized GIF without leaving media.wecommit.be.',
      bullets: {
        quality: 'Zero settings to tweak: we default to 12 FPS and 480 px width.',
        trimmed: 'If the video is longer than 30 seconds, only the first 30 seconds will be converted.',
        privacy: 'No upload to a server: everything stays inside your browser.',
      },
      uploadLabel: 'Select your MP4 file',
      durationAndSize: 'Detected duration: {{duration}} · Recommended size <= 200 MB',
      button: {
        loadingCore: 'Loading engine…',
        converting: 'Converting…',
        idle: 'Convert to GIF',
      },
      info: {
        trimmed: 'Your video is over 30 s. Only the first 30 seconds have been converted.',
        ready: 'GIF ready to download.',
      },
      errors: {
        metadata: 'We could not read the video duration. Please try again with a valid MP4.',
        noFile: 'Select an MP4 before starting the conversion.',
        runtime: 'Conversion failed. Try another file or reduce the video size.',
      },
      previewTitle: 'Preview & download',
      previewAlt: 'Preview of the converted GIF',
      downloadCta: 'Download GIF',
    },
    svgConverter: {
      title: 'SVG → PNG Converter',
      description: 'Import an SVG, pick a scale factor, and get a sharp PNG ready to share.',
      bullets: {
        quality: 'Keeps vector sharpness with a scale range from 1 to 4.',
        background: 'Keep transparency or add a solid background color.',
        privacy: 'Browser-only processing; nothing leaves your computer.',
      },
      uploadLabel: 'Select your SVG file',
      detectedSize: 'Detected dimensions: {{width}} × {{height}} px',
      detectedSizeUnknown: 'Could not detect dimensions (defaulting to 1024 px).',
      scaleLabel: 'Output scale',
      scaleHint: 'Estimated PNG: {{width}} × {{height}} px',
      backgroundLabel: 'Background',
      backgroundOptions: {
        transparent: 'Keep transparent',
        color: 'Solid color',
      },
      colorLabel: 'Background color',
      button: {
        processing: 'Rendering…',
        idle: 'Generate PNG',
      },
      errors: {
        noFile: 'Load an SVG file before starting the conversion.',
        parse: 'We could not read this SVG. Please check the file is valid.',
        render: 'PNG rendering failed. Try again with another file.',
      },
      info: {
        ready: 'PNG ready to download.',
      },
      previewTitle: 'Preview & download',
      previewAlt: 'Preview of the generated PNG',
      downloadCta: 'Download PNG',
    },
    bgRemover: {
      title: 'Background remover (PNG)',
      description: 'Load an image, click the background color, tweak tolerance, and export a transparent PNG.',
      bullets: {
        detect: 'Automatically samples the dominant edge color (you can override it with the eyedropper).',
        tolerance: 'Adjustable tolerance to preserve fine details and text.',
        privacy: '100% in-browser processing: no uploads, your assets stay local.',
      },
      uploadLabel: 'Select your image (PNG, JPG, WebP)',
      detectedColor: 'Target color',
      pickInstruction: 'Click inside the original image to pick the color to remove.',
      toleranceLabel: 'Removal tolerance',
      toleranceHint: 'Raise it if background remains, lower it if holes appear in the subject.',
      button: {
        processing: 'Cleaning…',
        idle: 'Remove background',
      },
      errors: {
        noFile: 'Load an image before starting the cleanup.',
        parse: 'We could not read this file. Try a PNG, JPG, or WebP.',
        render: 'Transparent rendering failed. Try again with another image.',
      },
      info: {
        ready: 'Transparent PNG ready to download.',
      },
      previewTitle: 'Preview & download',
      previewAlt: 'Preview of the background-free PNG',
      downloadCta: 'Download PNG',
      previewPlaceholder: 'Run the cleanup to see the result.',
      emptyState: 'Upload an image to get started.',
      original: 'Original image',
      originalAlt: 'Preview of the original image',
      dimensions: 'Detected dimensions: {{width}} × {{height}} px',
    },
    percentageTool: {
      title: 'Quick percentage helpers',
      description: 'Four mini-utilities to compute a percentage, a share of a total, a variation, or an adjusted budget without opening a spreadsheet.',
      bullets: {
        quick: 'Built for quick answers: two fields are enough to get a result.',
        variations: 'Handles shares (%) as well as positive or negative variations.',
        cleanUi: 'Clean interface with instantly readable outputs.',
      },
      cards: {
        percentOf: {
          title: 'How much is X % of…',
          subtitle: 'Example: 20% of 8850.',
          percentLabel: 'Percentage',
          baseLabel: 'Base amount',
          resultLabel: 'Result',
        },
        share: {
          title: 'What share does this represent?',
          subtitle: 'Compute the percentage a value represents out of a total.',
          partLabel: 'Partial value',
          totalLabel: 'Total',
          resultLabel: 'Share %',
        },
        adjust: {
          title: 'Increase / decrease an amount',
          subtitle: 'Apply a variation to simulate an adjusted budget or KPI.',
          increase: 'Increase',
          decrease: 'Decrease',
          baseLabel: 'Starting amount',
          changeLabel: 'Change %',
          resultLabel: 'Adjusted amount',
          deltaUp: 'Gain: {{value}}',
          deltaDown: 'Loss: {{value}}',
          deltaPlaceholder: 'Enter a variation to see the delta.',
        },
        change: {
          title: 'Change between two values',
          subtitle: 'Percentage variation between before and after.',
          fromLabel: 'From',
          toLabel: 'To',
          resultLabel: 'Change %',
        },
      },
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
        costType: 'Cost type',
        cpm: 'CPM',
        cpc: 'CPC',
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
        presetsHint: 'Open the list and tick one or more universes to stack their reach.',
        presetsButtonEmpty: 'Select a universe',
        presetsButtonCustom: 'Custom universe · {{uu}} UU',
        presetsButtonMultiple: '{{count}} universes selected',
        presetsTotalsCustom: 'Custom universe: {{uu}} UU.',
        presetsTotalsWithPv: 'Selected presets add up to {{uu}} UU and {{pv}} PV.',
        presetsTotalsNoPv: 'Selected presets add up to {{uu}} UU.',
      },
      campaignDays: 'Campaign days, {{count}}',
      costTypeOptions: {
        CPM: 'CPM',
        CPC: 'CPC',
      },
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
      costNote: 'Assuming {{label}} {{value}}',
    },
    export: {
      title: 'Daily export',
      description: 'Download the CSV with budget, impressions, incremental and cumulative reach.',
      button: 'Export CSV',
    },
    dailyTable: {
      title: 'Daily pacing & reach',
      rowsCount: '{{count}} row(s)',
      showDetails: 'Show details',
      hideDetails: 'Hide details',
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
      cpcPositive: 'CPC must be a positive number.',
      cpcCtrRequired: 'CPC requires a strictly positive CTR.',
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
  language: 'en',
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
