import { JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    // Merge our JWT payload into passport's User so req.user is typed correctly
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends JwtPayload {}
    interface Request {
      jwtUser?: JwtPayload;
    }
  }
}
