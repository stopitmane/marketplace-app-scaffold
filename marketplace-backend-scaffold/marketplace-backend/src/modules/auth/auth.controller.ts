import type { Request, Response } from 'express';
import type { AuthService } from './auth.service';

/**
 * Controllers only: parse the request, call the service, shape the
 * response. No business logic, no direct Prisma access - if you find
 * yourself writing an `if` here beyond "which field did the client send",
 * it belongs in AuthService instead.
 */
export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    const tokens = await this.service.register(email, password, name);
    res.status(201).json(tokens);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const tokens = await this.service.login(email, password);
    res.status(200).json(tokens);
  };

  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.service.refresh(refreshToken);
    res.status(200).json(tokens);
  };
}
