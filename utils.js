export function plural(str, quantity) {
	return quantity === 1 ? str : str + "s"
}

export function secString(s) {
	const h = (s - (s % 3600))
	const hours = h / 3600
	const m = ((s - h) - ((s - h) % 60)) 
	const minutes = m / 60
	const seconds = s - h - m
	let str = ""
	if (hours !== 0) str += `${hours} ${plural("hour", hours)}`
	if (hours !== 0 && (minutes !== 0 || seconds !== 0)) str += ", "
	if (minutes !== 0) str += `${minutes} ${plural("minute", minutes)}`
	if (minutes !== 0 && seconds !== 0) str += ", "
	if (seconds !== 0) str += `${seconds} ${plural("second", seconds)}`
	return str
}

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
