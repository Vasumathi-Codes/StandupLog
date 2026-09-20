import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { Alert, Share } from 'react-native';

// Copy-to-clipboard and native share sheet for a block of text.
// `copied` is true for ~2 seconds after a successful copy, so the button can say "Copied!".
export function useCopyShare(text: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Resolves to true if the text was copied.
  const copy = async (): Promise<boolean> => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('[clipboard] copy failed', error);
      Alert.alert('Could not copy', 'Please try again.');
      return false;
    }
  };

  const share = async () => {
    try {
      // Opens the system share sheet (Slack, Teams, WhatsApp, Mail...). Dismissing it is not an error.
      await Share.share({ message: text });
    } catch (error) {
      console.error('[share] share failed', error);
      Alert.alert('Could not share', 'Please try again.');
    }
  };

  return { copied, copy, share };
}
