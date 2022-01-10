import { Item } from "feed"

export const getPreview = (items: Item[]): string => {
    return `
        <h3> RSS Feed Preview </h3>
        <a href="https://github.com/0x77dev/rss">repo</a> <br />
        <a href="/add">add rss feed</a> <br />
        <a href="/sources">sources</a> <br />
        <hr />
        ${items.map((item, i) => `<b>${i+1}: <a href="${item.link}">${item.title}</a> / ${item.date}</b> ${item.description ? `<br> ${item.description}` : ''}`).join('<br>\n')} <br />
    `
}