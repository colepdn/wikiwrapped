import { total } from "./storage2.js"


function updateInfoPanel(url) {
	const panel = document.querySelector("#info")
	let html = `<h1>${urltoname(url)}</h1>`
	panel.innerHTML = html

}

function urltoname(url) {
	return decodeURI(url.split("/").at(-1)).replaceAll("_", " ")
}

const DEBUG = true
const db = await chrome.storage.local.get(null)
console.log(db)
if (DEBUG) {
	document.querySelector("#storage").innerText = JSON.stringify(db)
}
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
	html += `<div class="chartitem" id="${item.url}" style="width: ${(item.totals / max) * 100}%;">${urltoname(item.url)}: ${item.totals} seconds</div>`
}

graph.innerHTML = html + "</div>"

for (const child of graph.children[0].children) {
	child.onclick = () => {updateInfoPanel(child.id)}
}

if (false) {
list = list.filter(item => !!item[1].ver && !!item[1].time && item[0].includes('wikipedia'))
list.sort((a, b) => total(b[1].dates) - total(a[1].dates))
console.log('ls', list)
let html = '<div class="chart">'
let max = 1;
for (const [_, item] of list) if (item.time > max) max = item.time;
for (const [url, item] of list) {
	html += `<div class="chartitem" id="${url
			}" style="width: ${(item.time / max) * 100}%;">${
				urltoname(url)
			}: ${
				item.time
			} seconds</div>`
}

graph.innerHTML = html + "</div>"

for (const child of graph.children[0].children) {
	child.onclick = () => {updateInfoPanel(child.id)}
}
}
