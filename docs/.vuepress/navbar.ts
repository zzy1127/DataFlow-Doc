/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export const enNavbar = defineNavbarConfig([
  // { text: 'Home', link: '/' },
  // { text: 'Blog', link: '/blog/' },
  // { text: 'Tags', link: '/blog/tags/' },
  // { text: 'Archives', link: '/blog/archives/' },
  {
    text: 'Guide',
    // link: '/en/guide/',
    icon: 'icon-park-outline:guide-board',
    items: [
      {
        text: 'Installation',
        link: '/en/guide/install.md',
        icon: 'material-symbols-light:download-rounded'
      },
    ]
  },
  {
    text: 'API Reference',
    link: '/en/blog/',
    icon: 'material-symbols:article-outline'
  },
  {
    text: 'Developer Guide',
    items: [
      { text: "logging", link: '/en/dev_guide/logging.md' },
      { text: "testcase", link: '/en/dev_guide/testcase.md' },
    ]
  },
  {
    text: 'Notes',
    items: [
      { text: 'Demo', link: '/en/notes/demo/README.md' }
    ]
  },
])

export const zhNavbar = defineNavbarConfig([
  // { text: '首页', link: '/zh/' },
  // { text: '博客', link: '/zh/blog/' },
  // { text: '标签', link: '/zh/blog/tags/' },
  // { text: '归档', link: '/zh/blog/archives/' },
  {
    text: '指南',
    // link: '/zh/guide/',
    icon: 'icon-park-outline:guide-board',
    items: [
      {
        text: '安装',
        link: '/zh/guide/install.md',
        icon: 'material-symbols-light:download-rounded'
      },
    ]
  },
  {
    text: 'API 参考',
    link: '/zh/blog/',
    icon: 'material-symbols:article-outline'
  },
  {
    text: '开发者指南',
    items: [
      { text: "日志", link: '/zh/dev_guide/logging.md' },
      { text: "测试用例", link: '/zh/dev_guide/testcase.md' },
    ]
  },
  {
    text: '笔记',
    items: [{ text: '示例', link: '/zh/notes/demo/README.md' }]
  },
])

