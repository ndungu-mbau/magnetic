import { redirect } from 'next/navigation'

// All product detail pages live at /shop/[slug].
// This permanent redirect ensures old /products/[slug] URLs keep working.

type Args = { params: Promise<{ slug: string }> }

export default async function ProductRedirect({ params }: Args) {
  const { slug } = await params
  redirect(`/shop/${slug}`)
}
