import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  iconClass: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  features = signal<Feature[]>([
    {
      iconClass: 'fas fa-book',
      title: 'Smart Verse Translator',
      description: 'Paste or select any Ayah to get word-by-word translation, full sentence meaning, and simplified explanations.',
      color: 'from-emerald-400 to-green-600'
    },
    {
      iconClass: 'fas fa-brain',
      title: 'AI Tafsir Assistant',
      description: 'Ask "What does this verse mean?" and get comprehensive explanations, context, and real-life applications.',
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
      title: 'Ask the Quran AI Chat',
      description: 'Have a natural conversation with our AI to explore Islamic teachings on any topic.',
      color: 'from-violet-400 to-purple-600'
    },
    {
      iconClass: 'fas fa-leaf',
      title: 'Daily Ayah Insight',
      description: 'Receive one inspirational verse daily with reflections and practical wisdom for your life.',
      color: 'from-teal-400 to-cyan-600'
    }
  ]);

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
