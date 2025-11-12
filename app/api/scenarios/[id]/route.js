// app/api/scenarios/[id]/route.js
import { requireUserId } from "@/lib/auth"; 
import {query} from "../../../lib/db.js";           

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const userId = requireUserId(request);

    const r = await query(
      `SELECT id::text, owner_id, name, description, payload, created_at, updated_at
       FROM scenarios WHERE id = $1`,
      [id]
    );
    if (r.rowCount === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });

    const scenario = r.rows[0];
    if (scenario.owner_id !== userId) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });

    return new Response(JSON.stringify({ scenario }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("GET /api/scenarios/[id] error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: err.status || 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const userId = requireUserId(request);
    const body = await request.json();
    const { name, description, payload } = body || {};

    // fetch existing
    const fetch = await query("SELECT owner_id FROM scenarios WHERE id = $1", [id]);
    if (fetch.rowCount === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (fetch.rows[0].owner_id !== userId) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });

    const payloadJson = payload ? JSON.stringify(payload) : null;
    const updated = await query(
      `UPDATE scenarios SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         payload = COALESCE($4, payload),
         updated_at = now()
       WHERE id = $1
       RETURNING id::text, owner_id, name, description, payload, created_at, updated_at`,
      [id, name, description, payloadJson]
    );

    return new Response(JSON.stringify({ scenario: updated.rows[0] }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("PUT /api/scenarios/[id] error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: err.status || 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const userId = requireUserId(request);

    const fetch = await query("SELECT owner_id FROM scenarios WHERE id = $1", [id]);
    if (fetch.rowCount === 0) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    if (fetch.rows[0].owner_id !== userId) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });

    await query("UPDATE scenarios SET deleted = true, updated_at = now() WHERE id = $1", [id]);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("DELETE /api/scenarios/[id] error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: err.status || 500, headers: { "Content-Type": "application/json" } });
  }
}
