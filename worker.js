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
	
	const clone = { [today]: 0, ...counts[url] }
	const prevtotal = total(clone)
	console.log('prev total', prevtotal)

	badge(prevtotal + counts[url][today])
	clearbadge()

	console.log(counts, clone)
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

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, async tab => {
    tabId = activeInfo.tabId
    await teardown_interval()
    if (tab.url === undefined) return badgeoff() // not wikipedia
    if (tab.url.startsWith("chrome://")) return badgeoff()
    // we probably don't have to check because of the permissions we set in the manifest
    console.log("we're probably on wikipedia (tab). url: ", tab.url)
    console.log("tab:", tab)
    interval(tab.url)
  });
});

chrome.webNavigation.onCommitted.addListener(async details => {
  console.log(details.tabId, tabId, details.id === tabId)
  // probably write to storage right here
  await teardown_interval()
  console.log("details", details) //tabId and transitionType are important i think. there's a bug here currently, see TODO
  const url = new URL(details.url)
  const hostname = url.hostname
  console.log(hostname, hostname.split('.').at(-2))
  if (!hostname.includes("wikipedia")) return badgeoff()
  if (hostname.split('.').at(-2) !== 'wikipedia') return badgeoff()

  console.log("we're on wikipedia! (nav)")
  interval(details.url)
});

function check() {
  return location.href.includes("wikipedia")
}
