import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { useState } from 'react';
import { streamingState } from '~/lib/stores/streaming';
import { ExportChatButton } from '~/components/chat/chatExportAndImport/ExportChatButton';
import { useChatHistory } from '~/lib/persistence';
import { DeployButton } from '~/components/deploy/DeployButton';
import { Dialog, DialogRoot } from '~/components/ui/Dialog';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const isStreaming = useStore(streamingState);
  const { exportChat } = useChatHistory();

  const shouldShowButtons = !isStreaming && activePreview;

  const [n8nOpen, setN8nOpen] = useState(false);
  const n8nUrl =
    (typeof window !== 'undefined' && (window as any).env?.PUBLIC_WEBHOOK_URL) || import.meta.env.PUBLIC_WEBHOOK_URL;

  return (
    <div className="flex items-center">
      {chatStarted && shouldShowButtons && <ExportChatButton exportChat={exportChat} />}
      {shouldShowButtons && (
        <>
          <DialogRoot open={n8nOpen} onOpenChange={setN8nOpen}>
            <button
              className="ml-2 px-3 py-1.5 rounded-md bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive text-sm flex items-center gap-1 border border-bolt-elements-borderColor"
              onClick={() => setN8nOpen(true)}
              title="Open n8n Instance"
            >
              <span className="i-ph:flow-arrow size-4.5" />
              n8n
            </button>
            <Dialog showCloseButton onClose={() => setN8nOpen(false)}>
              <div className="w-[90vw] max-w-4xl h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="i-ph:flow-arrow size-5 text-accent-500" />
                    <span className="font-semibold text-lg">n8n Instance</span>
                  </div>
                  <button onClick={() => setN8nOpen(false)} className="text-xl px-2">
                    ×
                  </button>
                </div>
                <iframe
                  src={n8nUrl}
                  title="n8n Instance"
                  className="flex-1 w-full rounded border border-bolt-elements-borderColor bg-white dark:bg-black"
                  style={{ minHeight: 0 }}
                />
              </div>
            </Dialog>
          </DialogRoot>
        </>
      )}
      {shouldShowButtons && <DeployButton />}
    </div>
  );
}
