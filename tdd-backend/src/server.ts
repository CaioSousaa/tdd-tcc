import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './infra/mongo/connection';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

export default app;