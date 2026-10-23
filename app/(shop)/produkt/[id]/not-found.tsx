import { NotFoundContent } from '@/components/site/not-found-content'

export default function ProductNotFound() {
  return (
    <NotFoundContent
      title="Tenhle kousek tu už není"
      text="Produkt, který hledáte, neexistuje nebo byl stažen z nabídky. Mrkněte na to, co právě šijeme."
    />
  )
}
