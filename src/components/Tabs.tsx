import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import type { WithoutStyleOverrides } from './types';

/**
 * A single tab and its panel in a Groundwork Tabs group.
 *
 * @public
 */
export interface TabItem {
  /**
   * Stable identity for the tab, used as its React key and as the value passed
   * to {@link TabsProps.onTabChange}. Matches `defaultTabId` / `selectedTabId`.
   */
  id: string;
  /**
   * Visible tab label, rendered inside the `role="tab"` button.
   */
  label: string;
  /**
   * Panel content revealed when this tab is selected.
   */
  content: ReactNode;
}

/**
 * Props for the Groundwork Tabs component.
 *
 * @public
 */
export type TabsProps = WithoutStyleOverrides<Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'>> & {
  /**
   * Accessible name for the tab list. Required — it is announced when a screen
   * reader user enters the tabs, so it should say what the tabs switch between.
   */
  label: string;
  /**
   * The tabs to render, in display order. The first item is selected by default
   * unless `defaultTabId` or `selectedTabId` says otherwise.
   */
  items: readonly TabItem[];
  /**
   * Uncontrolled: {@link TabItem.id} of the tab selected on first render.
   * Ignored once the user interacts. Defaults to the first item.
   */
  defaultTabId?: string;
  /**
   * Controlled: {@link TabItem.id} of the selected tab. Pair with
   * `onTabChange` and update it in response to keep the component controlled.
   */
  selectedTabId?: string;
  /**
   * Called with the newly selected {@link TabItem.id} when the user activates a
   * tab by click or keyboard.
   */
  onTabChange?: (id: string) => void;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Switches between sibling panels of related content within a single view.
 *
 * Renders the WAI-ARIA tabs pattern: a `role="tablist"` of `role="tab"`
 * buttons, each wired by `aria-controls` / `aria-labelledby` to a
 * `role="tabpanel"`. Arrow keys move between tabs (wrapping at the ends), Home
 * and End jump to the first and last, and selection follows focus so the
 * matching panel reveals immediately. The tab list takes its accessible name
 * from the required `label`, so a screen reader announces what the tabs switch
 * between.
 *
 * Uncontrolled by default — pass `defaultTabId` for the initial selection. Pass
 * `selectedTabId` with `onTabChange` to drive selection from your own state.
 *
 * @example
 * ```tsx
 * <Tabs
 *   label="Server details"
 *   items={[
 *     { id: 'overview', label: 'Overview', content: <p>Uptime 99.98%</p> },
 *     { id: 'config', label: 'Config', content: <p>2 vCPU, 4 GB</p> },
 *     { id: 'logs', label: 'Logs', content: <p>No recent errors</p> },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export function Tabs({ label, items, defaultTabId, selectedTabId, onTabChange, ref, ...rest }: TabsProps) {
  const baseId = useId();
  const isControlled = selectedTabId !== undefined;
  const firstId = items[0]?.id;
  const [internalId, setInternalId] = useState<string | undefined>(defaultTabId ?? firstId);

  // Resolve to a real item so a stale or missing id can never leave every panel
  // hidden — fall back to the first tab.
  const requestedId = isControlled ? selectedTabId : internalId;
  const activeId = items.some((item) => item.id === requestedId) ? requestedId : firstId;

  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const selectTab = useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalId(id);
      }
      onTabChange?.(id);
    },
    [isControlled, onTabChange],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = items.findIndex((item) => item.id === activeId);
      if (currentIndex === -1) {
        return;
      }

      let nextIndex: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      const nextTab = items[nextIndex];
      if (nextTab === undefined) {
        return;
      }

      event.preventDefault();
      selectTab(nextTab.id);
      // Selection follows focus: move focus so the roving tabindex tracks the
      // active tab and the panel is one Tab-key away.
      tabRefs.current.get(nextTab.id)?.focus();
    },
    [items, activeId, selectTab],
  );

  return (
    <div {...rest} ref={ref} style={undefined}>
      <div aria-label={label} className="gw-tabs" onKeyDown={onKeyDown} role="tablist">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              className="gw-tab"
              id={`${baseId}-tab-${item.id}`}
              key={item.id}
              onClick={() => selectTab(item.id)}
              ref={(node) => {
                if (node === null) {
                  tabRefs.current.delete(item.id);
                } else {
                  tabRefs.current.set(item.id, node);
                }
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          aria-labelledby={`${baseId}-tab-${item.id}`}
          className="gw-tab-panel"
          hidden={item.id !== activeId}
          id={`${baseId}-panel-${item.id}`}
          key={item.id}
          role="tabpanel"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: The WAI-ARIA tabs pattern makes the tabpanel focusable (tabIndex 0) so keyboard users can Tab straight from the selected tab into the panel content. The rule's "don't add non-interactive elements to the tab order" reasoning doesn't cover the tabpanel exception.
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
