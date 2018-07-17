# Grid Plugin

The Grid Plugin provides a background grid that matches the Paper's `gridSize`
property.

## Grid Set-Up

In order to use the Grid Plugin, you need to initialize it. To do this, you will
create a new instance of Grid and add it to the `plugins` array when
initializing Paper.

### Grid Properties

Here is the Grid Properties interface defined in TypeScript:

```ts
interface IGridProperties {
  gridColor?: string;
}
```

This defines the shape of the object that must be given to initialize Grid.
Let's take a look into what each of those potential properties mean.

#### gridColor (optional) - `string`

This is the color that the grid will be rendered with. It defaults to `'#EEE'`.

### Initialization

Now that you have an idea of building a Grid Properties object, let's look at
initializing a Grid instance.

```ts
import { Grid } from 'psiagram-plugin-grid';

const myPaper = new Paper({
  height: 900,
  width: 1300,
  plugins: [new Grid({ gridColor: '#C4C5C6' })],
});
```

Additionally, if you want to store the instance of the Grid outside of the Paper
(for example, to make changes to grid color after paper has already been
initialized) then you can initialize it like this:

```ts
import { Grid } from 'psiagram-plugin-grid';

const grid = new Grid();

const myPaper = new Paper({
  height: 900,
  width: 1300,
  plugins: [grid],
});

// Then later:
grid.gridColor = '#CCC';
```
