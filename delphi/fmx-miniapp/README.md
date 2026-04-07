# Mini-appli Windows (FMX) — Checklist (Delphi 12 CE)

Objectif : mini appli **FireMonkey** Windows avec une **checklist** et une **sauvegarde JSON locale**.

## Fichiers

- `MiniChecklist.dpr` : point d’entrée
- `MainForm.pas` : UI + logique (UI construite en code, pas de `.fmx`)

## Utilisation (Delphi / RAD Studio)

1. Ouvre `MiniChecklist.dpr` dans Delphi.
2. Choisis la cible **Windows 64-bit** (ou Win32 si besoin).
3. Build/Run.

Le fichier de sauvegarde est créé dans tes Documents :
- `%USERPROFILE%\Documents\XtralogFmxMiniapp\checklist.json`
