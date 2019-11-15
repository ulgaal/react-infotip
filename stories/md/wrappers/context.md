To replace the style of several wrappers at once, place them inside a `<ConfigContext.Provider>` [React context](https://reactjs.org/docs/context.html).

The style can be modified using the `wrapperProps.style` or `wrapperProps.className` keys of the context value. `wrapperProps.className` has precedence over `wrapperProps.style` (if the former is defined, the latter will be ignored).

You do not need to redefine the whole style in your style context provider. You can instead choose to use `<MergingConfigProvider>` to define a context which will merge the changes you provide with the style of the englobing context, or the default context if there is no englobing context. CSS properties under the `wrapperProps.style` key will be merged into a single hash.

_In this story, note that the style set in the code has precedence over the style injected by the style knobs_
