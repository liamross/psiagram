# Advanced Paper Methods

Advanced paper methods begin with an underscore, but are public and can be used outside of the Paper instance. These should only be used in advanced cases, or within a [Plugin](../plugins/).

### \_fireEvent

```typescript
/**
 * **WARNING:** The underscore "_" denotes that this method should only be
 * used in plugins. Non-underscore methods should cover all other use cases.
 *
 * Fires an event, calling all listeners for that event type.
 *
 * Order of operations:
 * 1. If listeners of evt.eventType exist begins looping through listeners.
 * 2. Calls each listener with event if evt.canPropagate is true.
 * 3. After all listeners called, calls evt.defaultAction. If defaultAction
 *    has already been called by a listener, this does nothing.
 *
 * @param evt The event you wish to fire.
 */
_fireEvent(evt: PaperEvent<any>): void;
```

### \_getDrawSurface

```typescript
/**
 * **WARNING:** The underscore "_" denotes that this method should only be
 * used in plugins. Non-underscore methods should cover all other use cases.
 *
 * If you are trying to get the paper to render in your application, you
 * probably want to use getPaperElement().
 *
 * Returns the SVG element contained within the paper wrapper.
 */
_getDrawSurface(): SVGElement;
```

### \_insertPaperDef

```typescript
/**
 * **WARNING:** The underscore "_" denotes that this method should only be
 * used in plugins. Non-underscore methods should cover all other use cases.
 *
 * Insert a new def into the defs element within Paper.
 *
 * @param def The def to insert.
 * @param [id] Optional. An ID that can be used to remove the def.
 */
_insertPaperDef(def: SVGElement, id?: string): void;
```

### \_removePaperDef

```typescript
/**
 * **WARNING:** The underscore "_" denotes that this method should only be
 * used in plugins. Non-underscore methods should cover all other use cases.
 *
 * Remove a def from the defs element within Paper.
 *
 * @param id The ID of the def to remove.
 */
_removePaperDef(id: string): void;
```

