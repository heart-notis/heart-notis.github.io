// 곧 공개될 스포일러를 찾아서, 공개 1분 뒤에 알림 서버를 불러요.
import { readFileSync } from "node:fs"

const API = "https://heart-notis.netlify.app/api/release"
const AHEAD_MS = 120 * 60_000     // 앞으로 2시간 안에 공개될 것까지 기다려요
const BEHIND_MS = 90 * 60_000     // 혹시 놓쳤으면 공개 후 1시간 반 안에는 바로 보내요

const txt = readFileSync("data.js", "utf8")
const data = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1))
const now = Date.now()
const times = [...new Set((data.posts ?? [])
  .filter(p => p.spoiler && !p.hidden && p.releaseDate && p.id)
  .map(p => {
    const [y, m, d] = String(p.releaseDate).split("-").map(Number)
    const [hh, mm] = String(p.releaseTime || "00:00").split(":").map(Number)
    return Date.UTC(y, m - 1, d, hh - 9, mm) + 60_000 + 5_000   // 한국 시간 · 공개 1분 뒤(+5초 여유)
  })
  .filter(t => t > now - BEHIND_MS && t < now + AHEAD_MS))].sort((a, b) => a - b)

if (!times.length) { console.log("곧 공개될 스포일러가 없어요"); process.exit(0) }

const call = async () => {
  for (let i = 0; i < 3; i++) {
    try { const r = await fetch(API, { method: "POST" }); console.log("알림 서버:", r.status, await r.text()); if (r.ok) return } catch (e) { console.log("실패, 다시 시도", e.message) }
    await new Promise(r => setTimeout(r, 15_000))
  }
}
for (const t of times) {
  const wait = t - Date.now()
  console.log(`${new Date(t).toISOString()} 까지 ${Math.max(0, Math.round(wait / 1000))}초 기다려요`)
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  await call()
  await new Promise(r => setTimeout(r, 21_000))
}
