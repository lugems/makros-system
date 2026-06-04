
import { Button } from '@/components/ui/button';

export function SettingsActions() {
  return (
    <div className="mt-8 flex justify-end space-x-4">
      <Button variant="outline">Reset Changes</Button>
      <Button>Save Settings</Button>
    </div>
  );
}
