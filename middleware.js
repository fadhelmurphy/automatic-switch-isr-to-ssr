import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: '/',
}

export function middleware(req) {
  // Parse the cookie
  // const isInBeta = JSON.parse(req.cookies.get('beta')?.value || 'false')

  // Update url pathname
  req.nextUrl.pathname = `/mantap-static`

  // Rewrite to url
  return NextResponse.rewrite(req.nextUrl)
}