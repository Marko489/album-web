import { put, generateUploadUrl } from '@vercel/blob';

export async function GET() {
  const { url } = await generateUploadUrl();
  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
