import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    // Visitantes veem a apresentacao; usuarios conectados continuam no Dashboard.
    if (request.nextUrl.pathname === "/" && !request.nextauth.token?.uid) {
      return NextResponse.redirect(new URL("/bem-vindo", request.url));
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: {
      authorized: ({ token, req }) =>
        req.nextUrl.pathname === "/" || Boolean(token?.uid),
    },
  }
);

export const config = {
  matcher: ["/", "/perfil/:path*", "/vagas/:path*", "/curriculos/:path*", "/oportunidades/:path*", "/configuracoes/:path*", "/fontes/:path*"],
};
