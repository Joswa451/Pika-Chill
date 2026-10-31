const path = require('path')

// Load backend/.env before importing the app, independent of the shell's cwd.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const app = require('./app')
const { startNotificationRealtime } = require('./features/notifications/notifications.service')

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Ernest Eats API is running!'
    });
});

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy'
    });
});

const PORT = process.env.PORT || 5000
startNotificationRealtime()
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
