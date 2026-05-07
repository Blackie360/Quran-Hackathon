import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class QuranService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly API_URL = 'https://api.quran.foundation/content/api/v4';

  async getVerses(chapterId: number) {
    const token = await this.auth.fetchToken();
    
    const headers = new HttpHeaders({
      'x-auth-token': token,
      'x-client-id': 'YOUR_X_CLIENT_ID'
    });

    return this.http.get(`${this.API_URL}/verses/by_chapter/${chapterId}`, { headers });
  }
}