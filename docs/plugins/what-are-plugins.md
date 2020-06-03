# What Are Plugins

In order for the Psiagram package to remain lightweight and flexible, **functionality specific to a certain style or type of diagram is generally moved into plugins**. This allows for picking and choosing specific functionality to include, while avoiding cramming unnecessary functionality into the core framework.

Each plugin is initialized with a set of properties, then passed into the Paper during initialization. Inside of Paper, a special initialize function of each plugin is called, and given access to many of Paper's internals. **This allows plugins to have a huge amount of control over the Paper**. As such, publishing your own plugin \(or even just building one for internal use\) is the most impactful way to augment the functionality of Psiagram. For more details, and for more insight into how plugins work, check out the [creating plugins](creating-plugins.md) documentation.
