/**
 * @fileoverview AuthModule — DI module for authentication services.
 *
 * `forRoot()` registers AuthService, SessionService, SecurityService,
 * and AccessControlService in the DI container.
 *
 * @module @stackra/react-auth
 * @category Module
 */

import { AuthService } from "@/services/auth.service";
import { SessionService } from "@/services/session.service";
import { SecurityService } from "@/services/security.service";
import { AccessControlService } from "@/services/access-control.service";
import {
  AUTH_SERVICE,
  SESSION_SERVICE,
  SECURITY_SERVICE,
  ACCESS_CONTROL_SERVICE,
} from "@/constants";
import type { IAuthService } from "@/interfaces/auth-service.interface";
import type { IAccessControlService } from "@/interfaces/access-control-service.interface";

/** Configuration options for `AuthModule.forRoot()`. */
export interface AuthModuleOptions {
  /** Custom auth service instance or class. */
  authService?: any;
  /** Custom access control service instance or class. */
  accessControlService?: any;
  /** Whether this module should be registered globally. @default true */
  isGlobal?: boolean;
}

/**
 * DI module for authentication, session, security, and access control.
 *
 * Usage:
 *   @Module({ imports: [AuthModule.forRoot()] })
 *   export class AppModule {}
 */
export class AuthModule {
  static forRoot(options: AuthModuleOptions = {}) {
    const resolveProvider = (token: symbol, userValue: any, defaultClass: any) =>
      userValue
        ? { provide: token, useValue: userValue }
        : { provide: token, useClass: defaultClass };

    const providers: any[] = [
      resolveProvider(AUTH_SERVICE, options.authService, AuthService),
      resolveProvider(ACCESS_CONTROL_SERVICE, options.accessControlService, AccessControlService),
      { provide: SESSION_SERVICE, useClass: SessionService },
      { provide: SECURITY_SERVICE, useClass: SecurityService },
    ];

    return {
      module: AuthModule,
      global: options.isGlobal ?? true,
      providers,
      exports: [AUTH_SERVICE, SESSION_SERVICE, SECURITY_SERVICE, ACCESS_CONTROL_SERVICE],
    };
  }
}
