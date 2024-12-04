const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Telegraf } = require("telegraf");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lgbnsbrrybyfdqkkchpm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYm5zYnJyeWJ5ZmRxa2tjaHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0OTEzOTUsImV4cCI6MjA0NzA2NzM5NX0.De-PqHbs_65H8oQcNuFYDLC3YI-H7IpFDEipxgh_g2g";
const supabase = createClient(supabaseUrl, supabaseKey);

const botToken = "7831120296:AAEUYrbzyZDhpAH7-TaLt1gzAAuv7vwrxQM"; // Replace with your actual bot token
const bot = new Telegraf(botToken);

const app = express();
app.use(bodyParser.json());

// Configure CORS
const corsOptions = {
  origin: ["https://frontend-mu-flame.vercel.app", "http://localhost:3000"], // Replace with your allowed domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Define the /sendnotification endpoint
app.post("/sendnotification", async (req, res) => {
  const { telegram_id, sender } = req.body;

  if (!telegram_id) {
    return res.status(400).json({ error: "telegram_id is required" });
  }
  // get user name from supabase database "users" using sender as telegram_id
  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq("telegram_id", sender);

  try {
    // Send the notification
    await bot.telegram.sendMessage(
      telegram_id,
      `У тебя новое сообщение от ${data[0].name}! 📨\n\nОткрой мини-приложение, чтобы прочитать его:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Открыть приложение",
                web_app: {
                  url: `https://frontend-mu-flame.vercel.app/register/${telegram_id}`,
                },
              },
            ],
          ],
        },
      }
    );

    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  ctx.replyWithHTML(
    `Перейдите в наше мини-приложение, чтобы начать знакомиться:`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "открыть приложение",
              web_app: {
                url: `https://frontend-mu-flame.vercel.app/register/${userId}`,
                isFullscreen: true
              },
            },
          ],
        ],
      },
    }
  );
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
