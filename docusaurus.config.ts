import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'FF! Docs',
  tagline: 'The official documentation for the Frank!Framework',
  favicon: 'favicons/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.frankframework.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'frankframework', // Usually your GitHub org/user name.
  projectName: 'frankframework', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/frankframework/docs/edit/master/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'docs',
      logo: {
        alt: 'FF!',
        src: 'img/ff!-icon-yellow.svg',
      },
      hideOnScroll: true,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'getStartedSidebar',
          position: 'left',
          label: 'Get Started',
        },
        {href: 'https://frank-manual.readthedocs.io/', label: 'Frank!Manual', position: 'left'},
        {href: 'https://frankdoc.frankframework.org/', label: 'Reference', position: 'left'},
        {href: 'https://frankacademy.nl/', label: 'Frank!Academy', position: 'left'},
        {
          href: 'https://github.com/frankframework',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Get Started',
              to: '/docs/get-started',
            },
            {
              label: 'Frank!Manual',
              href: 'https://frank-manual.readthedocs.io/',
            },
            {
              label: 'Reference',
              href: 'https://frankdoc.frankframework.org/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/frankframework/frankframework/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Frank!Framework',
              href: 'https://frankframework.org',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/frankframework',
            },
            {
              label: 'Docker Hub',
              href: 'https://hub.docker.com/r/frankframework/frankframework',
            },
            {
              label: 'Frank!Academy',
              href: 'https://frankacademy.nl/',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Frank!Framework`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
