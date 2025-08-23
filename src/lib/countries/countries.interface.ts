// src/lib/countries/country.interface.ts

export interface Country {
  label: string
  code: string
  capital: string
  region: string
  currency: {
    code: string
    label: string
    symbol: string | null
  }
  language: {
    code: string | null
    label: string
    iso639_2?: string // optional property from the data
    nativeName?: string // optional property from the data
  }
  flag: string
  countryCode: string
  isoCode: string
  demonym?: string
}
