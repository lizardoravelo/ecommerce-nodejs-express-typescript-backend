import { Response } from 'express';

// Helper function for sending error responses
const handleErrorResponse = (res: Response, err: any): void => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};

export default handleErrorResponse;
