import { redirect } from 'next/navigation';

export default async function FacilityEntryPage({
  params,
}: {
  params: Promise<{ facility: string }>;
}) {
  const { facility } = await params;
  redirect(`/snf?partner=${encodeURIComponent(facility)}`);
}
