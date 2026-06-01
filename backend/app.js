const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const authApi = require('./api/auth');
const scoreApi = require('./api/score');
const skillApi = require('./api/skill');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', authApi);
app.use('/api', scoreApi);
app.use('/api', skillApi);

app.listen(3000, () => console.log('服务器启动，端口3000 http://localhost:3000'));