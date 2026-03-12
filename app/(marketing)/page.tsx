"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

type DayItem = {
  date: Date
  day: number
  dowShort: string
  isWeekend: boolean
  isToday: boolean
  monthName: string
}

type EventItem = {
  id: string
  title: string
  datetime: string
  place: string
  price: string
  imageUrl: string
  lat?: number
  lng?: number
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function monthRu(m: number) {
  const names = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ]
  return names[m] ?? ""
}

function dowRuShort(dow: number) {
  const map = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]
  return map[dow] ?? ""
}

function buildDays(from: Date, monthsAhead = 3) {
  const start = startOfDay(from)
  const end = new Date(start.getFullYear(), start.getMonth() + monthsAhead, start.getDate())
  const extraDays = 10
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + extraDays

  const today = startOfDay(new Date())
  const days: DayItem[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = addDays(start, i)
    const dow = d.getDay()
    const isWeekend = dow === 0 || dow === 6

    days.push({
      date: d,
      day: d.getDate(),
      dowShort: dowRuShort(dow),
      isWeekend,
      isToday: sameDay(d, today),
      monthName: monthRu(d.getMonth()),
    })
  }
  return days
}

function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ")
}

function DateScroller() {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [days] = React.useState(() => buildDays(new Date(), 3))
  const [selected, setSelected] = React.useState(startOfDay(new Date()))

  const isDown = React.useRef(false)
  const startX = React.useRef(0)
  const scrollLeft = React.useRef(0)

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    isDown.current = true
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
  }

  const stop = () => (isDown.current = false)

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || !isDown.current) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.2
    el.scrollLeft = scrollLeft.current - walk
  }

  return (
    <div className="mt-6">
      <div
        ref={ref}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseUp={stop}
        onMouseLeave={stop}
        onMouseMove={onMouseMove}
        className="overflow-x-hidden cursor-grab active:cursor-grabbing scrollbar-hide"
      >
        <div className="flex items-start gap-2 px-1">
          {days.map((d, i) => {
            const prev = i > 0 ? days[i - 1] : null
            const showMonth = !prev || prev.date.getMonth() !== d.date.getMonth()
            const isSelected = sameDay(d.date, selected)

            return (
              <button
                key={d.date.toISOString()}
                onClick={() => setSelected(startOfDay(d.date))}
                type="button"
                className={cn(
                  "min-w-[40px] px-1 py-2 text-left transition",
                  isSelected ? "opacity-100" : "opacity-90 hover:opacity-100"
                )}
              >
                <div className="h-12 flex items-end pb-3">
                  {showMonth && (
                    <div className="text-2xl font-semibold tracking-tight">{d.monthName}</div>
                  )}
                </div>
                <div className={cn("text-xs", d.isWeekend ? "text-red-500" : "text-muted-foreground")}>
                  {d.dowShort}
                </div>
                <div className={cn(
                    "mt-1 text-base font-semibold",
                    d.isWeekend ? "text-red-500" : "text-foreground",
                    d.isToday && "underline underline-offset-4"
                  )}
                >
                  {d.day}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CreateEventCard() {
  return (
    <a
      href="/events/new"
      className="group flex min-h-[170px] w-full items-center justify-center rounded-2xl border border-dashed bg-muted/10 p-6 transition hover:bg-muted/20"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed text-3xl">
          +
        </div>
        <div>
          <div className="text-lg font-semibold">Создать своё</div>
          <div className="mt-1 text-sm text-muted-foreground">Добавь мероприятие в афишу</div>
        </div>
      </div>
    </a>
  )
}

function EventCard({ e }: { e: EventItem }) {
  return (
    <a
      href={`/events/${e.id}`}
      className="group flex min-h-[170px] w-full overflow-hidden rounded-2xl border bg-card transition hover:bg-muted/10"
    >
      <div className="relative h-[170px] w-[170px] shrink-0 overflow-hidden bg-muted">
        {e.imageUrl ? (
          <img
            src={e.imageUrl}
            alt={e.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground bg-muted/50">
            Без обложки
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="text-xs text-muted-foreground">{formatDatetime(e.datetime)}</div>
          <div className="mt-1 line-clamp-2 text-lg font-semibold">{e.title}</div>
          <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{formatPlace(e.place)}</div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm font-medium">{e.price}</div>
          <div className="text-sm text-muted-foreground group-hover:text-foreground transition">
            Подробнее →
          </div>
        </div>
      </div>
    </a>
  )
}

function formatDatetime(dt: string) {
  if (dt.includes("•")) return dt
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfThat.getTime() - startOfToday.getTime()) / 86400000)

  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  const time = `${hh}:${mm}`

  if (diffDays === 0) return `Сегодня • ${time}`
  if (diffDays === 1) return `Завтра • ${time}`

  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
  return `${d.getDate()} ${months[d.getMonth()]} • ${time}`
}

function formatPlace(place: string) {
  if (place.includes("•")) return place
  return `Астана • ${place}`
}

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const q = searchParams ? (searchParams.get("q") || "") : ""
  const format = searchParams ? (searchParams.get("format") || "all") : "all"
  const distance = searchParams ? (searchParams.get("distance") || "all") : "all"
  const price = searchParams ? (searchParams.get("price") || "all") : "all"

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (!value || value === "all") params.delete(key)
    else params.set(key, value)
    const queryString = params.toString()
    const currentPath = pathname || "/"
    router.push(queryString ? `${currentPath}?${queryString}` : currentPath)
  }

  const baseEvents: EventItem[] = [
    {
      id: "1",
      title: "Tech Meetup: Frontend & Product",
      datetime: "Сегодня • 19:00",
      place: "Астана • SmArt.Point • Мангилик ел 21",
      price: "Бесплатно",
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "2",
      title: "Концерт: Live Jazz Night",
      datetime: "Завтра • 20:30",
      place: "Астана • The Bus • Абая 10",
      price: "от 3 000 ₸",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60",
    },
  ]

  // СТЕЙТ ДЛЯ ИВЕНТОВ ИЗ БАЗЫ
  const [dbEvents, setDbEvents] = React.useState<EventItem[]>([])

  // ЗАГРУЗКА ИЗ БАЗЫ ДАННЫХ
  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events")
        if (!res.ok) return
        const data = await res.json()
        
        // Превращаем данные с бэкенда в формат карточек
        const formattedEvents = data.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          datetime: evt.date, // formatDatetime сделает красиво
          place: evt.location || "Астана", 
          price: evt.price > 0 ? `${evt.price} ₸` : "Бесплатно",
          imageUrl: evt.imageUrl || "", 
          lat: evt.lat,
          lng: evt.lng
        }))

        setDbEvents(formattedEvents)
      } catch (error) {
        console.error("Ошибка при загрузке мероприятий:", error)
      }
    }
    fetchEvents()
  }, [])

  // СКЛЕИВАЕМ БАЗУ И ТЕСТОВЫЕ КАРТОЧКИ (База идет первой)
  const events = React.useMemo(() => {
    return [...dbEvents, ...baseEvents]
  }, [dbEvents, baseEvents])

  const filtered = events.filter((e) => {
    const s = (e.title + " " + e.place + " " + e.datetime).toLowerCase()
    const matchesQuery = s.includes(q.trim().toLowerCase())

    const isFree = e.price.toLowerCase().includes("бесплатно")
    const matchesPrice = price === "all" || (price === "free" && isFree) || (price === "paid" && !isFree)

    let matchesDistance = true
    if (distance !== "all" && e.lat && e.lng) {
      const d = getDistance(51.1283, 71.4305, e.lat, e.lng)
      if (distance === "0-1") matchesDistance = d <= 1
      else if (distance === "1-5") matchesDistance = d <= 5
      else if (distance === "5-10") matchesDistance = d <= 10
      else if (distance === "10+") matchesDistance = d > 10
    }

    return matchesQuery && matchesPrice && matchesDistance
  })

  return (
    <div className="container py-10">
      {/* Поиск + фильтры */}
      <div className="grid w-full grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-card">
          <span className="text-muted-foreground">🔍</span>
          <input
            placeholder="Поиск событий"
            value={q}
            onChange={(e) => updateFilter("q", e.target.value)}
            className="w-full bg-transparent outline-none text-base"
          />
        </div>

        <select
          value={format}
          onChange={(e) => updateFilter("format", e.target.value)}
          className="rounded-xl border px-4 py-3 text-base bg-card outline-none hover:bg-muted/40 transition"
        >
          <option value="">Формат</option>
          <option value="offline">Офлайн</option>
          <option value="online">Онлайн</option>
          <option value="hybrid">Гибрид</option>
        </select>

        <select
          value={distance}
          onChange={(e) => updateFilter("distance", e.target.value)}
          className="rounded-xl border px-4 py-3 text-base bg-card outline-none hover:bg-muted/40 transition"
        >
          <option value="">Расстояние</option>
          <option value="0-1">0–1 км</option>
          <option value="1-5">1–5 км</option>
          <option value="5-10">5–10 км</option>
          <option value="10+">10 км+</option>
        </select>

        <select
          value={price}
          onChange={(e) => updateFilter("price", e.target.value)}
          className="rounded-xl border px-4 py-3 text-base bg-card outline-none hover:bg-muted/40 transition"
        >
          <option value="">Цена</option>
          <option value="free">Бесплатно</option>
          <option value="0-5000">До 5 000 ₸</option>
          <option value="5000-10000">5 000–10 000 ₸</option>
          <option value="10000+">10 000 ₸+</option>
        </select>
      </div>

      <DateScroller />

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <CreateEventCard />
        {filtered.map((e) => (
          <EventCard key={e.id} e={e} />
        ))}
      </div>
    </div>
  )
}