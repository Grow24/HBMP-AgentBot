import React, { useCallback } from 'react';
import { Camera } from '@capacitor/camera';
import { useLocalize } from '~/hooks';

interface UsePhotoResult {
  takePhoto: () => Promise<string | null>;
  pickImage: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export const usePhotoCapture = (): UsePhotoResult => {
  const localize = useLocalize();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const status = await Camera.checkPermissions();
      
      if (status.camera === 'prompt' || status.photos === 'prompt') {
        const request = await Camera.requestPermissions({
          permissions: ['camera', 'photos'],
        });
        
        if (request.camera !== 'granted' || request.photos !== 'granted') {
          setError(localize('com_ui_camera_permission_denied') || 'Camera permission denied');
          return false;
        }
      } else if (status.camera !== 'granted' || status.photos !== 'granted') {
        setError(localize('com_ui_camera_permission_required') || 'Camera and photo permissions are required');
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Permission check failed';
      setError(errorMessage);
      console.error('Permission check error:', err);
      return false;
    }
  }, [localize]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
        source: 'camera',
        promptLabelPhoto: localize('com_ui_take_photo') || 'Take Photo',
        promptLabelPicture: localize('com_ui_picture') || 'Picture',
        promptLabelCancel: localize('com_ui_cancel') || 'Cancel',
      });

      return image.webPath || null;
    } catch (err) {
      if (err instanceof Error && err.message?.includes('User cancelled')) {
        setError(null); // Don't show error if user cancelled
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to take photo';
      setError(errorMessage);
      console.error('Camera capture error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions, localize]);

  const pickImage = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri',
        source: 'photos',
        promptLabelPhoto: localize('com_ui_select_photo') || 'Select Photo',
        promptLabelPicture: localize('com_ui_picture') || 'Picture',
        promptLabelCancel: localize('com_ui_cancel') || 'Cancel',
      });

      return image.webPath || null;
    } catch (err) {
      if (err instanceof Error && err.message?.includes('User cancelled')) {
        setError(null); // Don't show error if user cancelled
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to pick image';
      setError(errorMessage);
      console.error('Image picker error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions, localize]);

  return {
    takePhoto,
    pickImage,
    isLoading,
    error,
  };
};

export default usePhotoCapture;
