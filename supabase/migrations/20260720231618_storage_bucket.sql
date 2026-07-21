-- Bucket público para as thumbnails geradas no navegador (o arquivo original
-- nunca é enviado). Nesta migration o upload ainda só acontecia via
-- service-role key (bypassa RLS); a migration de auth (20260720232000)
-- passou a permitir upload direto pelo usuário autenticado e adicionou a
-- policy correspondente em storage.objects.
insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;
