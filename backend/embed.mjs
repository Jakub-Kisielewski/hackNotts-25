import pg from "pg"
import dotenv from "dotenv"
import { pipeline } from "@xenova/transformers"

dotenv.config()
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main()
{
    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")

    const { rows } = await pool.query("SELECT id, label, tags, company FROM products")

    for (const row of rows) {
        const text = `${row.label} ${row.tags || ""} ${row.company || ""}`
        const output = await embedder(text, { pooling: "mean", normalize: true })
        const arr = Array.from(output.data)

        const vectorStr = "[" + arr.join(",") + "]"
        await pool.query("UPDATE products SET embedding = $1 WHERE id = $2", [vectorStr, row.id])

        console.log("embedded:", row.id, row.label)
    }

    await pool.end()
}

main().catch(err => {
    console.error("Embed error:", err)
    process.exit(1)
})
