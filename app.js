const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { connectDB, connection } = require('./db'); // Pastikan jalur './db' sudah benar
require('dotenv').config();

const app = express();

// Hubungkan ke database
connectDB(); // Memanggil fungsi untuk menghubungkan ke database

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware autentikasi
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
}

// Rute
app.get('/', (req, res) => res.redirect('/auth/login'));
app.get('/auth/login', (req, res) => res.render('auth/login'));
app.get('/auth/register', (req, res) => res.render('auth/register'));

// Rute register
app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, hashedPassword], (error) => {
        if (error) {
            console.error('Gagal menyimpan user:', error);
            return res.redirect('/auth/register');
        }
        res.redirect('/auth/login');
    });
});

// Rute login
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], async (error, results) => {
        if (error || results.length === 0) {
            return res.redirect('/auth/login');
        }
        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            req.session.user = user;
            res.redirect('/profile');
        } else {
            res.redirect('/auth/login');
        }
    });
});

// Rute profil dan logout
app.get('/profile', isAuthenticated, (req, res) => res.render('profile', { user: req.session.user }));
app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/profile');
        res.redirect('/auth/login');
    });
});

// Menjalankan server di port 3000
app.listen(3000, () => {
    console.log("Server berjalan di port 3000, buka web melalui http://localhost:3000");
});

// Middleware untuk menangani error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Terjadi kesalahan pada server.');
});
