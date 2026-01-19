import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true, // Public read - displayed on frontend anyway
    update: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'general',
      type: 'group',
      label: 'General Settings',
      fields: [
        {
          name: 'homepage',
          type: 'relationship',
          relationTo: 'pages',
          label: 'Homepage',
          required: false,
          admin: {
            description: 'Select which page should be displayed as the homepage',
          },
        },
        {
          name: 'siteName',
          type: 'text',
          label: 'Site Name',
          defaultValue: 'Boilerplate',
          required: true,
          admin: {
            description: 'The name of your website',
          },
        },
        {
          name: 'siteUrl',
          type: 'text',
          label: 'Site URL',
          required: true,
          defaultValue: 'https://kurtstubbings.com',
          admin: {
            description: 'The full URL of your website (e.g., https://kurtstubbings.com)',
          },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Defaults',
      fields: [
        {
          name: 'defaultDescription',
          type: 'textarea',
          label: 'Default Description',
          maxLength: 160,
          admin: {
            description: 'Default meta description (max 160 characters)',
          },
        },
        {
          name: 'defaultImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default OG Image',
          admin: {
            description: 'Default Open Graph image (1200x630px recommended)',
          },
        },
        {
          name: 'favicon',
          type: 'upload',
          relationTo: 'media',
          label: 'Favicon',
          admin: {
            description: 'Site favicon (32x32px recommended)',
          },
        },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Social Media',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'twitterHandle',
              type: 'text',
              label: 'X / Twitter Handle',
              admin: {
                description: 'Twitter username (without @)',
                width: '33.33%',
              },
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'Facebook URL',
              admin: {
                width: '33.33%',
              },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram URL',
              admin: {
                width: '33.33%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'linkedinUrl',
              type: 'text',
              label: 'LinkedIn URL',
              admin: {
                width: '33.33%',
              },
            },
            {
              name: 'youtubeUrl',
              type: 'text',
              label: 'YouTube URL',
              admin: {
                width: '33.33%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'organization',
      type: 'group',
      label: 'Organization Schema',
      admin: {
        description: 'Information for structured data (Schema.org)',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Organization Name',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Organization Logo',
          admin: {
            description: 'Logo for structured data (square format recommended)',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              label: 'Contact Email',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'contactPhone',
              type: 'text',
              label: 'Contact Phone',
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'address',
          type: 'group',
          label: 'Address',
          fields: [
            {
              name: 'streetAddress',
              type: 'text',
              label: 'Street Address',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'city',
                  type: 'text',
                  label: 'City',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'state',
                  type: 'text',
                  label: 'State/Province',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'postalCode',
                  type: 'text',
                  label: 'Postal Code',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'country',
                  type: 'text',
                  label: 'Country',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
