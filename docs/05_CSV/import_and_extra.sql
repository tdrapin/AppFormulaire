-- Script d'import et inserts supplémentaires
-- Usage (psql) :
-- psql "CONNECTION_URL" -f docs/05_CSV/import_and_extra.sql

BEGIN;

-- === INSERT: formulaires existants (depuis CSV) ===
INSERT INTO public.formulaires (id, nom, schema_json, gabarit_actif_id, version, created_at)
VALUES
('00000000-0000-0000-0000-000000000001', 'Rapport d''intervention', $$
{"sections":[{"id":"sec1","title":"Informations générales","fields":[{"id":"client","label":"Nom du client","type":"text","required":true},{"id":"date","label":"Date d'intervention","type":"date","required":true}]},{"id":"sec2","title":"Détails","fields":[{"id":"description","label":"Description","type":"textarea","required":true},{"id":"priorite","label":"Priorité","type":"text","required":false}]}],"templates":[{"id":"default","name":"Gabarit standard","layout":{"rows":[],"settings":{"font":"Arial","labelSize":"12px","primaryColor":"#007bff","headerTitle":"Rapport d'intervention","headerSubtitle":"Document terrain","showDate":true,"showHeader":true,"colGap":10,"rowGap":10,"orientation":"portrait","marginMm":15}}}]}
$$, 'default', 1, '2026-05-26T00:00:00Z'),
('00000000-0000-0000-0000-000000000002', 'Checklist sécurité', $$
{"sections":[{"id":"sec1","title":"Équipement","fields":[{"id":"equipement","label":"Nom équipement","type":"text","required":true},{"id":"date_controle","label":"Date contrôle","type":"date","required":true}]},{"id":"sec2","title":"Points de contrôle","fields":[{"id":"conforme","label":"Conforme ?","type":"text","required":true},{"id":"remarques","label":"Remarques","type":"textarea","required":false}]}],"templates":[{"id":"default","name":"Gabarit sécurité","layout":{"rows":[],"settings":{"font":"Arial","labelSize":"12px","primaryColor":"#dc3545","headerTitle":"Checklist sécurité","headerSubtitle":"Document terrain","showDate":true,"showHeader":true,"colGap":10,"rowGap":10,"orientation":"portrait","marginMm":15}}}]}
$$, 'default', 1, '2026-05-26T00:00:00Z');

-- === INSERT: formulaires supplémentaires ===
INSERT INTO public.formulaires (id, nom, schema_json, gabarit_actif_id, version, created_at)
VALUES
('00000000-0000-0000-0000-000000000003', 'Inspection électrique', $$
{"sections":[{"id":"sec1","title":"Éléments inspectés","fields":[{"id":"circuit","label":"Circuit","type":"text","required":true},{"id":"etat","label":"État","type":"text","required":true}]},{"id":"sec2","title":"Commentaires","fields":[{"id":"remarques","label":"Remarques","type":"textarea","required":false}]}],"templates":[{"id":"default","name":"Gabarit inspection","layout":{"rows":[],"settings":{"font":"Arial","labelSize":"12px","primaryColor":"#f59e0b","headerTitle":"Inspection électrique","headerSubtitle":"Checklist technique","showDate":true,"showHeader":true,"colGap":10,"rowGap":10,"orientation":"portrait","marginMm":15}}}]}
$$, 'default', 1, '2026-06-01T00:00:00Z'),
('00000000-0000-0000-0000-000000000004', 'Rapport visite client', $$
{"sections":[{"id":"sec1","title":"Client","fields":[{"id":"client","label":"Nom client","type":"text","required":true},{"id":"contact","label":"Contact","type":"text","required":false}]},{"id":"sec2","title":"Visite","fields":[{"id":"objectifs","label":"Objectifs","type":"textarea","required":true},{"id":"suivi","label":"Suivi prévu","type":"text","required":false}]}],"templates":[{"id":"default","name":"Gabarit visite","layout":{"rows":[],"settings":{"font":"Arial","labelSize":"12px","primaryColor":"#3b82f6","headerTitle":"Rapport visite client","headerSubtitle":"Compte-rendu","showDate":true,"showHeader":true,"colGap":10,"rowGap":10,"orientation":"portrait","marginMm":15}}}]}
$$, 'default', 1, '2026-06-02T00:00:00Z');

-- === INSERT: instances existantes (depuis CSV) ===
INSERT INTO public.instances (id, formulaire_id, donnees_json, nom, created_at)
VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', $$ {"client":"Dupont","date":"2026-05-26","description":"Maintenance préventive","priorite":"Haute"} $$, 'Rapport_20260526_001', '2026-05-26T08:00:00Z'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', $$ {"client":"Martin","date":"2026-05-25","description":"Réparation urgence","priorite":"Critique"} $$, 'Rapport_20260525_002', '2026-05-25T14:30:00Z'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', $$ {"client":"Bernard","date":"2026-05-24","description":"Installation nouvel équipement","priorite":"Normale"} $$, 'Rapport_20260524_003', '2026-05-24T10:00:00Z'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', $$ {"equipement":"Extincteur A","date_controle":"2026-05-26","conforme":"Oui","remarques":"Aucune anomalie"} $$, 'Checklist_20260526_001', '2026-05-26T09:00:00Z'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', $$ {"equipement":"Porte coupe-feu","date_controle":"2026-05-25","conforme":"Non","remarques":"Réparation nécessaire"} $$, 'Checklist_20260525_002', '2026-05-25T16:00:00Z');

-- === INSERT: instances supplémentaires liées aux nouveaux formulaires ===
INSERT INTO public.instances (id, formulaire_id, donnees_json, nom, created_at)
VALUES
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', $$ {"circuit":"Q1","etat":"OK","remarques":"Aucun défaut"} $$, 'Inspection_20260601_001', '2026-06-01T09:30:00Z'),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', $$ {"circuit":"Q2","etat":"A réparer","remarques":"Câble endommagé"} $$, 'Inspection_20260601_002', '2026-06-01T11:00:00Z'),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000004', $$ {"client":"Société X","contact":"Mme Durand","objectifs":"Présentation produit","suivi":"Rappel sous 7 jours"} $$, 'Visite_20260602_001', '2026-06-02T14:00:00Z');

COMMIT;

-- Fin du script
