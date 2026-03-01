import { Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CodexThinkingEffort } from '../../types/types';

type CodexThinkingEffortSelectorProps = {
  selectedEffort: CodexThinkingEffort;
  onEffortChange: (effort: CodexThinkingEffort) => void;
};

const EFFORT_OPTIONS: CodexThinkingEffort[] = ['low', 'medium', 'high', 'xhigh'];

export default function CodexThinkingEffortSelector({
  selectedEffort,
  onEffortChange,
}: CodexThinkingEffortSelectorProps) {
  const { t } = useTranslation('chat');

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 sm:px-3 sm:py-1.5"
      title={t('codexThinkingEffort.title')}
    >
      <Brain className="h-4 w-4 text-muted-foreground" />
      <label htmlFor="codex-thinking-effort" className="sr-only">
        {t('codexThinkingEffort.label')}
      </label>
      <select
        id="codex-thinking-effort"
        value={selectedEffort}
        onChange={(event) => onEffortChange(event.target.value as CodexThinkingEffort)}
        className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
      >
        {EFFORT_OPTIONS.map((effort) => (
          <option key={effort} value={effort} className="bg-background text-foreground">
            {t(`codexThinkingEffort.options.${effort}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
