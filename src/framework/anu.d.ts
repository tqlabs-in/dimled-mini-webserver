export type View<S> = (state: Readonly<S>) => string;

export type Actions<S> = {
  [K in keyof S]: S[K] extends (...args: any[]) => any ? S[K] : never;
};

/**
 * Mount a tiny declarative UI.
 *
 * @param root CSS selector for root element
 * @param view Function returning HTML string
 * @param state Mutable state + actions
 *
 * @example
 * const app = $("body", view, {
 *   count: 0,
 *   inc() { this.count++; this.render() }
 * })
 */
export declare function $<S extends object>(
  root: string,
  view: View<S>,
  state: S
): S & {
  render(): void;
};
