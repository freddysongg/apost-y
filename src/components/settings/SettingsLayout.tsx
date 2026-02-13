import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { AudioSettings } from '@/components/settings/AudioSettings';
import { KeybindSettings } from '@/components/settings/KeybindSettings';
import { NotesManager } from '@/components/settings/NotesManager';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { SystemPromptSettings } from '@/components/settings/SystemPromptSettings';
import { Settings, Volume2, Keyboard, FileText, Palette, MessageSquare } from 'lucide-react';

export function SettingsLayout() {
  return (
    <div className="h-full flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general" className="flex-1">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="audio" className="gap-2">
            <Volume2 className="h-4 w-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="prompt" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt
          </TabsTrigger>
          <TabsTrigger value="keybinds" className="gap-2">
            <Keyboard className="h-4 w-4" />
            Keybinds
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="audio" className="mt-6">
          <AudioSettings />
        </TabsContent>
        <TabsContent value="prompt" className="mt-6">
          <SystemPromptSettings />
        </TabsContent>
        <TabsContent value="keybinds" className="mt-6">
          <KeybindSettings />
        </TabsContent>
        <TabsContent value="notes" className="mt-6">
          <NotesManager />
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
