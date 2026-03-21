import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, signJWT, getAuthCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: '请输入密码' }, { status: 400 });
    }

    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash) {
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    const valid = await verifyPassword(password, hash);
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const token = await signJWT({ role: 'admin' });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(getAuthCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
