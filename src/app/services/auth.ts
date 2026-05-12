import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = signal<string | null>(null);

  private readonly CLIENT_ID = environment.clientId;
  private readonly CLIENT_SECRET = environment.clientSecret;

  async fetchToken(): Promise<string> {
    if (this.token()) {
      return this.token()!;
    }

    const payload = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('scope', 'content');

    const url = '/auth-api/oauth2/token';

    const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

    try {
      const res: any = await firstValueFrom(
        this.http.post(url, payload, {
          headers: new HttpHeaders({ 
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded' 
          })
        })
      );

      this.token.set(res.access_token);
      return res.access_token;
    } catch (error) {
      console.error('OAuth2 Token Exchange Failed:', error);
      throw error;
    }
  }

  getStoredToken() {
    return this.token();
  }

  getClientId(): string {
    return this.CLIENT_ID;
  }
}