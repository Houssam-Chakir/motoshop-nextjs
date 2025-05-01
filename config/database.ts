import mongoose, { ConnectionStates } from 'mongoose';

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * It checks the connection state to avoid multiple connection attempts.
 */
const connectDB = async (): Promise<void> => {
    // 1. Check if MongoDB URI is provided
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('❌ Error: MONGODB_URI environment variable is not defined.');
        throw new Error('Undefined MongoDB URI');
    }

    // 2. Use Mongoose's built-in connection state to prevent redundant connections
    // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === ConnectionStates.connected) {
        console.log('ℹ️ MongoDB is already connected.');
        return;
    }

    // If it's currently connecting, wait a moment and check again or just return to avoid concurrent attempts.
    // For simplicity here, we'll just log and return if it's already in the process of connecting.
    if (mongoose.connection.readyState === ConnectionStates.connecting) {
        console.log('ℹ️ MongoDB connection is already in progress.');
        return;
    }

    try {
        // 3. Set Mongoose global options (like strictQuery) *before* connecting
        // Ensures only fields defined in the schema are saved to the database.
        mongoose.set('strictQuery', true);

        console.log('🟡 Connecting to MongoDB...');

        // 4. Attempt to connect to the database
        await mongoose.connect(MONGODB_URI);

        console.log('✅ MongoDB connected successfully.');

    } catch (error: unknown) { // Type error as 'unknown' for better type safety
        console.error('❌ Error connecting to MongoDB:', error instanceof Error ? error.message : error);

        // Optional: Re-throw the error if the connection is critical for startup
        // throw error;

        // Optional: Exit the process if connection fails on startup
        // process.exit(1);
    }
};

export default connectDB;

// Example of how to handle connection events globally (optional)
// These handlers are often placed in a central part of your application setup
mongoose.connection.on('error', (err) => {
    console.error(`❌ Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose connection disconnected.');
});

mongoose.connection.on('reconnected', () => {
    console.log('♻️ Mongoose connection reconnected.');
});
