import { app } from './main/app';
import { connectDB } from './infra/mongo/connection';

const PORT = process.env.PORT || 3333;

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
