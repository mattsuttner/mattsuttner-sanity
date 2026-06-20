/**
 * Sanity Import Script — All Projects
 * 
 * SETUP:
 *   cd /Users/matty/Documents/WIP/Matt-Suttner-Site/mattsuttner-com
 *   npm install @sanity/client
 * 
 * RUN:
 *   node import-to-sanity.js
 */

const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')

const client = createClient({
  projectId: 'pq742f1v',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN
})

const SCRAPED_JSON = '/Users/mattsuttner/Documents/mattsuttner-scraper/scraped-output/scraped-data.json'
const IMAGES_DIR = '/Users/mattsuttner/Documents/mattsuttner-scraper/scraped-output/images'

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function uploadImage(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.log(`  ⚠️  Image not found: ${imagePath}`)
    return null
  }
  const buffer = fs.readFileSync(imagePath)
  const asset = await client.assets.upload('image', buffer, {
    filename: path.basename(imagePath)
  })
  console.log(`  📸 Uploaded: ${path.basename(imagePath)}`)
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

function parseCredits(metaString) {
  if (!metaString) return []
  const credits = []
  const rolePattern = /(Creative Director|Production Manager|Art Director|Editor|Director|Studio Manager|Producer|Writer):\s*([^,\n]+)/gi
  let match
  while ((match = rolePattern.exec(metaString)) !== null) {
    credits.push({ _type: 'object', _key: Math.random().toString(36).slice(2), label: match[1].trim(), name: match[2].trim() })
  }
  return credits
}

function splitClientRole(metaClient) {
  if (!metaClient) return { client: '', role: '' }
  const roleIndex = metaClient.search(/Role:/i)
  if (roleIndex === -1) return { client: metaClient.trim(), role: '' }
  return {
    client: metaClient.slice(0, roleIndex).trim(),
    role: metaClient.slice(roleIndex + 5).trim()
  }
}

function bodyToBlocks(paragraphs) {
  return paragraphs
    .filter(p => p && p.length > 0)
    .map(p => ({
      _type: 'block',
      _key: Math.random().toString(36).slice(2),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: Math.random().toString(36).slice(2), text: p, marks: [] }]
    }))
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 96)
}

async function importProject(project) {
  console.log(`\n🚀 Importing: ${project.title}`)

  const { client: clientName, role } = splitClientRole(project.meta?.client || '')
  const credits = parseCredits(project.meta?.client || '')

  const cleanParagraphs = (project.paragraphs || []).filter(p => {
    const lower = p.toLowerCase()
    return !lower.startsWith('client:') && !lower.startsWith('role:') && !lower.startsWith('creative director:')
  })

  const imageRefs = []
  const projectImgDir = path.join(IMAGES_DIR, project.slug)
  if (project.images && project.images.length > 0) {
    for (const img of project.images) {
      const imgPath = path.join(projectImgDir, img.filename)
      const ref = await uploadImage(imgPath)
      if (ref) imageRefs.push({ ...ref, _key: Math.random().toString(36).slice(2) })
      await sleep(300)
    }
  }

  const keyImage = imageRefs.length > 0
    ? { _type: 'image', asset: imageRefs[0].asset }
    : undefined

  const doc = {
    _type: 'project',
    title: project.title,
    slug: { _type: 'slug', current: slugify(project.slug) },
    tag: project.tag || '#project',
    client: clientName || project.title,
    role: role || 'Creative Lead',
    body: bodyToBlocks(cleanParagraphs),
    ...(keyImage && { keyImage }),
    ...(imageRefs.length > 0 && { images: imageRefs }),
    ...(credits.length > 0 && { credits })
  }

  const result = await client.create(doc)
  console.log(`  ✅ Created: ${result._id}`)
  return result
}

;(async () => {
  if (!process.env.SANITY_TOKEN) {
    console.error('\n❌  Missing SANITY_TOKEN. Run:\n\n  export SANITY_TOKEN=your_token_here\n')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(SCRAPED_JSON, 'utf8'))

  // Skip milk-and-cookies since we already imported it
  const remaining = data.filter(p => p.slug !== 'milk-and-cookies')

  console.log(`\n📦 Importing ${remaining.length} projects...\n`)

  const results = []
  for (const project of remaining) {
    try {
      const result = await importProject(project)
      results.push({ title: project.title, id: result._id, status: 'ok' })
    } catch (e) {
      console.error(`  ❌ Failed: ${e.message}`)
      results.push({ title: project.title, status: 'failed', error: e.message })
    }
    await sleep(500)
  }

  console.log('\n\n── SUMMARY ─────────────────────────────────────────')
  results.forEach(r => {
    const icon = r.status === 'ok' ? '✅' : '❌'
    console.log(`  ${icon} ${r.title}`)
  })
  console.log('────────────────────────────────────────────────────\n')
})()
