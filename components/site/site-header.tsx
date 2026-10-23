import Link from 'next/link'
import { getSiteNavigation } from '@/lib/navigation'
import { getShopSettings } from '@/lib/site-settings-server'
import { HeaderClient } from './header-client'

function AnnouncementBar({ text, link }: { text: string; link: string }) {
  const content = <span className="text-[12px] font-medium tracking-[0.06em]">{text}</span>
  return (
    <div className="bg-ink text-linen">
      <div className="site-container flex h-9 items-center justify-center text-center">
        {link ? (
          <Link href={link} className="link-line">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

export async function SiteHeader() {
  const [navigation, settings] = await Promise.all([getSiteNavigation(), getShopSettings()])
  const { announcement } = settings
  return (
    <>
      {announcement.enabled && announcement.text && <AnnouncementBar text={announcement.text} link={announcement.link} />}
      <HeaderClient navigation={navigation} />
    </>
  )
}
