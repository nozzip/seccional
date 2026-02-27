const fs = require("fs");
const dotenv = require("dotenv");
// load env
const envConfig = dotenv.parse(fs.readFileSync(".env.local"));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

async function run() {
  const { data, error } = await supabase.from("court_bookings").insert({
    court_type: 0,
    court_sub_number: 1,
    day_name: "Lunes",
    start_time: "10:00",
    duration: 60,
    user_name: "Test",
    is_weekly: false,
    booking_date: "2026-03-01",
    status: "Pendiente",
  });
  console.log("INSERT ERROR:", JSON.stringify(error, null, 2));
}

run();
