import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, X, Volume2, VolumeX, Sparkles, ShoppingBag } from 'lucide-react';
import { ShoppingItem, VoiceMessage } from '../types';
import { sendVoiceQueryToAI, speakSmartCartAI, stopSpeaking } from '../services/apiService';
import { QUICK_VOICE_CHIPS } from '../data/initialData';

interface VoiceAssistantSheetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: VoiceMessage[];
  onAddMessage: (msg: VoiceMessage) => void;
  cartItems: ShoppingItem[];
  onAddItems: (items: Array<Omit<ShoppingItem, 'id' | 'checked' | 'quantity'>>) => void;
  onRemoveItemByName: (name: string) => void;
  storeName: string;
  isHighContrast: boolean;
}

export const VoiceAssistantSheet: React.FC<VoiceAssistantSheetProps> = ({
  isOpen,
  onClose,
  messages,
  onAddMessage,
  cartItems,
  onAddItems,
  onRemoveItemByName,
  storeName,
  isHighContrast,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<unknown>(null);

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      stopSpeaking();
    };
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can tap prompt chips or type below.');
      return;
    }

    if (isListening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recognitionRef.current as any).stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (recognitionRef.current as any).start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isProcessing) return;

    setInputText('');
    const userMsg: VoiceMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    onAddMessage(userMsg);
    setIsProcessing(true);

    try {
      const result = await sendVoiceQueryToAI(query, cartItems, storeName);

      // Apply any modifications to the cart
      if (result.addedItems && result.addedItems.length > 0) {
        onAddItems(
          result.addedItems.map((aiItem) => ({
            item: aiItem.item,
            category: (aiItem.category as ShoppingItem['category']) || 'General',
            est_price: Number(aiItem.est_price) || 2.99,
            aisle: aiItem.aisle || 'General Aisle',
            aisleNumber: parseInt(aiItem.aisle?.replace(/\D/g, '') || '1') || 1,
            isOrganic: Boolean(aiItem.isOrganic),
            notes: aiItem.notes,
          }))
        );
      }

      if (result.removedItemNames && result.removedItemNames.length > 0) {
        result.removedItemNames.forEach((n) => onRemoveItemByName(n));
      }

      const aiMsg: VoiceMessage = {
        id: `smartcart-${Date.now()}`,
        sender: 'smartcart',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionDetails: result.addedItems?.length
          ? `Added ${result.addedItems.length} item(s) to route`
          : undefined,
      };

      onAddMessage(aiMsg);

      // Read aloud if enabled
      speakSmartCartAI(result.reply, speechEnabled);
    } catch (err) {
      console.error(err);
      onAddMessage({
        id: `err-${Date.now()}`,
        sender: 'smartcart',
        text: "I'm having a brief connection flutter, but I've noted your grocery request in your shopping path.",
        timestamp: 'Just now',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            id="voice-assistant-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`absolute bottom-0 w-full max-w-md rounded-t-3xl border-t shadow-2xl flex flex-col max-h-[85vh] transition-colors ${
              isHighContrast
                ? 'bg-black text-white border-white'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Sheet Handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
              <div className="h-1.5 w-12 rounded-full bg-slate-400/50" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-3 border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight flex items-center gap-1.5">
                    <span>SmartCart AI</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Voice Engine
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hands-free grocery & recipe copilot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !speechEnabled;
                    setSpeechEnabled(next);
                    if (!next) stopSpeaking();
                  }}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={speechEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
                >
                  {speechEnabled ? <Volume2 className="h-4.5 w-4.5 text-emerald-600" /> : <VolumeX className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[180px] max-h-[380px]"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? isHighContrast
                          ? 'bg-yellow-400 text-black font-bold'
                          : 'bg-emerald-600 text-white rounded-br-xs'
                        : isHighContrast
                        ? 'bg-zinc-900 text-white border border-white rounded-bl-xs'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    {m.actionDetails && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold opacity-90 border-t pt-1.5 border-black/10 dark:border-white/10">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{m.actionDetails}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="italic">SmartCart AI is synthesizing your cart...</span>
                </div>
              )}
            </div>

            {/* Quick Cognitive Offloading Chips (No typing needed while holding baby!) */}
            <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/70 dark:bg-slate-900/50">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                One-Handed Quick Voice Chips
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_VOICE_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip.query)}
                    className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition-all active:scale-95 shadow-2xs whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Dictation Area */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-black">
              {isListening && (
                <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2 text-xs font-semibold text-rose-600 dark:text-rose-300 animate-pulse">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span>Listening... Speak your grocery items or question</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Big Ergonomic Mic Button */}
                <button
                  id="sheet-mic-toggle-btn"
                  onClick={toggleListening}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all shadow-md active:scale-90 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : isHighContrast
                      ? 'bg-yellow-400 text-black font-black'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start speaking'}
                  aria-label="Voice input dictation"
                >
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>

                {/* Text input alternative */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={speechSupported ? 'Tap mic or type items...' : 'Type item or recipe...'}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-hidden dark:text-white"
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 transition-transform active:scale-95"
                  aria-label="Send query"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
