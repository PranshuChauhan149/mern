import express from 'express'
import { isAuth, Login, logout, register } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();


userRouter.post('/register',register)
userRouter.post('/login',Login)
userRouter.get('/is-auth',authUser,isAuth)
userRouter.get('/logout',authUser,logout)


export default userRouter;