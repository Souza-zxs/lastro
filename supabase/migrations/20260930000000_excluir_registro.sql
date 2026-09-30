-- Permite ao usuário excluir os próprios registros direto (sem RPC — não
-- mexe em crédito, então não precisa da atomicidade que criar_registro
-- exige). O crédito usado não é devolvido, pra não abrir brecha de
-- registrar/excluir/registrar de novo grátis. Exclusão em cascata já
-- remove os alertas de uso indevido ligados a esse registro (FK
-- `on delete cascade` em alertas_uso_indevido, ver core_schema).

create policy "usuarios removem os proprios registros"
  on registros for delete
  using (auth.uid() = user_id);

grant delete on registros to authenticated;
