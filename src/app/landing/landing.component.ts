import { Component, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiKeyModalComponent } from '../components/api-key-modal/api-key-modal.component';
import { GeminiAiService } from '../services/gemini-ai.service';

interface Feature {
  iconClass: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ApiKeyModalComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class Landing {
  @ViewChild(ApiKeyModalComponent) apiKeyModal!: ApiKeyModalComponent;

  private router = inject(Router);
  private geminiAi = inject(GeminiAiService);

  features = signal<Feature[]>([
    {
      iconClass: 'fas fa-book',
      title: 'Smart Verse Translator',
      description: 'Paste or select any Ayah to get word-by-word translation, full sentence meaning, and simplified explanations.',
      color: 'from-emerald-400 to-green-600'
    },
    {
      iconClass: 'fas fa-brain',
      title: 'Study Notes',
      description: 'Save reflections beside verses and return to them from your study library.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      iconClass: 'fas fa-magnifying-glass',
      title: 'Quran Search Engine',
      description: 'Search by topic, keyword, or emotion to find relevant verses with instant explanations.',
      color: 'from-amber-300 to-orange-600'
    },
    {
      iconClass: 'fas fa-headphones',
      title: 'Audio + Pronunciation',
      description: 'Listen to authentic recitations with word-by-word highlighting and adjustable playback speed.',
      color: 'from-rose-400 to-red-600'
    },
    {
      iconClass: 'fas fa-comments',
      title: 'Bookmarks & History',
      description: 'Keep track of important verses and reopen recently studied ayat quickly.',
      color: 'from-violet-400 to-purple-600'
    },
    {
      iconClass: 'fas fa-leaf',
      title: 'Verse Details',
      description: 'Open a focused verse view with audio, word meanings, translation, and notes.',
      color: 'from-teal-400 to-cyan-600'
    }
  ]);

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async getStarted(): Promise<void> {
    // Check if API key exists, if not show modal first
    if (!this.geminiAi.hasApiKey()) {
      this.apiKeyModal.openModal();
    } else {
      this.router.navigate(['/chapters']);
    }
  }

  onApiKeySaved(): void {
    this.router.navigate(['/chapters']);
  }

  openSearch(): void {
    this.router.navigate(['/search']);
  }
}
