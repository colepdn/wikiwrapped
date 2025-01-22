//i'll invent my own top-level await
(async () => {
  const db = await chrome.storage.local.get(null)
  console.log(db)
  document.querySelector("#storage").innerText = JSON.stringify(db)

  const graph = document.querySelector("#graph")
  let list = Object.entries(db)
  list = list.filter(item => !!item[1].ver && !!item[1].time && item[0].includes('wikipedia'))
  list.sort((a, b) => b[1].time - a[1].time)
  let html = '<div class="chart">'
  let max = 1;
  for (const [_, item] of list) if (item.time > max) max = item.time;
  for (const [url, item] of list) {
    html += `<div class="chartitem" style="width: ${(item.time / max) * 100}%;">${url.split("/").at(-1).replaceAll("_", " ")}: ${item.time} seconds</div>`
  }

  graph.innerHTML = html + "</div>"
})();
