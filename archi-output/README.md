# Archi Output — Les Gants Méléciens

Générés le 2026-05-17 par le skill `archi-mapper`.

## Livrables

| Fichier | Description |
|---------|-------------|
| [architecture.mmd](architecture.mmd) | Diagramme Mermaid — 5 vues (globale, parcours adhérent, parcours essayant, parcours admin, ERD) |
| [rapport-etonnement.md](rapport-etonnement.md) | Rapport d'étonnement — 8 points d'attention, dettes techniques, questions ouvertes |
| [PROJECT_MEMORY.md](PROJECT_MEMORY.md) | Mémoire projet — contexte structuré pour skills suivants (test-planner, ci-cd-setup) |

## Utilisation

Ces fichiers servent de contexte partagé pour les skills suivants :
- `/test-planner` — lit `PROJECT_MEMORY.md` pour définir les campagnes de test
- `/ci-cd-setup` — lit `PROJECT_MEMORY.md` pour configurer le pipeline CI/CD
- `/add-feature` — lit `PROJECT_MEMORY.md` pour comprendre l'architecture avant d'implémenter

## Visualiser le diagramme Mermaid

- VS Code : extension **Mermaid Preview** ou **Markdown Preview Enhanced**
- En ligne : [mermaid.live](https://mermaid.live)
- GitHub : le fichier `.mmd` est rendu automatiquement dans les README
