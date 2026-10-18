import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  itemsKey: string;
  emptyMessage: string;
  itemKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, itemsKey, emptyMessage, itemKey, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setItems(undefined);
    setFailed(false);
    getJson<Record<string, unknown>>(endpoint)
      .then((result) => {
        const values = result[itemsKey];
        if (!Array.isArray(values)) throw new Error(`Expected ${itemsKey} in API response`);
        if (active) setItems(values as T[]);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => { active = false; };
  }, [endpoint, itemsKey]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {failed ? <p role="alert">Unable to load {title.toLowerCase()}.</p>
      : items === undefined ? <p role="status">Loading {title.toLowerCase()}...</p>
        : items.length === 0 ? <p role="status">{emptyMessage}</p>
          : <ul className="list-group">{items.map((item, index) => <li className="list-group-item" key={itemKey(item, index)}>{renderItem(item)}</li>)}</ul>}
  </div></section>;
}
