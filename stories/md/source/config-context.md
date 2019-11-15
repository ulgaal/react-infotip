To replace the configuration of several tips, place them inside a `<ConfigContext.Provider>` [React context](https://reactjs.org/docs/context.html).

You do not need to redefine the whole configuration in your configuration context provider. You can instead choose to use `<MergingConfigurationProvider>` to define a context which will merge the changes you provide with the configuration of the englobing context, or the default context if there is no englobing context.
