import type { TaskHandler, File } from 'payload'
import axios from 'axios'
import * as cheerio from 'cheerio'

/* ------------------------------------------------------------------ */
/* Types – only what we need here                                     */
/* ------------------------------------------------------------------ */
type MichelinType = 'restaurant' | 'bib-gourmand' | 'green-star' | 'young-chef'

interface MichelinRestaurantCard {
  name: string
  rating: number
  cuisine: string
  city: string
  country: string
  address?: string
  priceRange?: '1' | '2' | '3' | '4'
  link?: string
}

interface DetailExtras {
  image?: string
  phone?: string
  description?: string
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const MICHELIN_URLS: Record<string, string> = {
  '3-stars': 'https://guide.michelin.com/en/restaurants/3-stars-michelin',
  '2-stars': 'https://guide.michelin.com/en/restaurants/2-stars-michelin',
  '1-star': 'https://guide.michelin.com/en/restaurants/1-star-michelin',
  'bib-gourmand': 'https://guide.michelin.com/en/restaurants/bib-gourmand',
}

/* ------------------------------------------------------------------ */
/* Helpers – scrape list pages                                        */
/* ------------------------------------------------------------------ */
async function scrapeListPage(url: string, stars: number): Promise<MichelinRestaurantCard[]> {
  const cards: MichelinRestaurantCard[] = []
  let page = 1
  let more = true

  while (more && page <= 10) {
    try {
      const html = (
        await axios.get(page === 1 ? url : `${url}/page/${page}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
      ).data
      const $ = cheerio.load(html)

      /* find first selector that matches */
      const cardSel =
        [
          '[data-restaurant-id]',
          '.restaurant-card',
          '.card',
          '.restaurant__list-item',
          '.js-restaurant__list_item',
          '.list-item',
        ].find((s) => $(s).length) ?? ''

      $(cardSel).each((_, el) => {
        const $el = $(el)

        const name =
          ['h3 a', '.card-title a', '.restaurant__heading a', '.restaurant-name']
            .map((s) => $el.find(s).first().text().trim())
            .find(Boolean) ?? ''

        if (!name) return

        const cuisine = (
          $el
            .find('.card__menu-footer--price, .cuisine, .restaurant__cuisine')
            .text()
            .split('·')[0] || ''
        ).trim()

        const locText = $el.find('.location, .card__menu-footer--location').text().trim()
        const [city = 'Unknown', ...rest] = locText.split(',').map((t) => t.trim())
        const country = rest.pop() ?? 'Unknown'

        const priceSymbols = (
          $el
            .find('[class*="price"], .price')
            .text()
            .match(/[$€£¥]/g) ?? []
        ).length
        const priceRange =
          priceSymbols >= 1 && priceSymbols <= 4
            ? (String(priceSymbols) as '1' | '2' | '3' | '4')
            : undefined

        const rel = $el.find('a[href*="/restaurant/"], .card-title a').attr('href')?.trim()
        const link = rel
          ? rel.startsWith('http')
            ? rel
            : `https://guide.michelin.com${rel}`
          : undefined

        cards.push({
          name,
          rating: stars,
          cuisine: cuisine || 'Contemporary',
          city,
          country,
          address: locText,
          priceRange,
          link,
        })
      })

      more = $('a[rel="next"], .pagination__next').length > 0
      page++
      await new Promise((r) => setTimeout(r, 800))
    } catch {
      more = false
    }
  }

  return cards
}

/* ------------------------------------------------------------------ */
/* Helpers – scrape detail page                                       */
/* ------------------------------------------------------------------ */
async function scrapeDetail(link?: string): Promise<DetailExtras> {
  const extras: DetailExtras = {}
  if (!link) return extras
  try {
    const html = (await axios.get(link)).data
    const $ = cheerio.load(html)
    extras.image = $('meta[property="og:image"]').attr('content') ?? undefined
    extras.description = $('meta[property="og:description"]').attr('content') ?? undefined
    const tel = $('a[href^="tel:"]').attr('href')
    if (tel) extras.phone = tel.replace(/^tel:/, '').trim()
  } catch {
    /* ignore */
  }
  return extras
}

/* download → Payload File */
async function fileFromURL(url: string): Promise<File | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const ext = url.split('.').pop() ?? 'jpg'
    return {
      name: `photo-${Date.now()}.${ext}`,
      data: buf,
      size: buf.byteLength,
      mimetype: `image/${ext}`,
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Job                                                                */
/* ------------------------------------------------------------------ */
export const michelinSync: TaskHandler<'michelin-sync'> = async ({ req }) => {
  const { payload } = req
  payload.logger.info('▶ Michelin sync running…')

  let created = 0,
    updated = 0,
    enriched = 0

  /* 1️⃣  Fetch list pages & upsert base docs ----------------------- */
  for (const [cat, url] of Object.entries(MICHELIN_URLS)) {
    const stars = cat === '3-stars' ? 3 : cat === '2-stars' ? 2 : cat === '1-star' ? 1 : 0
    const list = await scrapeListPage(url, stars)
    payload.logger.info(`   – ${cat}: ${list.length} entries`)

    for (const card of list) {
      /* destination by city */
      let destinationId: number | undefined
      if (card.city !== 'Unknown') {
        const destRes = await payload.find({
          collection: 'destinations',
          where: { city: { equals: card.city } },
          limit: 1,
        })
        if (destRes.docs.length) destinationId = destRes.docs[0]?.id
      }

      /* upsert key: name + city */
      const existing = await payload.find({
        collection: 'michelin-restaurants',
        where: {
          and: [{ name: { equals: card.name } }, { 'location.city': { equals: card.city } }],
        },
        limit: 1,
      })

      const restType: MichelinType = stars === 0 ? 'bib-gourmand' : 'restaurant'

      const baseDoc = {
        name: card.name,
        year: new Date().getFullYear(),
        link: card.link,
        location: {
          address: card.address,
          city: card.city,
          destination: destinationId,
        },
        type: restType,
        cuisine: card.cuisine,
        isActive: true,
        ...(stars ? { rating: stars } : {}),
        ...(card.priceRange ? { priceRange: card.priceRange } : {}),
      }

      if (existing.docs.length === 0) {
        await payload.create({ collection: 'michelin-restaurants', data: baseDoc })
        created++
      } else {
        await payload.update({
          collection: 'michelin-restaurants',
          id: existing.docs[0]!.id,
          data: baseDoc,
        })
        updated++
      }
    }
  }

  /* 2️⃣  Enrich docs missing gallery / phone / description --------- */
  const need = await payload.find({
    collection: 'michelin-restaurants',
    where: {
      or: [{ gallery: { equals: [] } }, { phone: { equals: '' } }, { description: { equals: '' } }],
    },
    limit: 10000,
  })

  for (const doc of need.docs) {
    const link = typeof doc.link === 'string' && doc.link.trim() !== '' ? doc.link : undefined
    if (!link) continue

    const extras = await scrapeDetail(link)
    const patch: Record<string, unknown> = {}

    if (!doc.phone && extras.phone) patch.phone = extras.phone
    if (!doc.description && extras.description) patch.description = extras.description

    if ((doc.gallery?.length ?? 0) === 0 && extras.image) {
      const file = await fileFromURL(extras.image)
      if (file) {
        const media = await payload.create({
          collection: 'media',
          file,
          data: { alt: `${doc.name} lead` },
        })
        patch.gallery = [media.id]
      }
    }

    if (Object.keys(patch).length) {
      await payload.update({
        collection: 'michelin-restaurants',
        id: doc.id,
        data: patch,
      })
      enriched++
    }

    await new Promise((r) => setTimeout(r, 800))
  }

  payload.logger.info(
    `✔ Michelin sync done – new: ${created}, updated: ${updated}, enriched: ${enriched}`,
  )

  return { output: { created, updated, enriched } }
}