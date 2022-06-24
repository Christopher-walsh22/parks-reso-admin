import { Injectable } from '@angular/core';
import { JwtUtil } from '../shared/utils/jwt-utils';
import { Constants } from '../shared/utils/constants';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';
import { ToastService } from './toast.service';

declare let Keycloak: any;

@Injectable()
export class KeycloakService {
  public LAST_IDP_AUTHENTICATED = 'kc-last-idp-authenticated';
  private keycloakAuth: any;
  private keycloakEnabled: boolean;
  private keycloakUrl: string;
  private keycloakRealm: string;

  public readonly idpHintEnum = {
    BCEID: 'bceid-basic-and-business',
    BCSC: 'bcsc',
    IDIR: 'idir'
  };

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
    private toastService: ToastService
  ) {}

  async init() {
    // Load up the config service data
    this.keycloakEnabled = this.configService.config['KEYCLOAK_ENABLED'];
    this.keycloakUrl = this.configService.config['KEYCLOAK_URL'];
    this.keycloakRealm = this.configService.config['KEYCLOAK_REALM'];

    if (this.keycloakEnabled) {
      // Bootup KC
      const keycloak_client_id = this.configService.config['KEYCLOAK_CLIENT_ID'];

      return new Promise<void>((resolve, reject) => {
        const config = {
          url: this.keycloakUrl,
          realm: this.keycloakRealm,
          clientId: !keycloak_client_id ? 'nrpti-admin' : keycloak_client_id
        };

        // console.log('KC Auth init.');

        this.keycloakAuth = new Keycloak(config);

        this.keycloakAuth.onAuthSuccess = () => {
          // console.log('onAuthSuccess');
        };

        this.keycloakAuth.onAuthError = () => {
          // console.log('onAuthError');
        };

        this.keycloakAuth.onAuthRefreshSuccess = () => {
          // console.log('onAuthRefreshSuccess');
        };

        this.keycloakAuth.onAuthRefreshError = () => {
          // console.log('onAuthRefreshError');
        };

        this.keycloakAuth.onAuthLogout = () => {
          console.log('onAuthLogout');
        };

        // Try to get refresh tokens in the background
        this.keycloakAuth.onTokenExpired = () => {
          this.keycloakAuth
            .updateToken()
            .success(refreshed => {
              this.logger.log(`KC refreshed token?: ${refreshed}`);
            })
            .error(err => {
              this.logger.log(`KC refresh error: ${err}`);
            });
        };

        // Initialize.
        this.keycloakAuth
          .init({ checkLoginIframe: false })
          .success(auth => {
            // console.log('KC Refresh Success?:', this.keycloakAuth.authServerUrl);
            this.logger.log(`KC Success: ${auth}`);
            resolve();
          })
          .error(err => {
            this.toastService.addMessage(
              `Failed to initialize Keycloak.`,
              'Keycloak Service',
              Constants.ToastTypes.ERROR
            );
            this.logger.log(`KC error: ${err}`);
            reject();
          });
      });
    }
  }

  /**
   * Check if the current user is logged in.
   *
   * @returns {boolean} true if the user is logged in.
   * @memberof KeycloakService
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return this.keycloakAuth && this.keycloakAuth.authenticated === true;
  }

  /**
   * Check if the current user is logged in and has admin access.
   *
   * @returns {boolean} true if the user has access, false otherwise.
   * @memberof KeycloakService
   */
  isAuthorized(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const jwt = JwtUtil.decodeToken(token);

    if (!(jwt && jwt.resource_access
      && jwt.resource_access['parking-pass']
      && jwt.resource_access['parking-pass'].roles)) {
      return false;
    }

    return jwt.resource_access['parking-pass'].roles.length >= 1;
  }

  /**
   * Returns the current keycloak auth token.
   *
   * @returns {string} keycloak auth token.
   * @memberof KeycloakService
   */
  getToken(): string {
    return this.keycloakAuth && this.keycloakAuth.token;
  }

  /**
   * Returns an observable that emits when the auth token has been refreshed.
   * Call {@link KeycloakService#getToken} to fetch the updated token.
   *
   * @returns {Observable<string>}
   * @memberof KeycloakService
   */
  refreshToken(): Observable<any> {
    return new Observable(observer => {
      this.keycloakAuth
        .updateToken(30)
        .success(refreshed => {
          this.logger.log(`KC refreshed token?: ${refreshed}`);
          observer.next();
          observer.complete();
        })
        .error(err => {
          this.logger.log(`KC refresh error: ${err}`);
          observer.error();
        });

      return { unsubscribe() {} };
    });
  }

  /**
   * Redirects to keycloak and logs in
   * idpHint options:
   *
   * @param {string} idpHint which identity provider to use
   * @memberof KeycloakService
   */
  login(idpHint: string) {
    let redirectUri = window.location.href;
    // by default keycloak login will want to redirect back to the login page
    // redirect to '/dayuse' instead
    if (redirectUri.endsWith('/login')) {
      redirectUri = redirectUri.slice(0, redirectUri.lastIndexOf('/'));
    }
    return this.keycloakAuth && this.keycloakAuth.login({ idpHint: idpHint, redirectUri: redirectUri });
  }

  /**
   * Infers the identity provider from the JWT token
   *
   * @memberof KeycloakService
   */
  getIdpFromToken(): string {
    const token = this.getToken();

    if (!token) {
      return '';
    }

    const jwt = JwtUtil.decodeToken(token);

    // idir users have an idir_userid property
    if (jwt.idir_userid !== undefined) {
      return this.idpHintEnum.IDIR;
    }

    // if extra steps are completed in the keycloak config
    // bceid users will have a bceid_userid property
    if (jwt.bceid_userid !== undefined) {
      return this.idpHintEnum.BCEID;
    }

    const preferredUsernameParts = jwt.preferred_username.split('@');
    if (preferredUsernameParts.length > 1) {
      const domainPart = preferredUsernameParts[1].toLowerCase();
      // the preferred_username for BCEID users is `username@bceid-basic-and-business`
      if (domainPart.startsWith('bceid')) {
        return this.idpHintEnum.BCEID;
      }
    }

    // BCSC users have no distinguishing traits, but BCSC is asssumed
    // if it's not BCeID or IDIR
    return this.idpHintEnum.BCSC;
  }
}
