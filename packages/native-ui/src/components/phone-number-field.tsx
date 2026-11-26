import { useEffect, useMemo, useState, useRef } from "react"
import { View, Text, TextInput } from "react-native"
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max"
import { ComboBox } from "./combo-box"
import { useAnkvaleTheme } from "../theme"
import { useControllableState } from "../use-controllable-state"
const allCountries = getCountries()
function initialCountry(number: string, preferred?: CountryCode) {
  const parsed = parsePhoneNumberFromString(number)
  if (parsed?.country) return parsed.country
  if (preferred) return preferred
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale,
      region = new Intl.Locale(locale).maximize().region as CountryCode
    if (allCountries.includes(region)) return region
  } catch {}
  return "US" as CountryCode
}
function national(number: string, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(number)
  if (parsed) return parsed.formatNational()
  const prefix = "+" + getCountryCallingCode(country)
  return new AsYouType(country).input(
    number.startsWith(prefix) ? number.slice(prefix.length) : number
  )
}
export type PhoneValidation = {
  valid: boolean
  possible: boolean
  country?: CountryCode
}
export type PhoneNumberFieldProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  country?: CountryCode
  defaultCountry?: CountryCode
  onCountryChange?: (country: CountryCode) => void
  countries?: CountryCode[]
  locale?: string
  label?: string
  disabled?: boolean
  onValidationChange?: (result: PhoneValidation) => void
}
export function PhoneNumberField({
  value,
  defaultValue = "",
  onValueChange,
  country,
  defaultCountry,
  onCountryChange,
  countries = allCountries,
  locale = "en",
  label = "Phone number",
  disabled,
  onValidationChange,
}: PhoneNumberFieldProps) {
  const lastEmitted = useRef<string | null>(null)
  const theme = useAnkvaleTheme(),
    [number, setNumber] = useControllableState(
      value,
      defaultValue,
      onValueChange
    ),
    [selectedCountry, setCountry] = useControllableState(
      country,
      initialCountry(value ?? defaultValue, defaultCountry),
      onCountryChange
    ),
    [draft, setDraft] = useState(() =>
      national(value ?? defaultValue, selectedCountry)
    ),
    [error, setError] = useState("")
  useEffect(() => {
    const inferred =
      value !== undefined &&
      value !== lastEmitted.current &&
      country === undefined
        ? parsePhoneNumberFromString(value)?.country
        : undefined
    if (
      inferred &&
      countries.includes(inferred) &&
      inferred !== selectedCountry
    )
      setCountry(inferred)
    setDraft(national(number, inferred ?? selectedCountry))
  }, [number, selectedCountry, value, country, countries])
  function emit(next: string) {
    lastEmitted.current = next
    setNumber(next)
  }
  const options = useMemo(() => {
    let names: Intl.DisplayNames | undefined
    try {
      names = new Intl.DisplayNames(locale, { type: "region" })
    } catch {}
    return countries
      .filter((code) => allCountries.includes(code))
      .map((code) => ({
        value: code,
        label: `${names?.of(code) ?? code} (${code}) +${getCountryCallingCode(code)}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, locale))
  }, [countries, locale])
  const parsed = parsePhoneNumberFromString(number),
    callingCode =
      parsed?.countryCallingCode ?? getCountryCallingCode(selectedCountry)
  function change(text: string) {
    setError("")
    if (!text.trim()) {
      setDraft("")
      emit("")
      return
    }
    const formatter = new AsYouType(selectedCountry)
    const formatted = formatter.input(text),
      next = formatter.getNumberValue() ?? ""
    if (text.trim().startsWith("+")) {
      const inferred = formatter.getCountry()
      if (inferred && countries.includes(inferred)) setCountry(inferred)
      const parsedNext = parsePhoneNumberFromString(next)
      setDraft(
        parsedNext?.formatNational() ?? formatted.replace(/^\+\d+\s?/, "")
      )
    } else setDraft(formatted)
    emit(next)
  }
  function validate() {
    const current = parsePhoneNumberFromString(number),
      valid = current?.isValid() ?? false,
      possible = current?.isPossible() ?? false
    setError(number && !valid ? "Enter a valid phone number." : "")
    onValidationChange?.({ valid, possible, country: current?.country })
  }
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, color: theme.foreground }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <ComboBox
          label="Country calling code"
          options={options}
          value={selectedCountry}
          displayValue={`+${callingCode}`}
          onValueChange={(next) => {
            const code = next as CountryCode
            const digits =
              parsed?.nationalNumber ??
              number
                .replace(new RegExp(`^\\+${callingCode}`), "")
                .replace(/\D/g, "")
            setCountry(code)
            emit(digits ? `+${getCountryCallingCode(code)}${digits}` : "")
            setDraft(new AsYouType(code).input(digits))
            setError("")
          }}
          disabled={disabled}
        />
        <TextInput
          accessibilityLabel={label}
          inputMode="tel"
          keyboardType="phone-pad"
          autoComplete="tel"
          editable={!disabled}
          value={draft}
          onChangeText={change}
          onBlur={validate}
          style={{
            flex: 1,
            minWidth: 80,
            minHeight: 44,
            borderRadius: theme.radius,
            borderWidth: 1,
            borderColor: error ? theme.danger : theme.border,
            paddingHorizontal: 12,
            fontSize: 14,
            color: theme.foreground,
            backgroundColor: theme.surface,
          }}
        />
      </View>
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ fontSize: 12, color: theme.danger }}
        >
          {error}
        </Text>
      )}
    </View>
  )
}
