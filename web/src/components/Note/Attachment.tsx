import React from 'react';
import { IoDownloadOutline } from 'react-icons/io5';

import { NoteAttachmentType } from '../../api';
import { formatFileSize } from '../../helpers';
import { FileIcon } from '../FileIcon';
import { Link } from '../Link';

interface Props {
  attachment: NoteAttachmentType | File;
}

export const Attachment: React.FC<Props> = ({ attachment }) => {
  if (attachment instanceof File) {
    return null;
  }

  return (
    <div className="attachment">
      {attachment.width && attachment.height ? (
        <Link href={attachment.url}>
          <img
            src={attachment.thumbnailUrl}
            width={attachment.thumbnailWidth}
            height={attachment.thumbnailHeight}
            alt="Preview"
          />
        </Link>
      ) : attachment.contentType.startsWith('video/') ? (
        <video src={attachment.url} controls />
      ) : (
        <div className="attachment_info">
          <div className="attachment_info_data">
            <FileIcon mimeType={attachment.contentType} />
            <div>
              <Link href={attachment.url}>{attachment.originalFilename}</Link>
              <span>{formatFileSize(attachment.size)}</span>
            </div>
            <a
              title="Download"
              href={attachment.url}
              download={attachment.originalFilename}
            >
              <IoDownloadOutline />
            </a>
          </div>
          {attachment.contentType.startsWith('audio/') && (
            <audio src={attachment.url} controls />
          )}
        </div>
      )}
    </div>
  );
};
