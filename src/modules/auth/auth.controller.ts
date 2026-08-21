import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput, RefreshInput, LogoutInput } from './auth.validation';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RefreshInput;
      const result = await authService.refresh(data);

      res.status(200).json({
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LogoutInput;
      const result = await authService.logout(data);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
