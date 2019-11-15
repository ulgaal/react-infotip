There are several ways you can contribute to the project

# Bug Reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been reported.
2. **Check if the issue has been fixed** &mdash; try to reproduce it using the latest `master` or development branch in the repository.
3. **Isolate the problem** &mdash; create a [reduced test case](http://css-tricks.com/reduced-test-cases/) and a live example (using a site like [CodeSandbox](https://codesandbox.io/)).

A good bug report shouldn't leave others needing to chase you up for more information.
Please try to be as detailed as possible in your report.
Which versions of react-virtualized and react are you using?
What steps will reproduce the issue? What browser(s) and OS experience the problem?
What would you expect to be the outcome?
All these details will help people to fix any potential bugs.

Example:

> Short and descriptive example bug report title
>
> A summary of the issue and the browser/OS environment in which it occurs.
> If suitable, include the steps required to reproduce the bug.
>
> 1. This is the first step
> 2. This is the second step
> 3. Further steps, etc.
>
> `<url>` - a link to the reduced test case
>
> Any other information you want to share that is relevant to the issue being reported.
> This might include the lines of code that you have identified as causing the bug,
> and potential solutions (and your opinions on their merits).
<a name="features"></a>

# Feature requests

Feature requests are welcome.
But take a moment to find out whether your idea fits with the scope and aims of the project.
It's up to _you_ to make a strong case to convince the project's developers of the merits of this feature.
Please provide as much detail and context as possible.

# Pull requests

Before providing a pull request, you may wo get acquainted with the source code. To get up to speed more quickly, a [groc](https://github.com/nevir/groc) annotated version, [here](https://ulgaal.github.io/react-infotip/code/src/index.html)

The code itself uses the [standardjs](https://standardjs.com/) coding style

## Setting up the development environment

Because the project uses [storybook](https://storybook.js.org/docs/guides/guide-react/), prototyping a change or a new feature can be done in a few minutes.

``` bash
# Clone the project
git clone https://github.com/ulgaal/react-infotip
# Install the npm dependencies
cd react-infotip
npm i
# Start the interactive storybook
npm run storybook
```
You can the use your web-browser to access the storybook at this location
[http://localhost:6006](http://localhost:6006)

Modify the source file in the src directory. The storybook, which monitors the source directly, recompiles and reloads changes on the fly so you can immediately see how your changes impact existing samples.

If you provide a new feature, add a new story to showcase and document it.
Stories are located in the stories directory
Each story has a small markdown description in the stories/md directory
