import { useMemo } from 'react';

interface MarkdownTextProps {
  text: string;
  className?: string;
}

function parseLine(line: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = line;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        nodes.push(remaining.slice(0, boldMatch.index));
      }
      nodes.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      nodes.push(remaining);
      break;
    }
  }

  return nodes;
}

export function MarkdownText({ text, className = '' }: MarkdownTextProps) {
  const rendered = useMemo(() => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: { type: 'ul' | 'ol'; items: React.ReactNode[][] }  | null = null;
    let key = 0;

    const flushList = () => {
      if (!listItems) return;
      if (listItems.type === 'ul') {
        elements.push(
          <ul key={key++} className="list-disc list-inside space-y-0.5 my-1">
            {listItems.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key++} className="list-decimal list-inside space-y-0.5 my-1">
            {listItems.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      listItems = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === '') {
        flushList();
        elements.push(<div key={key++} className="h-2" />);
        continue;
      }

      const ulMatch = trimmed.match(/^[-*•]\s+(.+)/);
      if (ulMatch) {
        if (listItems && listItems.type !== 'ul') flushList();
        if (!listItems) listItems = { type: 'ul', items: [] };
        listItems.items.push(parseLine(ulMatch[1]));
        continue;
      }

      const olMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
      if (olMatch) {
        if (listItems && listItems.type !== 'ol') flushList();
        if (!listItems) listItems = { type: 'ol', items: [] };
        listItems.items.push(parseLine(olMatch[2]));
        continue;
      }

      flushList();
      elements.push(<div key={key++}>{parseLine(trimmed)}</div>);
    }

    flushList();
    return elements;
  }, [text]);

  return <div className={className}>{rendered}</div>;
}
