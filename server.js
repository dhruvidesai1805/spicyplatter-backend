
const dotenv = require("dotenv");
const express = require('express');
const mongoose = require('mongoose');
dotenv.config({ path: "./config.env" });
const cors = require('cors');
const otpGenerator = require('otp-generator');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes and other configurations

const PORT = 5005;

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Create a user schema and model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const contactSchema = new mongoose.Schema({
  Name: String,
  Email: String,
  Number: String,
  Message: String,
});
const reservationSchema = new mongoose.Schema({
  clientName: String,
  email: String,
  number: String,
  date: Date,
  time: String,
  persons: Number,
  message: String,
  donate_food: Boolean,
  food_wastage_notes: String,
});

const Reservation = mongoose.model('Reservation', reservationSchema);

const User = mongoose.model('User', userSchema);  
const Contact = mongoose.model('Contact', contactSchema);

// Express routes
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists in the database
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Authentication successful
    return res.json({ message: 'Login successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();

    return res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { Name, Email, Number, Message } = req.body;

    // Create a new contact
    const newContact = new Contact({
      Name,
      Email,
      Number,
      Message,
    });

    // Save the contact to the database
    await newContact.save();

    res.json({ message: 'Contact created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    // Fetch all contacts from the database
    const contacts = await Contact.find();

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/reservation', async (req, res) => {
  try {
    // Fetch all contacts from the database
    const contacts = await Reservation.find();

    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




// Routes
app.post('/api/reservation', async (req, res) => {
  try {
    const {
      clientName,
      email,
      number,
      date,
      time,
      persons,
      message,
      donate_food,
      food_wastage_notes,
    } = req.body;

    // Create a new reservation
    const newReservation = new Reservation({
      clientName,
      email,
      number,
      date,
      time,
      persons,
      message,
      donate_food,
      food_wastage_notes,
    });

    // Save the reservation to the database
    await newReservation.save();

    res.json({ message: 'Reservation created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/reservation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the reservation with the specified ID
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.json(reservation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/reservation/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the reservation with the specified ID from the database
    const deletedReservation = await Reservation.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the reservation with the specified ID
    const reservation = await Contact.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.json(reservation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
  
app.delete('/api/contact/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the reservation with the specified ID from the database
    const deletedReservation = await Contact.findByIdAndDelete(id);

    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    return res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
