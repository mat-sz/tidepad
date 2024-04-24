import React from 'react';

interface Placeholder {
  timestampText: string;
  messageTexts: string[];
  hasEmbed: boolean;
}

function random(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}
const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length: number) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const randomPlaceholders: Placeholder[] = new Array(50)
  .fill(undefined)
  .map(() => ({
    timestampText: generateString(18),
    messageTexts: new Array(random(1, 4)).fill(undefined).map(() =>
      new Array(random(4, 20))
        .fill(undefined)
        .map(() => generateString(random(6, 18)))
        .join(' ')
    ),
    hasEmbed: Math.random() > 0.8,
  }));

export const NotesPlaceholder: React.FC = () => {
  return (
    <>
      {randomPlaceholders.map((placeholder, i) => {
        return (
          <div className="note_placeholder" key={i}>
            <div className="note_placeholder_time">
              <span>{placeholder.timestampText}</span>
            </div>
            {placeholder.messageTexts.map((body, i) => (
              <div className="note_placeholder_body" key={i}>
                {body.split(' ').map((word, i) => (
                  <span key={i}>{word}</span>
                ))}
              </div>
            ))}
            {placeholder.hasEmbed && (
              <div className="note_placeholder_embed"></div>
            )}
          </div>
        );
      })}
    </>
  );
};
