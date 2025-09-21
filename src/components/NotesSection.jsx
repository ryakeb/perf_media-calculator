import React from 'react';

export default function NotesSection() {
  return (
    <section className="mt-6 text-xs text-slate-500 space-y-2">
      <p>
        <span className="font-semibold">Notes</span>, le modèle Poisson suppose une distribution aléatoire des impressions sur l'univers,
        la formule de reach cumulé est N × (1 − exp(−I/N)). Le modèle Simple estime le reach comme impressions divisées par la fréquence moyenne.
        Ajuste la fréquence moyenne et la taille d'univers pour coller à ton contexte.
      </p>
      <p>
        Ce calculateur fonctionne pour vidéo et display, CTR, VTR et viewability paramétrables.
        Les GRPs affichés sont calculés comme Reach% × Fréquence moyenne observée.
      </p>
    </section>
  );
}

