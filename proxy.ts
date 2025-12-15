import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // TODO: Implement auth check and redirect
  // Note: proxy runs on Edge - use for simple checks only
  // For full auth, use Supabase session check in layouts
  return NextResponse.next();
}

export const config = {
  matcher: ['/(dashboard)/:path*'],
};
