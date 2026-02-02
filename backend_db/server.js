require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const product = require('./routes/product');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/pdfs', express.static(path.join(__dirname, 'public/pdfs')));
app.use(morgan('dev')); 
app.use('/api', product);

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
