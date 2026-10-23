// Data pro hlavní menu – sestavují se na serveru z kategorií, výprodejů a nastavení
import { getCategoryTree, visibleChildren } from './categories'
import { getActiveSales } from './sales'
import { getShopSettings } from './site-settings-server'

export interface NavLink {
  label: string
  href: string
}

export interface NavGroup extends NavLink {
  links: NavLink[]
}

export interface NavItem extends NavLink {
  groups: NavGroup[]
  image?: string | null
  highlight?: boolean
}

export interface SiteNavigation {
  primary: NavItem[]
  secondary: NavLink[]
}

export async function getSiteNavigation(): Promise<SiteNavigation> {
  const [tree, sales, settings] = await Promise.all([getCategoryTree(), getActiveSales(), getShopSettings()])

  const primary: NavItem[] = visibleChildren(tree.roots).map((root) => ({
    label: root.name,
    href: `/obchod/${root.slug}`,
    image: root.image,
    groups: visibleChildren(root.children).map((child) => ({
      label: child.name,
      href: `/obchod/${child.slug}`,
      links: visibleChildren(child.children).map((leaf) => ({ label: leaf.name, href: `/obchod/${leaf.slug}` })),
    })),
  }))

  const menuSales = sales.filter((s) => s.showInMenu)
  if (menuSales.length > 0) {
    primary.push({
      label: 'Výprodej',
      href: menuSales.length === 1 ? `/vyprodej/${menuSales[0].slug}` : '/vyprodej',
      highlight: true,
      groups:
        menuSales.length > 1
          ? [{ label: 'Probíhající akce', href: '/vyprodej', links: menuSales.map((s) => ({ label: s.name, href: `/vyprodej/${s.slug}` })) }]
          : [],
    })
  }

  const secondary: NavLink[] = [
    { label: 'Obchod', href: '/obchod' },
    ...(settings.subscriptionEnabled ? [{ label: 'Předplatné', href: '/predplatne' }] : []),
    { label: 'O nás', href: '/o-nas' },
    { label: 'Kontakt', href: '/kontakty' },
  ]

  return { primary, secondary }
}
