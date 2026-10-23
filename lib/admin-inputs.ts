// Parsování a validace vstupů z administrace
import { slugify } from './categories'
import { isSizeType } from './product-types'
import { cleanText, optionalText } from './admin-api'

export function parseCategoryInput(body: any) {
  const name = cleanText(body?.name, 100)
  const slug = slugify(cleanText(body?.slug, 100) || name)
  const sizeType = isSizeType(body?.sizeType) ? body.sizeType : null
  return {
    name,
    slug,
    description: optionalText(body?.description, 2000),
    image: optionalText(body?.image, 500),
    parentId: optionalText(body?.parentId, 50),
    sizeType,
    sortOrder: Number.isFinite(Number(body?.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0,
    isVisible: body?.isVisible !== false,
  }
}

const SALE_SCOPES = ['all', 'categories', 'products'] as const

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function idList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.length < 50) : []
}

export function parseSaleInput(body: any) {
  const name = cleanText(body?.name, 120)
  const scope = SALE_SCOPES.includes(body?.scope) ? (body.scope as (typeof SALE_SCOPES)[number]) : 'all'
  const discountPercent = Number(body?.discountPercent)
  return {
    data: {
      name,
      slug: slugify(cleanText(body?.slug, 120) || name),
      description: optionalText(body?.description, 2000),
      bannerImage: optionalText(body?.bannerImage, 500),
      discountPercent: Number.isFinite(discountPercent) ? discountPercent : NaN,
      startsAt: parseDate(body?.startsAt) ?? new Date(),
      endsAt: parseDate(body?.endsAt),
      isActive: body?.isActive !== false,
      showInMenu: body?.showInMenu !== false,
      scope,
    },
    productIds: scope === 'products' ? idList(body?.productIds) : [],
    categoryIds: scope === 'categories' ? idList(body?.categoryIds) : [],
  }
}

export function validateSale(input: ReturnType<typeof parseSaleInput>): string | null {
  const { data } = input
  if (!data.name || !data.slug) return 'Vyplňte název výprodeje'
  if (!(data.discountPercent > 0 && data.discountPercent < 100)) return 'Sleva musí být mezi 1 a 99 %'
  if (data.endsAt && data.endsAt <= data.startsAt) return 'Konec výprodeje musí být po jeho začátku'
  if (data.scope === 'products' && input.productIds.length === 0) return 'Vyberte alespoň jeden produkt'
  if (data.scope === 'categories' && input.categoryIds.length === 0) return 'Vyberte alespoň jednu kategorii'
  return null
}

function jsonArrayString(value: unknown): string {
  if (typeof value !== 'string') return '[]'
  try {
    return Array.isArray(JSON.parse(value)) ? value : '[]'
  } catch {
    return '[]'
  }
}

export function parseProductInput(body: any) {
  const price = Number(body?.price)
  const stock = Number(body?.stock)
  return {
    name: cleanText(body?.name, 200),
    description: optionalText(body?.description, 10000),
    price: Number.isFinite(price) && price >= 0 ? price : NaN,
    stock: Number.isInteger(stock) && stock >= 0 ? stock : NaN,
    images: jsonArrayString(body?.images),
    categoryId: optionalText(body?.categoryId, 50),
    isSet: body?.isSet === true,
    setOptions: typeof body?.setOptions === 'string' ? body.setOptions : '{}',
    colors: jsonArrayString(body?.colors),
    isVisible: body?.isVisible !== false,
    isFeatured: body?.isFeatured === true,
    // Pořadí se mění jen když ho klient opravdu pošle (jinak by se při úpravě vynulovalo)
    ...(Number.isInteger(body?.sortOrder) && { sortOrder: body.sortOrder as number }),
  }
}

export function validateProduct(data: ReturnType<typeof parseProductInput>): string | null {
  if (!data.name) return 'Vyplňte název produktu'
  if (Number.isNaN(data.price)) return 'Zadejte platnou cenu'
  if (Number.isNaN(data.stock)) return 'Zadejte platný počet kusů skladem'
  return null
}
