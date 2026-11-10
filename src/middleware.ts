import { NextRequest, NextResponse } from "next/server";

// When a guest opens their personal QR link (/rsvp/<token>), establish a
// session cookie and send them to their hub at /me. This keeps the QR a
// one-scan sign-in while /me validates the token against the database.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = pathname.split("/")[2]; // /rsvp/<token>
  const res = NextResponse.redirect(new URL("/me", req.url));
  if (token) {
    res.cookies.set("guest_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export const config = {
  matcher: ["/rsvp/:token*"],
};
