"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type Visibility = "public" | "private"
type PriceMode = "free" | "paid"

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Эта штука выкинет анонима на страницу логина
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
      }
    }
    checkUser()
  }, [router, supabase])

  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [priceMode, setPriceMode] = useState<PriceMode>("free")
  const [priceKzt, setPriceKzt] = useState("")
  const [visibility, setVisibility] = useState<Visibility>("public")
  const [capacity, setCapacity] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [format, setFormat] = useState<"offline" | "online" | "hybrid">("offline")
  const STORAGE_KEY = "lupa_public_events"

  const ok = useMemo(() => {
    if (!title.trim()) return false
    if (!startsAt) return false
    if (!address.trim()) return false
    if (priceMode === "paid" && !priceKzt.trim()) return false
    if (endsAt && startsAt && endsAt < startsAt) return false
    return true
  }, [title, startsAt, endsAt, address, priceMode, priceKzt])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault() // Чтобы страница не перезагружалась
    if (!ok) return    // Если поля не заполнены — ничего не делаем

    // 1. Собираем объект со всеми данными из полей формы
    const eventData = {
      title: title.trim(),
      datetime: startsAt,
      endsAt: endsAt || null,
      place: address.trim(),
      format: format, // То самое поле (online/offline), которое мы добавили
      price: priceMode === "free" ? "Бесплатно" : `от ${priceKzt.trim()} ₸`,
      description: description.trim(),
      visibility,
      capacity: capacity.trim() ? Number(capacity) : null,
      imageUrl: coverUrl.trim() || "",
    }

    try {
      // 2. Стучимся в твой бэкенд (API)
      const response = await fetch("/api/events", {
        method: "POST", // Говорим: "Мы хотим СОЗДАТЬ данные"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData), // Превращаем объект в текст для отправки
      })

      if (response.ok) {
        // 3. Если всё сохранилось — отправляем пользователя на главную
        router.push("/")
      } else {
        alert("Ошибка на сервере: не удалось сохранить")
      }
    } catch (err) {
      console.error(err)
      alert("Ошибка сети: проверь соединение")
    }
  }
  
  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border px-4 py-2 hover:bg-muted/40 transition"
          >
            ← Назад
          </button>

          <div className="text-right">
            <div className="text-lg font-semibold">Создать мероприятие</div>
            <div className="text-sm text-muted-foreground">
              
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6 bg-background/40">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Cover */}
<section className="space-y-3">
  <div className="text-sm text-muted-foreground">Обложка</div>

  <div className="overflow-hidden rounded-2xl border bg-muted/10">
    <div className="h-56 sm:h-64 md:h-72 lg:h-80">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt="Обложка события"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Добавь фото для события (опционально)
        </div>
      )}
    </div>

    <div className="border-t p-3">
      <input
        value={coverUrl}
        onChange={(e) => setCoverUrl(e.target.value)}
        placeholder="Вставь ссылку на фото (позже сделаем загрузку файла)"
        className="w-full rounded-xl border px-4 py-2 bg-transparent outline-none"
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => setCoverUrl("")}
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          Очистить
        </button>
      </div>
    </div>
  </div>


</section>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Название</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название события"
                className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Начало</div>
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Конец</div>
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Адрес</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Адрес (позже подключим 2ГИС)"
                className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
              />
              <div className="rounded-xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                Здесь будет карта/поиск 2ГИС
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Описание</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание события"
                className="min-h-[120px] w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
              />
            </div>

        <div className="space-y-2">
  <div className="text-sm text-muted-foreground">Формат</div>
  <select
    value={format}
    onChange={(e) => setFormat(e.target.value as any)}
    className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none hover:bg-muted/40 transition"
  >
    <option value="offline" className="bg-background">Оффлайн </option>
    <option value="online" className="bg-background">Онлайн </option>
    <option value="hybrid" className="bg-background">Гибрид</option>
  </select>
</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Цена</div>
                <select
                  value={priceMode}
                  onChange={(e) => setPriceMode(e.target.value as PriceMode)}
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none hover:bg-muted/40 transition"
                >
                  <option value="free" className="bg-background">Бесплатно</option>
                  <option value="paid" className="bg-background">Платно</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Сумма (₸)</div>
                <input
                  value={priceKzt}
                  onChange={(e) => setPriceKzt(e.target.value)}
                  disabled={priceMode === "free"}
                
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Видимость</div>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none hover:bg-muted/40 transition"
                >
                  <option value="public" className="bg-background">Публичная</option>
                  <option value="private" className="bg-background">Приватная</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Вместимость</div>
                <input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  
                  className="w-full rounded-xl border px-4 py-3 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border px-5 py-3 hover:bg-muted/40 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!ok}
                className="rounded-xl border px-6 py-3 hover:bg-muted/40 transition disabled:opacity-50"
              >
                Создать событие
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}