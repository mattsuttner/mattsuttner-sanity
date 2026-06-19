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
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    {
      name: 'videos',
      title: 'Videos',
      type: 'array',
      validation: Rule => Rule.max(3),
      of: [
        {
          type: 'object',
          title: 'Video',
          fields: [
            {
              name: 'videoType',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'URL (YouTube / Vimeo)', value: 'url' },
                  { title: 'Upload', value: 'upload' }
                ],
                layout: 'radio'
              }
            },
            {
              name: 'url',
              title: 'Video URL',
              type: 'url',
              hidden: ({ parent }) => parent?.videoType !== 'url'
            },
            {
              name: 'file',
              title: 'Video File',
              type: 'file',
              options: { accept: 'video/*' },
              hidden: ({ parent }) => parent?.videoType !== 'upload'
            }
          ],
          preview: {
            select: { title: 'url', subtitle: 'videoType' }
          }
        }
      ]
    }
  ]
}
