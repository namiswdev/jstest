// app.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('./knexfile'));

const app = express();
app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ status: 401, message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ status: 401, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.id, role_type: user.role_type },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 200,
      message: 'Logged in',
      result: {
        user_id: user.id,
        access_token: token,
        token_type: 'Bearer',
        role_type: user.role_type,
        expires_at: new Date(Date.now() + 24*60*60*1000).toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
});

// Get listings endpoint
app.get('/api/listings', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const userLat = parseFloat(latitude);
    const userLong = parseFloat(longitude);

    // Get listings and calculate distances
    const listings = await knex('listings')
      .select('*')
      .then(listings => listings.map(listing => ({
        ...listing,
        distance: calculateDistance(userLat, userLong, listing.latitude, listing.longitude)
      })))
      .then(listings => listings.sort((a, b) => a.distance - b.distance));

    res.json({
      status: 200,
      message: 'Success',
      result: {
        current_page: 1,
        data: listings.map(listing => ({
          id: listing.id,
          name: listing.name,
          distance: listing.distance.toFixed(2),
          created_at: listing.created_at,
          updated_at: listing.updated_at
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Server error' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
