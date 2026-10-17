import "server-only";

/** Private object identifiers only. Never import this module into a Client Component,
 * return it in page props/API responses, or serialize it into HTML/JSON-LD.
 * Existence is recorded from the owner's upload confirmation; it grants no access.
 */
export type PrivateProductAsset = Readonly<{
  locale: "id" | "tr";
  bucket: "halo-digital-products";
  path: string;
  format: "PDF";
}>;
export const privateProductAssets = {
  "marriage-checklist-wni": [
    {
      locale: "id",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Menikah_di_Turkiye_Complete_Checklist_ID.pdf",
      format: "PDF",
    },
    {
      locale: "tr",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Turkiyede_Evlilik_Tam_Hazirlik_Rehberi_TR.pdf",
      format: "PDF",
    },
  ],
  "document-apostille-organizer": [
    {
      locale: "id",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Dokumen_Apostille_Organizer_ID.pdf",
      format: "PDF",
    },
    {
      locale: "tr",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Belge_Apostil_Duzenleyici_TR.pdf",
      format: "PDF",
    },
  ],
  "turkish-a1-survival": [
    {
      locale: "id",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Turkce_A1_Survival_Pack_ID.pdf",
      format: "PDF",
    },
    {
      locale: "tr",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Turkce_A1_Gunluk_Yasam_Paketi_TR.pdf",
      format: "PDF",
    },
  ],
  "family-meeting-toolkit": [
    {
      locale: "id",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Pertemuan_Keluarga_Indonesia_Turkiye_Toolkit_ID.pdf",
      format: "PDF",
    },
    {
      locale: "tr",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Endonezya_Turkiye_Aile_Tanisma_Rehberi_TR.pdf",
      format: "PDF",
    },
  ],
  "marriage-preparation-workbook": [
    {
      locale: "id",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Persiapan_Nikah_Indonesia_Turkiye_Workbook_ID_v2.pdf",
      format: "PDF",
    },
    {
      locale: "tr",
      bucket: "halo-digital-products",
      path: "Halo_Merhaba_Endonezya_Turkiye_Evlilik_Hazirlik_Workbook_TR_v2.pdf",
      format: "PDF",
    },
  ],
} as const satisfies Record<string, readonly PrivateProductAsset[]>;

// Fail closed for unknown products/locales. This is a metadata lookup, not a downloader.
export function getPrivateProductAsset(
  productId: string,
  locale: string,
): PrivateProductAsset | null {
  if (!Object.hasOwn(privateProductAssets, productId)) return null;
  const assets =
    privateProductAssets[productId as keyof typeof privateProductAssets];
  return assets.find((asset) => asset.locale === locale) || null;
}

/** Future delivery boundary (intentionally NOT implemented):
 * 1. Authenticate on the server and verify a real purchase/explicit entitlement there.
 * 2. Require server-controlled download_enabled=true; content_ready alone is insufficient.
 * 3. Resolve only the exact product+edition from this allowlist, never a client-supplied path.
 * 4. Verify the bucket is still private and the object exists before signing.
 * 5. Issue a URL for this one object with a short TTL (e.g. 60 seconds), no-store response.
 * No public endpoint, Storage access, signed URL generation or payment flow exists here.
 */
