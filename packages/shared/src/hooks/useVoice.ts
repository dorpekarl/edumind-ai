type UseVoiceOptions = { rate?: number; pitch?: number; voice?: string };

export function useVoice(defaults: UseVoiceOptions = {}) {
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function speak(text: string, options: UseVoiceOptions = {}) {
    if (!canSpeak) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = options.rate ?? defaults.rate ?? 1.0;
    utter.pitch = options.pitch ?? defaults.pitch ?? 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  function stop() {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
  }

  return { speak, stop, canSpeak };
}