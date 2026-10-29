/**
 * Audio and Web Speech utilities for "Where you want to go😎" Speaking App.
 * Follows Technical Requirements strictly:
 * - Speech recognition: Browser built-in Web Speech API (SpeechRecognition), language en-US
 * - Read-aloud: Browser built-in SpeechSynthesis, language en-US / en-GB, normal rate 0.9 / slow rate 0.7
 * - Disable mic button while model audio is playing.
 * - Do NOT run SpeechRecognition and MediaRecorder at the same time. Use speech recognition only.
 */

// Detect browser environment
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export function detectInAppBrowser(): { isInApp: boolean; name: string } {
  if (typeof navigator === 'undefined') return { isInApp: false, name: '' };
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('kakaotalk')) return { isInApp: true, name: 'KakaoTalk' };
  if (ua.includes('instagram')) return { isInApp: true, name: 'Instagram' };
  if (ua.includes('fbav') || ua.includes('fban')) return { isInApp: true, name: 'Facebook' };
  if (ua.includes('line/')) return { isInApp: true, name: 'LINE' };
  if (ua.includes('naver')) return { isInApp: true, name: 'Naver' };
  return { isInApp: false, name: '' };
}

export interface SpeakOptions {
  text: string;
  lang?: 'en-US' | 'en-GB';
  rate?: number; // 0.9 (normal) or 0.7 (slow)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch (e) {
      console.warn('Error cancelling speech synthesis:', e);
    }
  }
}

export function speakSentence({
  text,
  lang = 'en-US',
  rate = 0.9,
  onStart,
  onEnd,
  onError,
}: SpeakOptions): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this environment.');
    onEnd?.();
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate; // PRD: normal rate 0.9 / slow rate 0.7
  utterance.pitch = 1.05; // Slightly warm/bright tone for elementary students

  // Try to pick a natural native voice matching the language
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find(
    (v) => v.lang === lang || v.lang.startsWith(lang.slice(0, 2))
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onstart = () => {
    activeUtterance = utterance;
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    console.warn('Speech synthesis error:', e);
    onError?.(e);
    onEnd?.();
  };

  // Workaround for Chrome bug where synthesis pauses on long sentences
  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Failed to speak:', err);
    onEnd?.();
  }
}

export interface RecognitionCallbacks {
  onTranscriptChange: (transcript: string, isFinal: boolean) => void;
  onError: (errorType: string, message: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class SpeechRecognizerController {
  private recognition: any = null;
  private isListening = false;
  private callbacks: RecognitionCallbacks | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-US';
      }
    }
  }

  public setLanguage(lang: 'en-US' | 'en-GB') {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public startListening(callbacks: RecognitionCallbacks) {
    if (!this.recognition) {
      callbacks.onError(
        'not_supported',
        'Speech recognition is not supported in this browser. Please open in Google Chrome.'
      );
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    this.callbacks = callbacks;
    let finalTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks?.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }
      const currentText = finalTranscript || interimTranscript;
      this.callbacks?.onTranscriptChange(currentText, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const error = event.error || 'unknown';
      let message = 'An error occurred during speech recognition.';

      if (error === 'not-allowed' || error === 'permission-denied') {
        message =
          'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (error === 'no-speech') {
        message = 'No speech was detected. Please try speaking closer to the microphone.';
      } else if (error === 'network') {
        message = 'Network connection issue with speech service.';
      }

      this.callbacks?.onError(error, message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks?.onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      this.isListening = false;
      console.warn('SpeechRecognition start failed:', err);
      this.callbacks?.onError('start_failed', err?.message || 'Could not start microphone');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}
