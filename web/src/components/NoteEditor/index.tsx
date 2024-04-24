import React, { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IoSend, IoClose, IoSave, IoAddCircle } from 'react-icons/io5';
import Textarea from 'react-expanding-textarea';
import { v4 } from 'uuid';
import { FilePicker } from '../FilePicker';
import { Attachment, AttachmentType } from './Attachment';
import { IconButton } from '../IconButton';
import { isTouchScreen } from '../../helpers';

interface Props {
  initialBody?: string;
  allowAttachments?: boolean;
  isSend?: boolean;
  onCancel?: () => void;
  onSave?: (body: string, attachments?: File[]) => void;
  className?: string;
  autoFocus?: boolean;
}

export const NoteEditor: React.FC<Props> = ({
  initialBody,
  allowAttachments = false,
  isSend = false,
  onCancel,
  onSave,
  className,
  autoFocus = false,
}) => {
  const [body, setBody] = useState(initialBody || '');
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current) {
        return;
      }

      if (e.target instanceof HTMLElement) {
        const element = e.target;

        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
          return;
        }

        if (element.closest('textarea,input')) {
          return;
        }
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        textareaRef.current.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [autoFocus]);

  const onFiles = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = () => {
          setAttachments(attachments => [
            ...attachments,
            {
              id: v4(),
              file,
              image:
                typeof reader.result === 'string' ? reader.result : undefined,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments(attachments => [...attachments, { id: v4(), file }]);
      }
    });
  }, []);

  const isSaveDisabled =
    !body && (!allowAttachments || attachments.length === 0);

  const wrappedOnSave = () => {
    if (!onSave) {
      return;
    }

    onSave(
      body,
      attachments.map(attachment => attachment.file)
    );
    setBody('');
    setAttachments([]);
  };

  return (
    <div className={clsx('note_input', className)}>
      {allowAttachments && attachments.length > 0 && (
        <div className="note_input_attachments">
          {attachments.map(attachment => (
            <Attachment
              key={attachment.id}
              attachment={attachment}
              onRemove={() =>
                setAttachments(attachments =>
                  attachments.filter(a => a.id !== attachment.id)
                )
              }
            />
          ))}
        </div>
      )}
      <div className="note_input_text">
        {allowAttachments && (
          <div className="note_input_actions">
            <FilePicker onFiles={onFiles} dropzone paste>
              {({ open }) => (
                <IconButton title="Upload" onClick={open}>
                  <IoAddCircle />
                </IconButton>
              )}
            </FilePicker>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          placeholder="New note"
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => {
            if (!e.shiftKey && e.key === 'Enter' && !isTouchScreen()) {
              e.preventDefault();
              wrappedOnSave();
            }
          }}
        ></Textarea>
        <div className="note_input_actions">
          {onCancel && (
            <IconButton title="Cancel" onClick={onCancel}>
              <IoClose />
            </IconButton>
          )}
          {onSave && (
            <IconButton
              disabled={isSaveDisabled}
              title="Save"
              onClick={wrappedOnSave}
            >
              {isSend ? <IoSend /> : <IoSave />}
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};
