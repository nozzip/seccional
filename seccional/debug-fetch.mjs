import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
});

const url = `${env.VITE_SUPABASE_URL}/rest/v1/court_bookings`;
const headers = {
  apikey: env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function check() {
  const payload = {
    court_type: 0,
    court_sub_number: 1,
    day_name: "Lunes",
    start_time: "10:00",
    duration: 60,
    user_name: "Test",
    is_weekly: false,
    booking_date: "2026-03-01",
    status: "Pendiente",
  };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  console.log("STATUS:", res.status);
  console.log("DATA:", data);
}

check();
