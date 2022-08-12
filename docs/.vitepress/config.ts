import { defineConfig } from 'vitepress'
import { name, description } from '../../package.json'

export default defineConfig({
  title: name,
  description,
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    editLink: {
      pattern: 'https://github.com/condorheroblog/learn-use-hook/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/condorheroblog/learn-use-hook' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022 - present CondorHero'
    },
    sidebar: [
      {
        text: '介绍',
        items: [
          {
            text: '总览',
            link: '/overview'
          }
        ],
      },
      {
        text: 'Vue',
        items: [
          {
            text: 'Vue Composition 介绍',
            link: '/vue/introduction'
          }
        ],
      },
      {
        text: 'React',
        items: [
          {
            text: 'React Hooks 介绍',
            link: '/react/introduction'
          }
        ],
      },
    ],
    nav: [
      {
        text: '开始',
        link: '/overview'
      }
    ]
  }
});
