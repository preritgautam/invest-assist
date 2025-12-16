// app/api/scenarios/route.js
import { v4 as uuidv4 } from "uuid";
import { query } from '../../../lib/db';
import { createClient } from '../../../lib/supabase/server';

async function getUserId() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  return user.id;
}

/* GET: list scenarios for current user */
export async function GET(request) {
  try {
    const userId = await getUserId();

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
    const userId = await getUserId();
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
