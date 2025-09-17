// NÃO coloque "use client" aqui
import FormPageClient from "./FormPageClient";
import { getFormDefinition } from "../lib/registry";

export default async function Page({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const def = getFormDefinition(formId); // só dados, serializável

  return <FormPageClient formId={formId} def={def} />;
}
