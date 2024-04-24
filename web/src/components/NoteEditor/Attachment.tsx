import React from 'react';
import { IoTrash } from 'react-icons/io5';
import { FileIcon } from '../FileIcon';
import { QuickActions } from '../QuickActions';

interface Props {
  attachment: AttachmentType;
  onRemove: () => void;
}

export interface AttachmentType {
  id: string;
  file: File;
  image?: string;
}

export const Attachment: React.FC<Props> = ({ attachment, onRemove }) => {
  return (
    <div className="note_input_attachment">
      <QuickActions
        actions={[
          {
            key: 'delete',
            label: 'delete',
            icon: <IoTrash />,
            onClick: onRemove,
          },
        ]}
      />
      <div className="note_input_attachment_preview">
        {attachment.image ? (
          <img src={attachment.image} alt={attachment.file.name} />
        ) : (
          <FileIcon mimeType={attachment.file.type} />
        )}
      </div>
      <div className="note_input_attachment_name" title={attachment.file.name}>
        {attachment.file.name}
      </div>
    </div>
  );
};
