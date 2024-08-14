import { Request, Response } from 'express';
import User, { IUser } from '@model/user';
import { IUserContext } from 'contracts/request';
import handleErrorResponse from '@middleware/error-handler';
import jwt from 'jsonwebtoken';
import config from '@config/constants';

interface IUserController {
  register: (req: Request, res: Response) => Promise<void>;
  login: (req: Request, res: Response) => Promise<void>;
  getAllUsers: (req: Request, res: Response) => Promise<void>;
  getUserById: (req: Request<{ id: string }, any, IUserContext>, res: Response) => Promise<void>;
  updateUserById: (
    req: Request<{ id: string }, any, Partial<IUser> & { context: { activeUser: IUser } }>,
    res: Response,
  ) => Promise<void>;
  deleteUserById: (req: Request<{ id: string }>, res: Response) => Promise<void>;
}

const userCtrl: IUserController = {
  register: async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, address, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    try {
      const newUser = new User({
        name,
        email,
        password,
        address,
        phone,
        role,
      });
      const savedUser = await newUser.save();
      res.status(201).json({
        message: 'User registered successfully',
        user: savedUser,
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }

      const token = jwt.sign({ id: user._id, role: user.role }, config.secret, { expiresIn: '1h' });
      res.status(200).json({
        message: 'Login successful',
        token,
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find().populate('role');
      res.status(200).json(users);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  getUserById: async (req: Request<{ id: string }, any, IUserContext>, res: Response): Promise<void> => {
    const { activeUser } = req.body.context;
    try {
      if (activeUser._id !== req.params.id && activeUser.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: You can only access your own data' });
        return;
      }
      const user = await User.findById(req.params.id).populate('role');
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json(user);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  updateUserById: async (
    req: Request<{ id: string }, any, Partial<IUser> & IUserContext>,
    res: Response,
  ): Promise<void> => {
    const { name, email, password, address, phone, role, active } = req.body;
    const { activeUser } = req.body.context;

    try {
      if (activeUser._id !== req.params.id && activeUser.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: You can only access your own data' });
        return;
      }
      const updatedFields: Partial<IUser> = { name, email, address, phone, role, active };
      if (password) {
        updatedFields.password = password;
      }

      const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedFields, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
  deleteUserById: async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(200).json({
        message: 'User deleted successfully',
        user: deletedUser,
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
};

export default userCtrl;
