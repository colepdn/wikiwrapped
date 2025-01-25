export function badge(seconds) {
  if (seconds < 60) {
    return realbadge(`${seconds}s`)
  }
  return realbadge(`${(seconds - (seconds % 60)) / 60}m`)
}

export function realbadge(text) {
  chrome.action.setBadgeText({ text })
}

export function clearbadge() {
  chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] })
}

export function yellowbadge() {
  chrome.action.setBadgeBackgroundColor({ color: "yellow" })
}

export function redbadge() {
  chrome.action.setBadgeBackgroundColor({ color: "red" })
}

export function badgeoff() {
  redbadge()
  realbadge("off");
}

export function cleanup(url) { // if necessary
  return url.split("&")[0].split("#")[0]
}

export function checkFocus() {
  return new Promise(resolve => {
    chrome.windows.getCurrent(browser => {
      resolve(browser.focused)
    })
  })
}

export function midnightToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
