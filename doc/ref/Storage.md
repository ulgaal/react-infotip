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

### `config`

The tip `config`, as an object which contains the following keys:

| Key           | Type             | Description                                         |
|---------------|------------------|-----------------------------------------------------|
| position      | `<PositionType>` | sub-configuration describing the tip position       |
| show          | `<ShowType>`     | sub-configuration describing how the tip is shown   |
| hide          | `<HideType>`     | sub-configuration describing how the tip is hidden  |
| wrapper       | `<component>`    | The component to instantiate to wrap the tip        |
| wrapperProps  | `<object>`       | The React properties for the wrapper component      |

`<PositionType>` is an object, which contains the following keys:

| Key           | Type                   | Description                                                   |
|---------------|------------------------|---------------------------------------------------------------|
| my            | `<CornerType>`         | The corner of the tip to position in relation to the `at` key |
| at            | `<CornerType>`         | The corner of `target` element to position the tip corner at  |
   | target        | `<target-spec>`        | The element the tip will be positioned in relation to. Can be one of <dl><dt>false</dt><dd>the source itself (default)</dd><dt>[&lt;number&gt;, &lt;number&gt;]</dt><dd>an array of x, y coordinates</dd><dt>'mouse'</dt><dd>the mouse coordinates for the event which triggered the tip to show</dd><dt>&lt;string&gt; \| DOMElement</dt><dd>CSS selector or React ref for another DOMElement</dd></dl>   |
  | adjust        | `<AdjustType>`         | sub-configuration describing how the tip position should be adjusted |
  | container     | `<string> \| DOMElement` | CSS selector or React ref to the DOMElement under which tips will attached.      |

`<CornerType>` is one of the following enumeration value:
* top-left
* top-center
* top-right
* center-left
* center-right
* bottom-left
* bottom-center
* bottom-right

`<AdjustType>` is an object, which contains the following keys:

| Key           | Type                   | Description                                                   |
|---------------|------------------------|---------------------------------------------------------------|
  | mouse         | `<mouse-spec>`         | Describes how mouse movement affects the tip placement. Can be one of <dl><dt>false</dt><dd>do not adjust to mouse move (default)</dd><dt>true</dt><dd>adjust to mouse move</dd><dt><pre>function: event =&gt; ({ x, y })</pre></dt><dd>compute the position of the tip using a function which receives mouse move event as input</dd></dl>
| x             | `<number>`             | x-translation the tip (0 by default)
| y             | `<number>`             | y-translation the tip (0 by default)
  | method        | `<method-spec>`        | Decribes the method to use to optimize tip placement inside its container. Can be one of <dl><dt>none</dt><dd>no placement adjustment (default)</dd><dt>{ flip: [&lt;CornerType&gt; (, &lt;CornerType&gt;)\* ] }</dt><dd>pick the corner which maximizes overlap between the tip and its container</dd><dt>{ shift: [&lt;AxisType&gt; (, &lt;AxisType&gt;)\*]}</dt><dd>keep the tip inside its container for the specified axis</dd></dl>

`<AxisType>` is one of the following enumeration value:
* horizontal
* vertical

`<ShowType>` is an object, which contains the following keys:

| Key        | Type         | Description                                                                        |
|------------|--------------|------------------------------------------------------------------------------------|
| delay      | `<number>`   | Delay between mouse enter event in the source and the tip display (0ms by default) |

`<HideType>` is an object, which contains the following keys:

| Key        | Type         | Description                                                                        |
|------------|--------------|------------------------------------------------------------------------------------|
| delay      | `<number>`   | Delay between mouse leave event from the source or the tip and removal of the tip (0ms by default) |

type: `custom`


### `onTipChange`

A callback function invoked when the list of persistent tip changes

type: `func`


### `tip`

A function which receives as input a `Source` `id` and outputs the corresponding React tip
element.

type: `func`


### `tips`

The list of persisted tips. Each entry of the list is an object with
the following keys:

| Key | Type             | Description                                                |
| --- | ---------------- | ---------------------------------------------------------- |
| id  | `<string>`       | The id property of the `<Source>` to which the tip belongs |
| my  | `<CornerType>`   | The corner of the tip to which the tail attaches           |
| location  | `<LocationType>` | The current tip location                                   |

`<LocationType>` is an object, which contains the following keys:

| Key  | Type       | Description                                                         |
| ---- | ---------- | ------------------------------------------------------------------- |
| left | `<number>` | The x coordinate of the tip in the tip-container coordinate system. |
| top  | `<number>` | The y coordinate of the tip in the tip-container coordinate system. |

type: `arrayOf[object Object]`

