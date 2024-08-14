import { Router } from 'express';
import authorize from '@middleware/authorization';
import userCtrl from '@controller/auth.controller';

const { register, login, getAllUsers, getUserById, updateUserById, deleteUserById } = userCtrl;

export const auth = (router: Router): void => {
  router.post('/register', register);

  router.post('/login', login);

  router.route('/users').get(authorize(['admin']), getAllUsers);

  router
    .route('/users/:id')
    .get(authorize(['admin', 'user']), getUserById)
    .put(authorize(['admin', 'user']), updateUserById)
    .delete(authorize(['admin']), deleteUserById);
};
