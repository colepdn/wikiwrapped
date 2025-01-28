import { total, getStorageV2 } from "./storage2.js"
import { secString } from "./utils.js"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

async function updateInfoPanel(url) {
	const panel = document.querySelector("#info")
	const data = await getStorageV2(url)
	const items = []
	for (const [date, time] of Object.entries(data)) {
		const d = new Date(parseInt(date))
		items.push(`${months[d.getMonth()]} ${d.getDate()}: ${secString(time)}`)
	}
	console.log(items)
	let html = `
		<h1>${urltoname(url)}</h1>
		<div>
			${items.join("</div><div>")}
		</div>
		<hr style="margin-top: 5%">
		`
	panel.innerHTML = html

}

function urltoname(url) {
	return decodeURI(url.split("/").at(-1)).replaceAll("_", " ")
}

const db = await chrome.storage.local.get(null)
console.log(db)
const graph = document.querySelector("#graph")

let list = Object.entries(db)
console.log('list', list)
list = list.filter(([url, values]) => url.includes('wikipedia') && values.ver > 1)
console.log('list', list)

let totals = []
let max = 1
for (const [url, values] of list) {
	const t = total(values.dates)
	if (t > max) max = t
	totals.push({ url, dates: values.dates, totals: t })
}
console.log('totals', totals, 'max', max)
totals.sort((a, b) => b.totals - a.totals)

let html = '<div class="chart">'
for (const item of totals) {
	html += `<div class="chartitem" id="${item.url}" style="width: ${(item.totals / max) * 100}%;">${urltoname(item.url)}: ${secString(item.totals)}</div>`
}

graph.innerHTML = html + "</div>"

for (const child of graph.children[0].children) {
	child.onclick = () => {updateInfoPanel(child.id)}
}
