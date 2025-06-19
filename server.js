const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const toyxonaRoutes = require('./routes/toyxona.routes');
const bronRoutes = require('./routes/bron.routes');
const ownerRoutes = require('./routes/owner.routes');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);    // Login / Register
app.use('/api/', userRoutes);   // Foydalanuvchilar bo‘yicha marshrutlar
app.use('/api/admin', adminRoutes);
app.use('/api/toyxonalar', toyxonaRoutes); 
app.use('/api/bron', bronRoutes); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/owner', ownerRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
