// Popis editovatelných polí jednotlivých sekcí – podle něj admin vykreslí formulář.
import type { SectionType } from './sections'

export type Field =
  | { kind: 'text'; key: string; label: string; placeholder?: string }
  | { kind: 'textarea'; key: string; label: string; rows?: number }
  | { kind: 'image'; key: string; label: string; aspect?: 'wide' | 'portrait' | 'square'; hint?: string }
  | { kind: 'select'; key: string; label: string; options: { value: string; label: string }[] }
  | { kind: 'number'; key: string; label: string; min?: number; max?: number }
  | { kind: 'button'; key: string; label: string }
  | { kind: 'category'; key: string; label: string }
  | { kind: 'sale'; key: string; label: string }
  | { kind: 'list'; key: string; label: string; itemLabel: string; fields: Field[]; newItem: Record<string, unknown>; max?: number }

const eyebrow: Field = { kind: 'text', key: 'eyebrow', label: 'Nadtitulek', placeholder: 'malý text nad nadpisem' }
const title: Field = { kind: 'text', key: 'title', label: 'Nadpis' }

export const SECTION_FIELDS: Record<SectionType, Field[]> = {
  hero: [
    eyebrow,
    title,
    { kind: 'textarea', key: 'subtitle', label: 'Podnadpis', rows: 2 },
    { kind: 'image', key: 'image', label: 'Fotka (počítač)', aspect: 'wide' },
    { kind: 'image', key: 'mobileImage', label: 'Fotka pro mobil (nepovinné)', aspect: 'portrait', hint: 'Když chybí, použije se fotka pro počítač.' },
    { kind: 'button', key: 'primary', label: 'Hlavní tlačítko' },
    { kind: 'button', key: 'secondary', label: 'Vedlejší tlačítko' },
    { kind: 'select', key: 'align', label: 'Zarovnání textu', options: [{ value: 'left', label: 'Vlevo' }, { value: 'center', label: 'Na střed' }] },
    { kind: 'select', key: 'height', label: 'Výška', options: [{ value: 'tall', label: 'Vysoký (téměř celá obrazovka)' }, { value: 'medium', label: 'Střední' }] },
  ],
  categoryTiles: [
    eyebrow,
    title,
    {
      kind: 'list',
      key: 'items',
      label: 'Dlaždice',
      itemLabel: 'Dlaždice',
      max: 6,
      newItem: { label: 'Nová dlaždice', caption: '', link: '/obchod', image: '' },
      fields: [
        { kind: 'text', key: 'label', label: 'Název' },
        { kind: 'text', key: 'caption', label: 'Popisek' },
        { kind: 'text', key: 'link', label: 'Odkaz', placeholder: '/obchod/zeny' },
        { kind: 'image', key: 'image', label: 'Fotka', aspect: 'portrait' },
      ],
    },
  ],
  productCarousel: [
    eyebrow,
    title,
    {
      kind: 'select',
      key: 'source',
      label: 'Které produkty',
      options: [
        { value: 'newest', label: 'Nejnovější' },
        { value: 'featured', label: 'Doporučené (označené u produktu)' },
        { value: 'sale', label: 'Ve výprodeji' },
        { value: 'category', label: 'Z kategorie' },
      ],
    },
    { kind: 'category', key: 'categoryId', label: 'Kategorie (pro „Z kategorie“)' },
    { kind: 'number', key: 'limit', label: 'Počet produktů', min: 2, max: 24 },
    { kind: 'select', key: 'layout', label: 'Zobrazení', options: [{ value: 'carousel', label: 'Posuvný pás' }, { value: 'grid', label: 'Mřížka' }] },
    { kind: 'button', key: 'link', label: 'Odkaz „zobrazit vše“' },
  ],
  imageText: [
    eyebrow,
    title,
    { kind: 'textarea', key: 'text', label: 'Text (prázdný řádek = nový odstavec)', rows: 6 },
    { kind: 'image', key: 'image', label: 'Fotka', aspect: 'portrait' },
    { kind: 'select', key: 'imagePosition', label: 'Fotka', options: [{ value: 'left', label: 'Vlevo' }, { value: 'right', label: 'Vpravo' }] },
    { kind: 'button', key: 'button', label: 'Tlačítko' },
  ],
  values: [
    eyebrow,
    title,
    {
      kind: 'list',
      key: 'items',
      label: 'Body',
      itemLabel: 'Bod',
      max: 6,
      newItem: { title: 'Nový bod', text: '' },
      fields: [
        { kind: 'text', key: 'title', label: 'Nadpis' },
        { kind: 'textarea', key: 'text', label: 'Text', rows: 2 },
      ],
    },
  ],
  saleBanner: [
    { kind: 'sale', key: 'saleId', label: 'Výprodej' },
    eyebrow,
    { kind: 'text', key: 'title', label: 'Nadpis (prázdné = název akce)' },
    { kind: 'textarea', key: 'text', label: 'Text (prázdné = popis akce)', rows: 2 },
    { kind: 'image', key: 'image', label: 'Fotka (prázdné = banner akce)', aspect: 'wide' },
    { kind: 'text', key: 'buttonText', label: 'Text tlačítka' },
  ],
  stories: [
    eyebrow,
    title,
    {
      kind: 'list',
      key: 'items',
      label: 'Příběhy',
      itemLabel: 'Příběh',
      max: 12,
      newItem: { name: '', role: '', text: '', image: '' },
      fields: [
        { kind: 'text', key: 'name', label: 'Jméno' },
        { kind: 'text', key: 'role', label: 'Popisek' },
        { kind: 'textarea', key: 'text', label: 'Příběh', rows: 4 },
        { kind: 'image', key: 'image', label: 'Fotka', aspect: 'portrait' },
      ],
    },
  ],
  reviews: [
    eyebrow,
    title,
    {
      kind: 'list',
      key: 'items',
      label: 'Recenze',
      itemLabel: 'Recenze',
      max: 20,
      newItem: { name: '', product: '', text: '' },
      fields: [
        { kind: 'text', key: 'name', label: 'Jméno' },
        { kind: 'text', key: 'product', label: 'Produkt' },
        { kind: 'textarea', key: 'text', label: 'Text', rows: 3 },
      ],
    },
  ],
  instagram: [
    eyebrow,
    title,
    { kind: 'text', key: 'handle', label: 'Profil', placeholder: '@monlii_i' },
    { kind: 'text', key: 'link', label: 'Odkaz na profil' },
    {
      kind: 'list',
      key: 'items',
      label: 'Příspěvky',
      itemLabel: 'Příspěvek',
      max: 8,
      newItem: { image: '', url: '' },
      fields: [
        { kind: 'image', key: 'image', label: 'Obrázek', aspect: 'square' },
        { kind: 'text', key: 'url', label: 'Odkaz na příspěvek' },
      ],
    },
  ],
  text: [
    eyebrow,
    title,
    { kind: 'textarea', key: 'text', label: 'Text', rows: 6 },
    { kind: 'select', key: 'align', label: 'Zarovnání', options: [{ value: 'center', label: 'Na střed' }, { value: 'left', label: 'Vlevo' }] },
  ],
}

/** Krátký popis sekce do seznamu v builderu */
export function sectionSummary(data: Record<string, unknown>): string {
  const value = data.title || data.eyebrow || ''
  return typeof value === 'string' ? value : ''
}
