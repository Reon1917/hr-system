export const companyLocalePresets = [
  {
    id: "thb-bangkok",
    label: "Thai Baht",
    currencyCode: "THB",
    timezone: "Asia/Bangkok",
    locationLabel: "Bangkok, Thailand",
  },
  {
    id: "usd-new-york",
    label: "US Dollar",
    currencyCode: "USD",
    timezone: "America/New_York",
    locationLabel: "New York, United States",
  },
  {
    id: "mmk-yangon",
    label: "Myanmar Kyat",
    currencyCode: "MMK",
    timezone: "Asia/Yangon",
    locationLabel: "Yangon, Myanmar",
  },
] as const;

export type CompanyLocalePreset = (typeof companyLocalePresets)[number];
export type CompanyLocalePresetId = CompanyLocalePreset["id"];

export const defaultCompanyLocalePreset = companyLocalePresets[0];

export function isCompanyLocalePresetId(
  value: string,
): value is CompanyLocalePresetId {
  return companyLocalePresets.some((preset) => preset.id === value);
}

export function getCompanyLocalePresetById(id: CompanyLocalePresetId) {
  return companyLocalePresets.find((preset) => preset.id === id) ?? defaultCompanyLocalePreset;
}

export function getCompanyLocalePresetByValues(
  currencyCode: string,
  timezone: string,
) {
  return (
    companyLocalePresets.find(
      (preset) =>
        preset.currencyCode === currencyCode && preset.timezone === timezone,
    ) ?? null
  );
}
