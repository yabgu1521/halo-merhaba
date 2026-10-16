import { notFound } from "next/navigation";
import { isLocale, copy } from "@/lib/i18n";
import { ownProfile } from "@/lib/member/own-profile";
import { ProfileForm } from "@/components/member/profile-form";
import { BlockButton } from "@/components/member/controls";
import { memberCopy } from "@/lib/member/i18n";
export default async function Profile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { initial, photo, options, context, contextAvailable, db } =
      await ownProfile(locale),
    c = memberCopy[locale];
  const { data: blocks, error } = await db.rpc("my_blocks");
  if (error) throw new Error("Member data unavailable");
  return (
    <>
      <ProfileForm
        locale={locale}
        initial={initial}
        initialPhoto={photo}
        initialContext={context}
        contextAvailable={contextAvailable}
        catalog={options}
        safetyRules={copy[locale].safetyRules}
      />
      <section className="blocked-panel">
        <h2>{c.blocked}</h2>
        <p>{c.blockHelp}</p>
        {!blocks?.length && <p>{c.noBlocks}</p>}
        {blocks?.map((b: { profile_id: string; display_name: string }) => (
          <div className="blocked-row" key={b.profile_id}>
            <span>{b.display_name}</span>
            <BlockButton id={b.profile_id} locale={locale} remove />
          </div>
        ))}
      </section>
    </>
  );
}
