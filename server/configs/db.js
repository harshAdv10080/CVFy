import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        })

        let mongodbURI = process.env.MONGODB_URI;
        const projectName = "CVFy";

        if(!mongodbURI){
            throw new Error("MongoDB_URI environment variable not set");
        }

        if(mongodbURI.endsWith('/')){
            mongodbURI = mongodbURI.slice(0, -1);
        }

        await mongoose.connect(`${mongodbURI}/${projectName}`);
    }catch(err){
        console.error('Error connecting to MongoDB:', err);
    }
}

export default connectDB;