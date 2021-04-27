const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const cors  = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
require('./app/controllers/index')(app);

app.listen(process.env.PORT || 3000);
