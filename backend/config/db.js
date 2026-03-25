import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('FATAL: MONGO_URI is missing in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connected successfully.');
  } catch (error) {
    console.error('FATAL: MongoDB connection failed.');
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
