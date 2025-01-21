let current
let counts = {}

function badge(seconds) {
  if (seconds < 60) {
    return realbadge(`${seconds}s`)
  }
  return realbadge(`${(seconds - (seconds % 60)) / 60}m`)
}

function realbadge(text) {
  chrome.action.setBadgeText({ text })
}

function cleanup(url) { // if necessary
  return url.split("&")[0].split("#")[0]
}

async function checkFocus() {
  return new Promise(resolve => {
    chrome.windows.getCurrent(browser => {
      resolve(browser.focused)
    })
  })
}

function interval(your_url) {
  const url = cleanup(your_url)
  counts[url] ??= 0
  let count = counts[url]
  badge(counts[url])
  current = setInterval(async function () {
    if (!await checkFocus()) return //probably write to storage on the first tick off
    console.log('hi')
    counts[url]++
    badge(counts[url])
  }, 1000)

}

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    // probably write to storage right here
    clearInterval(current)
    if (tab.url === undefined) return realbadge("off"); // not wikipedia
    // we probably don't have to check because of the permissions we set in the manifest
    console.log("we're probably on wikipedia (tab)")
    console.log("tab:", tab)
    interval(tab.url)
  });
});

chrome.webNavigation.onCommitted.addListener(details => {
  // probably write to storage right here
  clearInterval(current)
  console.log("details", details)
  const url = new URL(details.url)
  const hostname = url.hostname
  console.log(hostname, hostname.split('.').at(-2))
  if (!hostname.includes("wikipedia")) return realbadge("off")
  if (hostname.split('.').at(-2) !== 'wikipedia') return realbadge("off")
  console.log("we're on wikipedia! (nav)")
  interval(details.url)
});

function check() {
  return location.href.includes("wikipedia")
}
