import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export class SharingService {
  static async shareScreenshot(viewRef: any, habitTitle: string): Promise<void> {
    try {
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Capture the view as an image
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
      });

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: `${habitTitle} - Monthly Progress`,
        UTI: 'public.png',
      });

    } catch (error) {
      console.error('Failed to share screenshot:', error);
      Alert.alert('Error', 'Failed to share screenshot');
    }
  }

  static async saveToGallery(viewRef: any): Promise<void> {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save to gallery');
        return;
      }

      // Capture the view
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1.0,
      });

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Screenshot saved to gallery!');

    } catch (error) {
      console.error('Failed to save to gallery:', error);
      Alert.alert('Error', 'Failed to save screenshot');
    }
  }
}