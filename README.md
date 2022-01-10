# RSS

My personal RSS feeds aggregator running on cloudflare workers.

[Add feed](https://rss.0x77.dev/add)

## Endpoints

- GET `https://rss.0x77.dev/rss2` - RSS2 feed
- GET `https://rss.0x77.dev/atom` - Atom feed
- GET `https://rss.0x77.dev/json` - JSON feed
- GET `https://rss.0x77.dev/sources` - Aggregation sources list

---

Note: You must use [wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) 1.17 or newer to test or deploy this project.
