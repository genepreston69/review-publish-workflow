
import { useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { createChangeTrackingPlugin, changeTrackingPluginKey } from '../tiptap-extensions/ChangeTrackingPlugin';

interface UseChangeTrackingProps {
  editor: Editor | null;
  userInitials: string;
  trackingEnabled: boolean;
}

export function useChangeTracking({ editor, userInitials, trackingEnabled }: UseChangeTrackingProps) {
  const trackingPluginRef = useRef<any>(null);

  useEffect(() => {
    if (!editor) return;

    const updateTrackingPlugin = () => {
      // Remove existing plugin if it exists
      if (trackingPluginRef.current) {
        const currentState = editor.state;
        const currentPlugins = currentState.plugins;
        const filteredPlugins = currentPlugins.filter(
          plugin => plugin.spec?.key !== changeTrackingPluginKey
        );
        
        // Reconfigure editor with filtered plugins
        const newState = currentState.reconfigure({
          plugins: filteredPlugins
        });
        editor.view.updateState(newState);
        trackingPluginRef.current = null;
      }

      // Add new plugin if tracking is enabled
      if (trackingEnabled) {
        const plugin = createChangeTrackingPlugin({
          userInitials,
          enabled: trackingEnabled,
        });
        
        trackingPluginRef.current = plugin;
        editor.registerPlugin(plugin);
      }
    };

    updateTrackingPlugin();

    // Cleanup function
    return () => {
      if (trackingPluginRef.current && editor) {
        try {
          const currentState = editor.state;
          const currentPlugins = currentState.plugins;
          const filteredPlugins = currentPlugins.filter(
            plugin => plugin.spec?.key !== changeTrackingPluginKey
          );
          
          const newState = currentState.reconfigure({
            plugins: filteredPlugins
          });
          editor.view.updateState(newState);
        } catch (error) {
          console.error('Error cleaning up tracking plugin:', error);
        }
        trackingPluginRef.current = null;
      }
    };
  }, [editor, userInitials, trackingEnabled]);
}
