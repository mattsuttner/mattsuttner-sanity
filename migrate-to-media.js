/**
 * Migration script — moves existing images + videos fields
 * into the new unified media array for all project documents.
 *
 * RUN ONCE from mattsuttner-sanity folder:
 *   export SANITY_TOKEN=your_token
 *   node migrate-to-media.js
 */

const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: 'pq742f1v',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_TOKEN
})

const sleep = ms => new Promise(r => setTimeout(r, ms))

;(async () => {
  if (!process.env.SANITY_TOKEN) {
    console.error('❌  Missing SANITY_TOKEN')
    process.exit(1)
  }

  console.log('Fetching all projects...')
  const projects = await client.fetch(
    '*[_type == "project"]{ _id, title, images, videos }'
  )
  console.log(`Found ${projects.length} projects\n`)

  for (const project of projects) {
    const media = []

    // Migrate images
    if (project.images && project.images.length) {
      for (const img of project.images) {
        media.push({
          _type: 'object',
          _key: img._key || Math.random().toString(36).slice(2),
          mediaType: 'image',
          image: {
            _type: 'image',
            asset: img.asset
          }
        })
      }
    }

    // Migrate videos
    if (project.videos && project.videos.length) {
      for (const vid of project.videos) {
        if (vid.videoType === 'url' && vid.url) {
          media.push({
            _type: 'object',
            _key: vid._key || Math.random().toString(36).slice(2),
            mediaType: 'videoUrl',
            url: vid.url
          })
        } else if (vid.videoType === 'upload' && vid.file) {
          media.push({
            _type: 'object',
            _key: vid._key || Math.random().toString(36).slice(2),
            mediaType: 'videoUpload',
            file: vid.file
          })
        }
      }
    }

    if (media.length === 0) {
      console.log(`⏭  ${project.title} — no media to migrate`)
      continue
    }

    try {
      await client
        .patch(project._id)
        .set({ media })
        .unset(['images', 'videos'])
        .commit()
      console.log(`✅  ${project.title} — migrated ${media.length} items`)
    } catch (e) {
      console.error(`❌  ${project.title} — ${e.message}`)
    }

    await sleep(200)
  }

  console.log('\n✅  Migration complete')
})()
