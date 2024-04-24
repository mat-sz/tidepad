import React from 'react';
import { IoPin } from 'react-icons/io5';
import clsx from 'clsx';

import { NoteEmbed, NoteType } from '../../api';
import { Body } from './Body';
import { dateFormatter, tryParse } from '../../helpers';
import {
  QUICK_ACTIONS_CONTAINER_CLASS,
  QUICK_ACTIONS_SHOW_ON_HOVER_CLASS,
} from '../QuickActions';
import { Embed } from './Embed';
import { Editable } from './Editable';
import { Attachment } from './Attachment';

interface Props {
  note: NoteType;
  showMetadata?: boolean;
  preview?: boolean;
}

export const Note: React.FC<Props> = ({
  note,
  showMetadata = false,
  preview = false,
}) => {
  const isReadOnly = !(note.canDelete || note.canEdit) || preview;

  return (
    <li
      className={clsx(
        'note',
        QUICK_ACTIONS_CONTAINER_CLASS,
        QUICK_ACTIONS_SHOW_ON_HOVER_CLASS,
        {
          'has-metadata': showMetadata,
          'note-preview': preview,
          unsent:
            note.clientSideType === 'sending' ||
            note.clientSideType === 'updating',
          error: note.clientSideType === 'error',
        }
      )}
      key={note.id}
    >
      {(showMetadata || preview) && (
        <div className="metadata">
          <div className="time">{dateFormatter(note.createdAt)}</div>
          {note.pinned && <IoPin />}
        </div>
      )}
      {isReadOnly ? (
        <div className="body">
          <Body body={note.body} />
        </div>
      ) : (
        <Editable note={note} />
      )}
      <div className="attachments">
        {note.attachments?.map(attachment => (
          <Attachment
            attachment={attachment}
            key={attachment instanceof File ? attachment.name : attachment.id}
          />
        ))}
      </div>
    </li>
  );
};
