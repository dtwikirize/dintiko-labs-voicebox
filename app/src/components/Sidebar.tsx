import { Link, useMatchRoute } from '@tanstack/react-router';
import { AudioLines, Box, Captions, type LucideIcon, Mic, Settings, Volume2, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import voiceboxLogo from '@/assets/voicebox-logo.png';
import { cn } from '@/lib/utils/cn';
import { usePlatform } from '@/platform/PlatformContext';
import type { UpdateStatus } from '@/platform/types';
import { usePlayerStore } from '@/stores/playerStore';
import { version } from '../../package.json';

interface SidebarProps {
  isMacOS?: boolean;
}

const tabs: Array<{
  id: string;
  path: string;
  icon: LucideIcon;
  labelKey?: string;
  label?: string;
}> = [
  { id: 'main', path: '/', icon: Volume2, labelKey: 'nav.generate' },
  { id: 'stories', path: '/stories', icon: AudioLines, labelKey: 'nav.stories' },
  { id: 'captures', path: '/captures', icon: Captions, labelKey: 'nav.captures' },
  { id: 'voices', path: '/voices', icon: Mic, labelKey: 'nav.voices' },
  { id: 'effects', path: '/effects', icon: Wand2, labelKey: 'nav.effects' },
  { id: 'models', path: '/models', icon: Box, labelKey: 'nav.models' },
  { id: 'settings', path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export function Sidebar({ isMacOS }: SidebarProps) {
  const { t } = useTranslation();
  const matchRoute = useMatchRoute();
  const isPlayerOpen = !!usePlayerStore((s) => s.audioUrl);
  const platform = usePlatform();
  const isWeb = !platform.metadata.isTauri;

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(platform.updater.getStatus());
  useEffect(() => platform.updater.subscribe(setUpdateStatus), [platform.updater]);

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-30 h-full bg-sidebar border-r border-border flex flex-col py-5 gap-7 transition-[width] duration-200',
        isWeb ? 'w-16 items-center px-2 md:w-64 md:items-stretch md:px-5' : 'w-20 items-center',
        isMacOS && !isWeb && 'pt-14',
      )}
    >
      {/* Logo */}
      <div className={cn('mb-1 flex items-center', isWeb ? 'md:gap-3' : '')}>
        <img
          src={voiceboxLogo}
          alt="Voicebox"
          className={cn(
            'sidebar-logo object-contain',
            isWeb ? 'h-10 w-10 grayscale md:h-9 md:w-9' : 'h-12 w-12',
          )}
        />
        {isWeb && (
          <div className="hidden min-w-0 md:block">
            <div className="text-[15px] font-semibold tracking-tight text-foreground">Voicebox</div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Dintiko Labs
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <nav aria-label="Main navigation" className="flex w-full flex-col gap-1.5">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive =
            tab.path === '/'
              ? matchRoute({ to: '/', fuzzy: false })
              : matchRoute({ to: tab.path, fuzzy: true });

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                'relative flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 md:h-10 md:w-full md:justify-start md:gap-3 md:rounded-md md:px-3',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              title={tab.label ?? (tab.labelKey ? t(tab.labelKey) : tab.id)}
              aria-label={tab.label ?? (tab.labelKey ? t(tab.labelKey) : tab.id)}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {isWeb && (
                <span className="hidden text-[13px] font-medium md:inline">
                  {tab.label ?? (tab.labelKey ? t(tab.labelKey) : tab.id)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div
        className={cn(
          'mt-auto flex flex-col items-center gap-1.5 transition-all duration-300',
          isWeb && 'md:items-start md:px-3',
        )}
        style={{ paddingBottom: isPlayerOpen ? '7rem' : undefined }}
      >
        <span className="text-[10px] text-muted-foreground/50">v{version}</span>
        {updateStatus.available && (
          <Link
            to="/settings"
            className="text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
          >
            {t('nav.updateBadge')}
          </Link>
        )}
      </div>
    </div>
  );
}
