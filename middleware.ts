import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 1. Лог пути (ты его уже видел, значит файл работает)
  console.log("--- Middleware работает на:", req.nextUrl.pathname)

  // 2. Получаем сессию
  const { data: { session } } = await supabase.auth.getSession()

  // 3. ЛОГ СЕССИИ (тот самый, что ты просил)
  // Покажет true, если ты вошел, и false, если ты аноним
  console.log("--- СЕССИЯ НАЙДЕНА?", !!session)

  // 4. Логика защиты
  if (!session && req.nextUrl.pathname.startsWith('/events/new')) {
    console.log("--- ДОСТУП ЗАПРЕЩЕН: Редирект на /login")
    
    // Делаем редирект на страницу логина
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  // Проверяем эти пути
  matcher: ['/events/new', '/dashboard/:path*'],
}