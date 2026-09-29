import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// AUTH GATE TEMPORARILY DISABLED — demo mode
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
