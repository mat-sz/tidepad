import React from 'react';
import {
  IoMusicalNote,
  IoDocumentText,
  IoFilm,
  IoDocument,
} from 'react-icons/io5';

interface Props {
  mimeType?: string;
}

export const FileIcon: React.FC<React.PropsWithChildren<Props>> = ({
  mimeType,
}) => {
  if (mimeType) {
    if (mimeType.startsWith('audio/')) {
      return <IoMusicalNote />;
    } else if (mimeType.startsWith('text/')) {
      return <IoDocumentText />;
    } else if (mimeType.startsWith('video/')) {
      return <IoFilm />;
    }
  }

  return <IoDocument />;
};
