import User from '../models/User.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, language } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      language: language || 'en'
    });

    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, phone, language } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, language },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      userId: user._id,
      name: user.name,
      email: user.email,
      language: user.language
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
