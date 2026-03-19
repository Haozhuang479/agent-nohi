import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import zh from './zh.json'

const savedLocale = typeof localStorage !== 'undefined'
  ? (localStorage.getItem('nohi-locale') ?? 'en')
  : 'en'

i18n
  .use(initReactI18next)
  .init({
    lng: savedLocale,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    interpolation: { escapeValue: false },
  })

export default i18n

export function setLanguage(lang: string): void {
  i18n.changeLanguage(lang)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('nohi-locale', lang)
  }
}

export function getCurrentLanguage(): string {
  return i18n.language ?? 'en'
}
