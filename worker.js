let current = {}
let wroteOnUnfocused = false
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

/**
* setStorageV1
* wrapper around the storage api
* @param {string} url
* @param {number} time
* @returns {Promise<void>}
*/
async function setStorageV1(url, time) {
  chrome.storage.local.set(
    {
      [url]: {
        ver: 1,
        time
      }
    })

}
/**
* getStorageV1
* another wrapper around the storage api.
* in the future will just convert to V2 or V3 or whatever the current one is
* @param {string} url
* @returns {Promise<{ time: number | undefined }>}
*/
async function getStorageV1(url) {
  const val = await chrome.storage.local.get(url)
  const obj = val[url]
  if (obj === undefined) return false;
  return {
    time: obj?.time
  }
}

async function interval(your_url) {
  const url = cleanup(your_url)
  const stored = await getStorageV1(url)
  console.log(url, stored)
  counts[url] ??= (stored.time ?? 0)
  badge(counts[url])
  console.log
  const id = setInterval(async function () {
    if (!await checkFocus()) {
      if (!wroteOnUnfocused) {
        await setStorageV1(url, counts[url])
        wroteOnUnfocused = true
      }
      return //probably write to storage on the first tick off
    }
    wroteOnUnfocused = false
    console.log('hi')
    counts[url]++
    if (counts[url] % 10 === 0) {
      setStorageV1(url, counts[url])
    }
    badge(counts[url])
  }, 1000)
  current = {
    id,
    url
  }

}

function teardown_interval() {
  clearInterval(current.id)
  setStorageV1(current.url, counts[current.url])
  current = {}
}

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    // probably write to storage right here
    // clearInterval(current)
    teardown_interval()
    if (tab.url === undefined) return realbadge("off"); // not wikipedia
    // we probably don't have to check because of the permissions we set in the manifest
    console.log("we're probably on wikipedia (tab)")
    console.log("tab:", tab)
    interval(tab.url)
  });
});

chrome.webNavigation.onCommitted.addListener(details => {
  // probably write to storage right here
  teardown_interval()
  console.log("details", details) //tabId and transitionType are important i think. there's a bug here currently, see TODO
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
