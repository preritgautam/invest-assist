import { mg } from "@/lib/mailgun"

export async function POST(req: Request) {
  const { to, subject, text, html } = await req.json()

  try {
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: process.env.MAILGUN_FROM!,
      to,
      subject,
      text,
      html,
    })

    return Response.json({ success: true, id: result.id })
  } catch (error: any) {
    console.error("Mailgun error:", error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
    })
  }
}
