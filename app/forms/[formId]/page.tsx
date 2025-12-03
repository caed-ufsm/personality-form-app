// app/forms/[formId]/page.tsx (SERVER)
import { notFound } from "next/navigation";
import FormPageClient from "./FormPageClient";
import { getFormDefinition } from "../lib/registry";

export default async function Page({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  const def = getFormDefinition(formId);
  if (!def) notFound();

  return <FormPageClient formId={formId} def={def} />;
}
