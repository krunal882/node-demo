const path = require('path')
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json()); //add limit


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


app.use(cookieParser());
app.use(helmet());

const limiter = rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later'
});

app.use('/', limiter);

app.use(mongoSanitize());

app.use(xss());


const whitelist = ['muscle', 'type', 'equipment', 'difficulty']
app.use(hpp({
    whitelist: whitelist
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(express.json());

const userRoutes = require('./routes/userRoutes')
const exerciseRoutes = require('./routes/exerciseRoutes')

app.get('/login', (req, res) => {
    res.status(200).render('login')
})

app.get('/signup', async (req, res) => {
    await res.status(200).render('signup', 'success');
})

app.use('/', userRoutes)
app.use('/', exerciseRoutes)
module.exports = app;