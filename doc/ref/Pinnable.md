`Pinnable` (component)
======================

A `Pinnable` component adds an inner decorator between
the wrapper component and the content component. This decorator
provides the ability to pin down a tip and to drag it around.

Props
-----

### `onMouseDown`

A callback function to invoke the component is clicked (used to implement tip dragging)

type: `func`


### `onToggle`

A callback function to invoke when the push-pin is clicked (used to toggle the `pinned` property)

type: `func`


### `pinned`

`true` to display an pinned push-pin, `false` otherwise

type: `bool`


### `wrapper`

The wrapper component type to use

type: `elementType`

