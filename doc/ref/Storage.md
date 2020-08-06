`Storage` (component)
=====================

The `Storage` component is in charge of persisting tips for all the
`Source`s of the React subtree of which it is the root.
A `Storage` invokes the handler specified in the `onTipChange` property
 when its list of persistent tips changes.
Using `Storage` usually implies that:
* a `Pinnable` wrapper component is used for the tips, so that
the user can pin them down them and drag them around.
* `Source`s do not provide their tips as usual using the `tip` config key.
Instead they provide an `id` key to uniquely identify themselves.
* the `tip` config key of `Storage` provides all the tips
for the subtree. It must be defined as a function which receives as
input a `Source` `id` and outputs the corresponding tip.

Props
-----

### `disabled`

True to make the storage ignore DOM events and stop showing
or hiding new tips, false (default) otherwise

type: `bool`
defaultValue: `false`


### `onTipChange`

A callback function invoked when the list of persistent tip changes.
The function receives an array of `<StoredTipType>`

type: `func`


### `tip`

A function which receives as input a `Source` `id` and outputs the corresponding React tip
element. The returned component should have its `key` property set to uniquely identify
it among the children of the `Storage`.

type: `func`


### `tips`

An array of persisted `<StoredTipType>`.

`<StoredTipType>` is an object, which contains the following keys:

| Key | Type             | Description                                                |
| --- | ---------------- | ---------------------------------------------------------- |
| id  | `<string>`       | The id property of the `<Source>` to which the tip belongs |
| my  | `<CornerType>`   | The corner of the tip to which the tail attaches           |
| location  | `<LocationType>` | The current tip location                                   |
| config  | `<ConfigType>` | The tip config (see Source for details on `<ConfigType>`)           |

`<LocationType>` is an object, which contains the following keys:

| Key  | Type       | Description                                                         |
| ---- | ---------- | ------------------------------------------------------------------- |
| left | `<number>` | The x coordinate of the tip in the tip-container coordinate system. |
| top  | `<number>` | The y coordinate of the tip in the tip-container coordinate system. |

type: `arrayOf[object Object]`

