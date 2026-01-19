import { CollectionConfig, slugField } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  fields: [
    slugField(),
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
    },
  ],
  access: {
    // Public read for published pages, authenticated for drafts and writes
    read: ({ req }) => {
      if (req.user) return true
      return {
        or: [{ _status: { equals: 'published' } }, { _status: { exists: false } }],
      }
    },

    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  admin: {
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4321'
        return `${baseUrl}/preview/pages/${data.id}`
      },
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1000, // Auto-save every 1 second while typing
      },
    },
    maxPerDoc: 50,
  },
}
