export function total(entry) {
	let t = 0
	for (const item of Object.values(entry)) t += item;
	return t 
}

export function v1upgradeV2(entry) {
	return { "0": entry.time } // kind of bad. what evah
}

/**
 * getStorageV2
 * @param {string} url
 * @returns:
 * type StorageV2 = {
 *	[key: string]: number
 * }
 * returns an object indexed by timestamps of time spent on a certain day
 *
*/

export async function getStorageV2(url) {
	let val = (await chrome.storage.local.get(url))[url]
	if (val === undefined) return false
	if (val.ver === 1) {
		console.log("upgrading", url, "to v2", val)
		val = { dates: v1upgradeV2(val) }
		console.log("done", val)
	}
	return val.dates

}

export async function setStorageV2(url, dates) {
	console.log('setting', url, 'dates', dates)
	await chrome.storage.local.set({
		[url]: {
			ver: 2,
			dates
		}
	})
}

//url: string
//index: day timestamp
//time: count for the day
export async function updateDayV2(url, index, time) {
	console.log('updating', url, 'on', index, 'with', time)
	const items = await getStorageV2(url)
	if (!items) {
		return setStorageV2(url, { [index]: time })
	}
	console.log("got", items)
	items[index] = time
	return setStorageV2(url, items)
}
