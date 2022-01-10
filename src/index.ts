import { Feed, Item } from "feed";
import {
  Application,
  Middleware,
  Router,
  normalizePathnameMiddleware
} from '@cfworker/web';
import Parser from "rss-parser";
import { getPreview } from "./preview";

const router = new Router();
const feed = new Feed({
  title: "0x77dev",
  description: "Personal feed of Mykhailo Marynenko",
  id: "https://rss.0x77.dev",
  link: "https://rss.0x77.dev/",
  language: "en",
  image: "https://avatars.githubusercontent.com/u/46429701?v=4",
  favicon: "https://avatars.githubusercontent.com/u/46429701?v=4",
  copyright: "Mykhailo Marynenko",
  generator: "0x77dev/rss",
  feedLinks: {
    json: "https://rss.0x77.dev/json",
    atom: "https://rss.0x77.dev/atom"
  },
  author: {
    name: "Mykhailo Marynenko",
    email: "0x77dev@protonmail.com",
    link: "https://0x77.dev"
  }
});

const feeds = [
  {
    category: 'news',
    links: ['https://hnrss.org/newest?points=100']
  },
  {
    category: 'socials',
    links: ['https://github.com/0x77dev.atom', 'https://rss.app/feeds/XppH2uwddFq6486S.xml', 'https://twitchrss.appspot.com/vod/0x77dev', 'https://rss.app/feeds/iXaXTMb8SSbFrNMP.xml']
  },
  {
    category: 'releases',
    links: [
      'https://github.com/prisma/prisma/releases.atom', 
      'https://github.com/facebook/react/releases.atom', 
      'https://github.com/vuejs/vue/releases.atom', 
      'https://github.com/electron/electron/releases.atom', 
      'https://github.com/graphql-nexus/nexus/releases.atom', 
      'https://github.com/graphql/graphql-spec/releases.atom', 
      'https://github.com/graphql/graphql-js/releases.atom', 
      'https://github.com/nats-io/nats-server/releases.atom', 
      'https://github.com/nats-io/nats.js/releases.atom', 
      'https://github.com/microsoft/TypeScript/releases.atom', 
      'https://github.com/nodejs/node/releases.atom',
      'https://github.com/fastify/fastify/releases.atom',
      'https://github.com/mercurius-js/mercurius/releases.atom'
    ]
  }
]

const load = async () => {
  const parser = new Parser()
  const items: Item[] = []

  for (const feed of feeds) {
    for (const link of feed.links) {
      const data = await fetch(link)
      const res = await parser.parseString(await data.text())
      items.push(...res.items.slice(0, 2).map((data) => ({
        ...data, 
        title: `${feed.category}/ ${res.title} | ${data.title}`, 
        categories: [...data.categories || [], feed.category],
        date: new Date(data.pubDate as string),
        link: data.link as string
      })))
    }
  }

  await RSS_DATA.put('lastUpdated', new Date().toISOString())
  await RSS_DATA.put('items', JSON.stringify(items))

  return items
}

addEventListener('scheduled', (event) => {
  event.waitUntil(load())
})

const loadPosts = async () => {
  load().then(console.log).catch(console.error)
  const items: Item[] = JSON.parse(await RSS_DATA.get('items') || '[]')

  for (const item of items) {
    feed.addItem({...item, date: new Date(item.date)})
  }

  const lastUpdated = await RSS_DATA.get('lastUpdated')
  feed.options.updated = lastUpdated ? new Date(lastUpdated) : new Date()
}

router.get('/', async ({ res }) => {
  await loadPosts()
  res.headers.set('Content-Type', 'text/html; charset=utf-8')
  res.body = getPreview(feed.items)
})

router.get('/reload', async ({ res }) => {
  await RSS_DATA.delete('list')
  await load()
  res.headers.set('Location', '/rss2')
  res.status = 302
  res.body = '/rss2'
})

router.get('/atom', async ({ res }) => {
  await loadPosts()
  res.headers.set('Content-Type', 'application/atom+xml')
  res.body = feed.atom1()
})

router.get('/json', async ({ res }) => {
  await loadPosts()
  res.headers.set('Content-Type', 'application/json')
  res.body = feed.json1()
})

router.get('/sources', async ({ res }) => {
  res.headers.set('Content-Type', 'application/json')
  res.body = feeds
})

router.get('/add', async ({ res }) => {
  res.headers.set('Content-Type', 'text/html')
  res.body = `<html><meta http-equiv="refresh" content="0;URL=feed://rss.0x77.dev/rss2"><a href="feed://rss.0x77.dev/rss2"> add feed </a></html>`
})

router.get('/rss2', async ({ res }) => {
  await loadPosts()
  res.headers.set('Content-Type', 'application/rss+xml')
  res.body = feed.rss2()
})

// Simple CORS middleware.
const cors: Middleware = async ({ res }, next) => {
  res.headers.set('access-control-allow-origin', '*');
  await next();
};

// Compose the application
new Application()
  .use(normalizePathnameMiddleware)
  .use(cors)
  .use(router.middleware)
  .listen();