## Table of Contents

- [Tooltips](#tooltips)
  - [Tooltips use case](#tooltips-use-case)
  - [Tooltips example](#tooltips-example)
  - [Tooltips how to](#tooltips-how-to)
  - [Tooltips components](#tooltips-components)
  - [Tooltips internals](#tooltips-internals)
- [Sticky-notes](#sticky-notes)
  - [Sticky-notes use case](#sticky-notes-use-case)
  - [Sticky-notes example](#sticky-notes-example)
  - [Sticky-notes how to](#sticky-notes-how-to)
  - [Sticky-notes components](#sticky-notes-components)
  - [Sticky-notes internals](#sticky-notes-internals)
 
React-infotip can be used to create two kinds of UI elements, tooltips and sticky-notes.

# Tooltips

## Tooltips use case
End-users use tooltips to get help or more detailed information about a UI item over which they hover (or which they touch for touch-based interfaces). Sometimes the tooltip will follow mouse or tap movement and adjust its contents dynamically as the position changes

## Tooltips example

Please have a look at the interactive [storybook](https://ulgaal.github.io/react-infotip/storybook-static/?path=/story/tooltips--default-source) for a tooltip example.

## Tooltips how to

Using the library to create tooltips is very easy. Simply wrap your React component (the component which should trigger the tooltip appearance) in a `<Source>` . Use the `tip` property of the `<Source>` to specify the content of your tooltip, as a React component. Optionally, configure the aspects of your tooltip which differ from the default tooltip using the `config` property of `<Source>` (or you can do that at a higher level using the `<ConfigContext>` React [context](https://reactjs.org/docs/context.html))

## Tooltips components

Here are the main components you will use when creating tooltips.

* `<Source>` lets your components provide tooltips. Simply wrap your component in a `<Source>` and set its `tip` property to the React component to use as a tooltip.  

* `<MergingContextProvider>`, `<ConfigContext>` let you configure your application tooltips globally using React contexts. `<ConfigContext>` is the actual React [context](https://reactjs.org/docs/context.html), whereas `<MergingContextProvider>`is a smart `<ConfigContext.Provider>` that will merge the partial configuration you provide with the configuration of its englobing context. 

 * `<Balloon>`, `<Cloud>` wrap tooltips is a graphical component which give them a tip appearance. `<Balloon>` is the wrapper component use in the default configuration. Alternatively you may want to override it in the configuration with a `<Cloud>` for a more cartoonish rendering, or provide your own wrapper. 

## Tooltips internals

Though you do not need to know precisely how the library works to use it, the following section will give you insights of the DOM and React mechanisms on which the library relies.

1. When you wrap a `<Source>` component around your component, it adds a neutral tag around your component markup (a `<span style="display: 'contents'">` or a `<g>` if you are doing SVG). This tag is used to track the mouse events on your component and trigger the tip display.
2. When a mouse event triggers the tip display, the component you have provided in the `<Source>` tip is wrapped in a wrapper component (typically a `<Balloon>` or a `<Cloud>`) and appended to a DOM container element (by default, the document `<body>`) using a React [portal](https://reactjs.org/docs/portals.html). This container element must use absolute of relative positioning.
3. The position of the wrapper is computed taking into account the size and shape of the `<Source>`, tip and container DOM elements. The wrapper is then positioned using a CSS `translate()` transform.
   
# Sticky-notes

## Sticky-notes use case

End-users use sticky-notes in varied ways: 
* as a tooltip, to get info on a UI item without having to navigate to a detail page
* to compare several UI items with each other
* as bookmarks
* as reminders of things to do later with the UI item.
* to access controls on the UI item.
* to annotate UI items.
  
Usually the sticky-notes will be used in the component subtree of a complex React component, such as a table, a data chart or a report.

Users need to be able to pin the notes, drag them around and they want to retrieve their notes if the page gets reloaded. They want the notes to appear at locations which maximize their visibility.

## Sticky-notes example

Please have a look at the interactive [storybook](https://ulgaal.github.io/react-infotip/storybook-static/?path=/story/sticky-notes--table-sticky-notes) for a sticky-note example.

## Sticky-notes how to

Creating sticky-notes require a bit more work than tooltips. 

To make things easier to grasp, we will use a concrete example: suppose you have a wedding gift `<Catalog>` component. It is composed of `<Page>` components. Each page is a list of wedding `<Gift>` components. You want the end user to be able to attach sticky-notes to a gift.
1. First you need to identify the root of the React component subtree where sticky-notes can appear, and wrap it in a `<Storage>`. That component would be `<Catalog>`.
2. Then you need to wrap each item to which a note may attach in a `<Source>` and assign it a unique id using the `id` property of `<Source>`. In the example every `<Gift>` would be wrapped in a `<Source>` and assigned an `id`. 
3. You need to provide the `tip` property of the `<Storage>` component. This property is a function which returns the sticky-note for a given `id`. The function is lazily invoked by the library, to display pinned sticky-notes or when the mouse hovers over a `<Source>`. In our example, this is where the data for a given gift would be retrieved from its `id` to create the sticky-note content.
4. You need to provide the `onTipsChange` and `tips` property of the `<Storage>` component. `onTipsChange` is a function called when a sticky-note is pinned or unpinned. Its job is to store the tip state it receives (in the React state, a database, local storage, ...). `tips` should be valued to the previously mentioned state. 

## Sticky-notes components

Here are the main components you will use when creating tooltips (on top of the other components described in the previous section: `<Source>`, `<ConfigContext>`, `<MergingConfigProvider>`, `<Cloud>`, `<Balloon>`):

* `<Storage>` works in conjunction with a set of `<Source>` to provide sticky-notes for the React subtree of which it is the root.
  
* `<Pinnable>` is just a decorator which adds a push pin to another wrapper such as `<Cloud>`, `<Balloon>`.

## Sticky-notes internals

Though you do not need to know precisely how the library works to use it, the following section will give you insights of the DOM and React mechanisms on which the library relies.

1. When the `<Storage>` component is attached, it `tips` property usually contains the ids and positions of the sticky-notes which had been stored in previous sections. The ids may correspond to `<Source>`s which no longer exist or which have not yet been displayed. `<Storage>` creates an internal object for each of the ids in `tips`, whether a corresponding `<Source>` exists or not. This object takes care of all the mouse events associated with a particular tip.
2. The `render()` method of `<Storage>` call the function specified in the `tip` property to retrieve the contents of all the currently visible tips. Each content is wrapped in a wrapper component (typically a `<Balloon>` or a `<Cloud>`) and appended to a DOM container element (by default, the document `<body>`) using a React [portal](https://reactjs.org/docs/portals.html). This container element must use absolute of relative positioning.
3. When a `<Source>` is met in the `<Storage>` subtree, there are two possible code paths. Either the source corresponds to an already known id, which already has an associated internal in `<Storage>`: in that case that object is reused to track the mouse events associated with the `<Source>`. Or the id is not known yet, it which case a new internal object is created in `<Storage>` to take care of mouse events associated with the source.
4. When the pin icon on the `<Pinnable>` wrapper gets clicked or when the tips get dragged around, the state of the `tips` change and the `onTipsChange` handler gets invoked, which give the application a chance to record and store these changes for future sessions.
