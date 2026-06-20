export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'tag',
      title: 'Tag / Category',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'keyImage',
      title: 'Key Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'client',
      title: 'Client',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'name', title: 'Name', type: 'string' }
          ],
          preview: {
            select: { title: 'label', subtitle: 'name' }
          }
        }
      ]
    },
    {
      name: 'media',
      title: 'Media',
      description: 'Photos and videos in display order. Drag to reorder.',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Media Item',
          fields: [
            {
              name: 'mediaType',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Image', value: 'image' },
                  { title: 'Video URL (YouTube / Vimeo)', value: 'videoUrl' },
                  { title: 'Video Upload', value: 'videoUpload' }
                ],
                layout: 'radio'
              },
              validation: Rule => Rule.required()
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              hidden: ({ parent }) => parent?.mediaType !== 'image'
            },
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              hidden: ({ parent }) => parent?.mediaType !== 'videoUrl'
            },
            {
              name: 'file',
              title: 'Video File',
              type: 'file',
              options: { accept: 'video/*' },
              hidden: ({ parent }) => parent?.mediaType !== 'videoUpload'
            },
            {
              name: 'portrait',
              title: 'Portrait orientation? (9:16)',
              type: 'boolean',
              description: 'Enable for vertical/portrait videos',
              hidden: ({ parent }) => parent?.mediaType === 'image',
              initialValue: false
            },
            {
              name: 'caption',
              title: 'Caption (optional)',
              type: 'string'
            }
          ],
          preview: {
            select: {
              mediaType: 'mediaType',
              image: 'image',
              url: 'url',
              caption: 'caption'
            },
            prepare({ mediaType, image, url, caption }) {
              return {
                title: caption || url || mediaType,
                subtitle: mediaType,
                media: image
              }
            }
          }
        }
      ]
    }
  ]
}
