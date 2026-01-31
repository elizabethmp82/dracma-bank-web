
import { NextResponse } from "next/server";

export const API_URL = process.env.NEXT_PUBLIC_API_URL  || "http://191.252.110.78/api";

function buildTargetUrl(req: Request, pathParts: string[]) {
  const incoming = new URL(req.url);
  const path = pathParts.join("/");
  // mantém querystring (?a=1&b=2)
  return `${API_URL}/${path}${incoming.search}`;
}

async function forward(req: Request, method: string, pathParts: string[]) {
  const target = buildTargetUrl(req, pathParts);

  // copia alguns headers úteis (token, etc.)
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // se você usa cookies/sessão, pode repassar cookie também:
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  // corpo só para métodos que aceitam body
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const resp = await fetch(target, {
    method,
    headers,
    body,
    // evita cache
    cache: "no-store",
    // importante: server-to-server
    redirect: "manual",
  });

  // devolve exatamente o que o backend respondeu
  const respBody = await resp.arrayBuffer();
  const outHeaders = new Headers(resp.headers);

  // opcional: evitar problemas de CORS no browser (normalmente nem precisa)
  outHeaders.set("access-control-allow-origin", "*");

  return new NextResponse(respBody, {
    status: resp.status,
    headers: outHeaders,
  });
}

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, "GET", params.path);
}
export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, "POST", params.path);
}
export async function PUT(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, "PUT", params.path);
}
export async function PATCH(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, "PATCH", params.path);
}
export async function DELETE(req: Request, { params }: { params: { path: string[] } }) {
  return forward(req, "DELETE", params.path);
}

// Preflight (se algum dia precisar)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "authorization,content-type",
    },
  });
}
