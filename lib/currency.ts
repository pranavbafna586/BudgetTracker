export const Currencies = [
  {
    value: "USD",
    label: "$ Dollar",
    locale: "en-US",
  },
  { value: "EUR", label: "€ Euro", locale: "de-DE" },
  { value: "JPY", label: "¥ Yen", locale: "ja-JP" },
  { value: "GBP", label: "£ Pound", locale: "en-GB" },
  { value: "INR", label: "₹ Rupee", locale: "en-IN" },
];

export type Currency = (typeof Currencies)[0];
