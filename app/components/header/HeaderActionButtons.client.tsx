import { useStore } from '@nanostores/react';
import useViewport from '~/lib/hooks';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { netlifyStore } from '~/lib/stores/netlify';
import { classNames } from '~/utils/classNames';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogDescription, DialogButton } from '~/components/ui/Dialog';
import { toast } from 'react-toastify';

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const showWorkbench = useStore(workbenchStore.showWorkbench);
  const { showChat } = useStore(chatStore);
  const deployment = useStore(netlifyStore.deployment);
  const savedToken = useStore(netlifyStore.token);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [netlifyToken, setNetlifyToken] = useState('');
  const [siteName, setSiteName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const isSmallViewport = useViewport(1024);
  const canHideChat = showWorkbench || !showChat;

  // Initialize from saved project config
  useEffect(() => {
    const projectConfig = netlifyStore.getProjectConfig();

    if (projectConfig) {
      setSiteName(projectConfig.siteName);
    }
  }, []);

  // Initialize from saved token
  useEffect(() => {
    if (savedToken) {
      setNetlifyToken(savedToken);
    }
  }, [savedToken]);

  const handleDeploy = async () => {
    if (!netlifyToken || !siteName) {
      toast.error('Please provide both Netlify token and site name');
      return;
    }

    try {
      setIsDeploying(true);
      await netlifyStore.deploy(netlifyToken, siteName);
      setShowDeployDialog(false);
    } catch (error) {
      toast.error('Failed to deploy: ' + (error as Error).message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden">
        <Button
          active={showChat}
          disabled={!canHideChat || isSmallViewport}
          onClick={() => {
            if (canHideChat) {
              chatStore.setKey('showChat', !showChat);
            }
          }}
        >
          <div className="i-bolt:chat text-sm" />
        </Button>
        <div className="w-[1px] bg-bolt-elements-borderColor" />
        <Button
          active={showWorkbench}
          onClick={() => {
            if (showWorkbench && !showChat) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="i-ph:code-bold" />
        </Button>
      </div>

      <Button
        onClick={() => setShowDeployDialog(true)}
        className="bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover"
        disabled={isDeploying}
      >
        {isDeploying ? (
          <div className="i-svg-spinners:90-ring-with-bg mr-1" />
        ) : (
          <div className="i-ph:cloud-arrow-up mr-1" />
        )}
        {deployment?.status === 'ready' ? 'Deployed' : isDeploying ? 'Deploying...' : 'Deploy'}
      </Button>

      {showDeployDialog && (
        <Dialog onClose={() => setShowDeployDialog(false)}>
          <DialogTitle>Deploy to Netlify</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Netlify Token</label>
                <input
                  type="password"
                  value={netlifyToken}
                  onChange={(e) => setNetlifyToken(e.target.value)}
                  placeholder="Enter your Netlify token"
                  className="w-full bg-white dark:bg-bolt-elements-background-depth-4 px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
                />
                <p className="text-xs text-bolt-elements-textTertiary mt-1">
                  You can get your token from{' '}
                  <a
                    href="https://app.netlify.com/user/applications#personal-access-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-bolt-elements-textAccent hover:underline"
                  >
                    Netlify Access Tokens
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Enter site name"
                  className="w-full bg-white dark:bg-bolt-elements-background-depth-4 px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
                  disabled={netlifyStore.getProjectConfig() !== null}
                />
                {netlifyStore.getProjectConfig() && (
                  <p className="text-xs text-bolt-elements-textTertiary mt-1">
                    Site name is locked to maintain continuous deployment to the same site
                  </p>
                )}
              </div>
            </div>
          </DialogDescription>
          <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
            <DialogButton type="secondary" onClick={() => setShowDeployDialog(false)}>
              Cancel
            </DialogButton>
            <DialogButton type="primary" onClick={handleDeploy}>
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </DialogButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
  className?: string;
}

function Button({ active = false, disabled = false, children, onClick, className }: ButtonProps) {
  return (
    <button
      className={classNames(
        'flex items-center p-1.5',
        {
          'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
            !active && !className,
          'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent':
            active && !disabled && !className,
          'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
            disabled,
        },
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
