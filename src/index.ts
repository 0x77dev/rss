import {
  Application,
  Middleware,
  Router,
  normalizePathnameMiddleware
} from '@cfworker/web';

const router = new Router();

import { Feed } from "feed";

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

router.get('/', ({res}) => {
  res.headers.set('Location', 'https://github.com/0x77dev/rss')
  res.status = 308
  res.body = 'https://github.com/0x77dev/rss'
})

router.get('/atom', ({res}) => {
  res.headers.set('Content-Type', 'application/atom+xml')
  res.body = feed.atom1()
})

router.get('/json', ({res}) => {
  res.headers.set('Content-Type', 'application/json')
  res.body = feed.json1()
})

router.get('/rss2', ({res}) => {
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