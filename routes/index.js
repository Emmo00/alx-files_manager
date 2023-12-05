import express from 'express';
import AppController from '../controllers/AppController';
import UserController from '../controllers/UserController';

const router = express.Router();

router.get('/status', AppController.getStatus);

router.get('/stats', AppController.getStats);

router.post('/users', UserController.postNew);

router.get('/connect', AuthController.getConnect);

router.get('/disconnect', AuthController.getDisconnect);

router.get('/users/me', UserController.getMe);

export default router;
