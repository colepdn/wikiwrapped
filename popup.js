//i'll invent my own top-level await
(async () => {
  const db = await chrome.storage.local.get(null)
  console.log(db)
  document.querySelector("#storage").innerText = JSON.stringify(db)

  const graph = document.querySelector("#graph")
  let html = "<div>"
  for (const [url, item] of Object.entries(db)) {
    if (!item.ver) continue;
    html += `<div>${url.split("/").at(-1).replaceAll("_", " ")}: ${item.time} seconds.`
  }

  graph.innerHTML = html + "</div>"
})();
