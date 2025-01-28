import { badge, realbadge, clearbadge, yellowbadge, redbadge, badgeoff, cleanup, checkFocus, midnightToday } from "./utils.js"
import { total, getStorageV2, updateDayV2 } from "./storage2.js"

let current = {}
let wroteOnUnfocused = false
let counts = {}
let tabId
let today = midnightToday()

async function interval(your_url) {
	const url = cleanup(your_url)
	let stored = await getStorageV2(url)
	if (!stored) stored = {}
	today = midnightToday()
	if (!counts[url]) counts[url] = {}
	counts[url][today] ??= (stored[today] ?? 0)
	const prevtotal = total(counts[url]) - counts[url][today] ?? 0
	console.log('prev total', prevtotal)

	badge(prevtotal + counts[url][today])
	clearbadge()

	const id = setInterval(async () => {
		if (!await checkFocus()) {
			yellowbadge()
			if (!wroteOnUnfocused) {
				await updateDayV2(url, today, counts[url][today])
				wroteOnUnfocused = true
			}
			return
		}
		wroteOnUnfocused = false
		counts[url][today]++
		const time = counts[url][today]
		clearbadge()
		if (time % 10 === 0) {
				await updateDayV2(url, today, time) 
		}
		badge(prevtotal + time)
	}, 1000)
	
	current = { id, url }
}

async function teardown_interval() {
	clearInterval(current.id)
	if (counts[current.url]?.[today])	
		await updateDayV2(current.url, today, counts[current.url][today])
	current = {}
}

function isWikipedia(u) {
	const url = new URL(u)
	const hostname = url.hostname
	console.log(hostname, hostname.split('.').at(-2))
	if (!hostname.includes("wikipedia")) return false
	if (hostname.split('.').at(-2) !== 'wikipedia') return false
	return true 
}

chrome.tabs.onActivated.addListener(activeInfo => {
	chrome.tabs.get(activeInfo.tabId, async tab => {
		tabId = activeInfo.tabId
		await teardown_interval()
		if (tab.url === undefined) return badgeoff() // not wikipedia
		if (tab.url.startsWith("chrome://")) return badgeoff()
		// we probably don't have to check because of the permissions we set in the manifest
		//we probably do :sob:
		if (!isWikipedia(tab.url)) return badgeoff()
		console.log("we're probably on wikipedia (tab). url: ", tab.url)
		console.log("tab:", tab)
		interval(tab.url)
	});
});

chrome.webNavigation.onCommitted.addListener(async details => {
	// this is false if the user opened the window in a new tab in the background
	// we should likely just ignore this navigation then? likely gonna work fine :P
	const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
	if (tab.url !== details.url) return console.log('ignoring nav, tab opened in bg')
	await teardown_interval()
	if (!isWikipedia(details.url)) return badgeoff()
	console.log("we're on wikipedia! (nav)")
	interval(details.url)
});

