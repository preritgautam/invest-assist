// app/api/scenarios/route.js
import { v4 as uuidv4 } from "uuid";
import { requireUserId } from "@/lib/auth"; // change if you don't have path alias 
import { query } from '../../../lib/db';

/**
 * NOTE about imports:
 * - If your project doesn't use path alias '@', replace "@/lib/auth" with relative path:
 *   "../../../../../lib/auth" (depending on where your files are located).
 * - Similarly adjust "@/db" to point to the file that exports `query` (your db.js).
 */

/* GET: list scenarios for current user */
export async function GET(request) {
  try {
    const userId = requireUserId(request);

    const r = await query(
      `SELECT id::text, owner_id, name, description, payload, created_at, updated_at
       FROM scenarios
       WHERE owner_id = $1 AND deleted = false
       ORDER BY created_at DESC`,
      [userId]
    );

    return new Response(JSON.stringify({ scenarios: r.rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GET /api/scenarios error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: err.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/* POST: create scenario for current user */
export async function POST(request) {
  try {
    const userId = requireUserId(request);
    const body = await request.json();

    const { name, description, payload } = body || {};
    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const id = uuidv4();
    const payloadJson = payload ? JSON.stringify(payload) : JSON.stringify({});

    const insert = await query(
      `INSERT INTO scenarios (id, owner_id, name, description, payload)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id::text, owner_id, name, description, payload, created_at, updated_at`,
      [id, userId, name, description || null, payloadJson]
    );

    return new Response(JSON.stringify({ scenario: insert.rows[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("POST /api/scenarios error:", err);
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: err.status || 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
