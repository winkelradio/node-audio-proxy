const express = require('express');
const https = require('https');
const http = require('http');
const app = express();

app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
        return res.status(400).send('Ongeldige of ontbrekende URL');
    }

    const client = targetUrl.startsWith('https') ? https : http;

    // ✅ Zet CORS headers vóór je iets doorstuurt
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');

    const proxyReq = client.get(targetUrl, proxyRes => {
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'audio/mpeg');
        proxyRes.pipe(res);
    });

    req.on('close', () => {
        proxyReq.destroy(); // client gesloten = kap verbinding
    });

    proxyReq.on('error', () => {
        res.status(502).send('Stream fout');
    });
});
