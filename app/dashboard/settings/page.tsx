import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { User, Bell, Shield, Palette } from 'lucide-react';

const sections = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Update your personal information and account details',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Configure how and when you receive notifications',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Manage your password, two-factor auth, and active sessions',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Customize the look and feel of your dashboard',
  },
];

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted">Manage your account preferences</p>
            </div>

            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-4 p-5 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{section.label}</p>
                      <p className="text-xs text-muted mt-0.5">{section.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
