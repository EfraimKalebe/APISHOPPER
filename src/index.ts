import express from 'express';
import dotenv from 'dotenv';
import measureController from './controllers/measureController';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/upload', measureController.upload);
app.patch('/confirm', measureController.confirm);
app.get('/:customerCode/list', measureController.list);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
