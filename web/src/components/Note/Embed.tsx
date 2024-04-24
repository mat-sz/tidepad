import React from 'react';

import { NoteEmbed } from '../../api';
import { Link } from '../Link';

interface Props {
  embed: NoteEmbed;
}

export const Embed: React.FC<Props> = ({ embed }) => {
  return (
    <div className="embed">
      {embed.author?.text && (
        <div className="embed_author">
          {embed.author.icon_url && (
            <img src={embed.author.icon_url} alt={embed.author.text} />
          )}
          <span>{embed.author.text}</span>
        </div>
      )}
      <div className="embed_info">
        <div className="embed_title">
          {embed.url ? (
            <Link href={embed.url}>{embed.title}</Link>
          ) : (
            embed.title
          )}
        </div>
        <div className="embed_description">{embed.description}</div>
      </div>
      {embed.image && (
        <div className="embed_image">
          <img src={embed.image.url} alt="Embed" />
        </div>
      )}
    </div>
  );
};
