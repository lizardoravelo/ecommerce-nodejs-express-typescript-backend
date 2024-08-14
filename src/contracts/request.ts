import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IUser } from '@model/user';

// Custom interface for the request
export interface ICombinedRequest<Context, Body, Params extends ParamsDictionary = ParamsDictionary>
  extends Request<Params> {
  context: Context;
  body: Body;
  params: Params;
}

// Interface for the user in context
export interface IUserContext {
  context: {
    activeUser: IUser;
  };
}
