import { useRef, useState, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
  className?: string;
}

const TOOLBAR_BUTTONS = [
  { icon: Bold, label: 'Bold', labelFa: 'بولد', prefix: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', labelFa: 'ایتالیک', prefix: '*', suffix: '*' },
  { icon: Heading2, label: 'Heading 2', labelFa: 'عنوان ۲', prefix: '## ', suffix: '' },
  { icon: Heading3, label: 'Heading 3', labelFa: 'عنوان ۳', prefix: '### ', suffix: '' },
  { icon: List, label: 'Bullet List', labelFa: 'لیست نقطه‌ای', prefix: '- ', suffix: '' },
  { icon: ListOrdered, label: 'Numbered List', labelFa: 'لیست شماره‌ای', prefix: '1. ', suffix: '' },
  { icon: Quote, label: 'Quote', labelFa: 'نقل قول', prefix: '> ', suffix: '' },
  { icon: Minus, label: 'Divider', labelFa: 'خط جداکننده', prefix: '\n---\n', suffix: '' },
];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  minRows = 6,
  maxLength,
  className,
}: RichTextEditorProps) => {
  const { isRTL } = useLanguage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const insertFormatting = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);

      onChange(newText);
      
      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange, history, historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  }, [historyIndex, history, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onChange(history[historyIndex + 1]);
    }
  }, [historyIndex, history, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (maxLength && newValue.length > maxLength) return;
      
      onChange(newValue);
      
      // Update history (debounced)
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [onChange, maxLength, history, historyIndex]
  );

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
        <TooltipProvider delayDuration={300}>
          {TOOLBAR_BUTTONS.map((button) => (
            <Tooltip key={button.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => insertFormatting(button.prefix, button.suffix)}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isRTL ? button.labelFa : button.label}
              </TooltipContent>
            </Tooltip>
          ))}
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleUndo}
                disabled={historyIndex === 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRTL ? 'برگرداندن' : 'Undo'}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRTL ? 'از نو انجام دادن' : 'Redo'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={minRows}
        className={cn(
          "border-0 rounded-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
          isRTL && "text-right"
        )}
      />

      {/* Character Count */}
      {maxLength && (
        <div className="px-3 py-1.5 border-t bg-muted/30 text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
