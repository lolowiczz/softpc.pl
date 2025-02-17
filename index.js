const express = require('express');
const mysql = require('mysql');
const axios = require('axios');

const router = express.Router();
const pool = mysql.createPool({
    host: 'autornet.pl',
    user: 'lolowicz',
    password: 'KAmX5fNDo4BHwTZ',
    database: 'codelaunch',
    connectionLimit: 10,
});

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1338853031583809617/NrSJJNejcgaFsfu9kkrDuy7Ah_ePrVSYpUjqBr37xLpv09xGCFTmHG0A-55JoJKaIjRJ'; // Replace with your actual webhook URL

// Function to send a Discord webhook embed
const sendDiscordWebhook = (username, status) => {
    const embed = {
        title: "Login Attempt",
        color: status === "Success" ? 3066993 : 15158332, // Green for success, red for failure
        fields: [
            { name: "User ID", value: username || "Unknown", inline: true },
            { name: "Status", value: status, inline: true },
            { name: "Timestamp", value: new Date().toISOString(), inline: false }
        ]
    };

    axios.post(DISCORD_WEBHOOK_URL, { embeds: [embed] })
        .catch(err => console.error("Discord Webhook Error:", err));
};

router.get('/login', (req, res) => {
    const { token } = req.query;

    if (!token) {
        sendDiscordWebhook(null, "Failed - No Token Provided");
        return res.status(400).json({ error: 'No token provided.' });
    }

    pool.query(
        'SELECT userId FROM login_tokens WHERE token = ?',
        [token],
        (err, rows) => {
            if (err) {
                console.error(err);
                sendDiscordWebhook(null, "Failed - Database Error");
                return res.status(500).json({ error: 'Database error.' });
            }

            if (rows.length < 1) {
                sendDiscordWebhook(null, "Failed - Invalid Token");
                return res.status(401).json({ error: 'Invalid token.' });
            }

            const userId = rows[0].userId;
            sendDiscordWebhook(userId, "Success");
            res.json({ success: true, message: 'User authenticated.', userId });
        }
    );
});

module.exports = router;
