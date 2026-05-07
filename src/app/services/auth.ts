import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private token = signal<string | null>(null);

  // Credentials from Quran.Foundation Dashboard
  private readonly CLIENT_ID = 'YOUR_X_CLIENT_ID';
  private readonly CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

  async fetchToken(): Promise<string> {
    const payload = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('scope', 'content');

    const authHeader = 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`);

    const res: any = await firstValueFrom(
      this.http.post('https://auth.quran.foundation/oauth2/token', payload, {
        headers: new HttpHeaders({ 
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded' 
        })
      })
    );

    this.token.set(res.access_token);
    return res.access_token;
  }

  getStoredToken() {
    return this.token();
  }
}