import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceInputOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (errorMessage: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { lang = 'vi-VN', onResult, onError } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Pure window capability check - ZERO instantiation on mount, ZERO permission prompts on load
  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as unknown as IWindow).SpeechRecognition || 
    (window as unknown as IWindow).webkitSpeechRecognition
  );

  const recognitionRef = useRef<any>(null);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // ONLY instantiated and started when user explicitly interacts / clicks microphone
  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói Web Speech.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const msg = 'Tính năng nhận diện giọng nói không khả dụng.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    // Stop any existing active session before re-initializing
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          const cleanedFinal = currentFinal.trim();
          setTranscript(cleanedFinal);
          setInterimTranscript('');
          if (onResult) {
            onResult(cleanedFinal);
          }
        } else {
          setInterimTranscript(currentInterim);
        }
      };

      recognition.onerror = (event: any) => {
        let msg = 'Không thể thu âm giọng nói.';
        if (event.error === 'not-allowed') {
          msg = 'Bạn chưa cấp quyền truy cập micro trên trình duyệt. Vui lòng cho phép để tiếp tục.';
        } else if (event.error === 'no-speech') {
          msg = 'Chưa nghe thấy giọng nói. Vui lòng thử lại gần micro hơn.';
        } else if (event.error === 'network') {
          msg = 'Lỗi kết nối mạng khi nhận diện giọng nói.';
        }
        setError(msg);
        setIsListening(false);
        if (onError) onError(msg);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('SpeechRecognition activation error:', e);
      const msg = 'Không thể kích hoạt micro. Vui lòng thử lại.';
      setError(msg);
      setIsListening(false);
      if (onError) onError(msg);
    }
  }, [isSupported, lang, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
