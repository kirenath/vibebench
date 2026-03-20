import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  console.log("Starting receipt migration...");

  const vendorData = [
    { id: "openai", name: "OpenAI" },
    { id: "anthropic", name: "Anthropic" },
    { id: "google", name: "Google" },
  ];

  const familyData = [
    { id: "chatgpt", vendor_id: "openai", name: "ChatGPT" },
    { id: "codex", vendor_id: "openai", name: "Codex" },
    { id: "claude", vendor_id: "anthropic", name: "Claude" },
    { id: "gemini", vendor_id: "google", name: "Gemini" },
  ];

  const channelData = [
    { id: "web", name: "Web" },
    { id: "api", name: "API" },
    { id: "codex-app", name: "Codex App" },
  ];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const v of vendorData) {
      await client.query(
        `INSERT INTO vendors (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [v.id, v.name]
      );
      console.log(`  Vendor: ${v.name}`);
    }

    for (const f of familyData) {
      await client.query(
        `INSERT INTO model_families (id, vendor_id, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [f.id, f.vendor_id, f.name]
      );
      console.log(`  Family: ${f.name}`);
    }

    for (const c of channelData) {
      await client.query(
        `INSERT INTO channels (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name]
      );
      console.log(`  Channel: ${c.name}`);
    }

    const challengeId = "receipt";
    await client.query(
      `INSERT INTO challenges (id, title, description, rules_markdown, prompt_markdown, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, true, now())
       ON CONFLICT (id) DO NOTHING`,
      [
        challengeId,
        "Thermal Receipt Simulation",
        "Simulate a realistic thermal receipt using pure HTML/CSS/JS.",
        "Create a realistic thermal receipt. Must be self-contained HTML. No external dependencies.",
        "Create a thermal receipt that looks like it came from a real receipt printer.",
      ]
    );
    console.log(`  Challenge: ${challengeId}`);

    const phases = [
      { phase_key: "phase1", phase_label: "Phase 1", is_default: true, sort_order: 0 },
      { phase_key: "phase2", phase_label: "Phase 2", is_default: false, sort_order: 1 },
    ];

    for (const p of phases) {
      await client.query(
        `INSERT INTO challenge_phases (challenge_id, phase_key, phase_label, is_default, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (challenge_id, phase_key) DO NOTHING`,
        [challengeId, p.phase_key, p.phase_label, p.is_default, p.sort_order]
      );
      console.log(`  Phase: ${p.phase_label}`);
    }

    await client.query("COMMIT");
    console.log("\nMigration completed successfully!");
    console.log("Note: Model variants and submissions need to be added manually via the admin panel.");
    console.log("      Upload HTML/PRD files through the admin submissions page.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
