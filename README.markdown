Meteor Transitioner
===================

### Updates

While the initial Meteor Transitioner works out of the box, this branch cuts the JQuery leash 
and enables same-to-same template navigation.

### Install

Use [meteorite](http://possibilities.github.com/meteorite/). Then add via:

```bash
mrt add transitioner
```

### Usage

Set up your routes using the [Meteor Router](https://github.com/tmeasday/meteor-router) in the usual way. Then there are two additional reactive variables you can access:

```js
// the current page that should be drawn on the screen
Meteor.Transitioner.currentPage()

// the page that is currently coming onto the screen (null most of the time)
Meteor.Transitioner.nextPage()
```

Whilst the transition is happening, the `<body>` will have the class `transitioning`. The Transitioner waits for a transition on the body to finish so it knows when you've finished animating. So unless you have a legitimate animation to do on the body, set up a proxy animation. Here's an example:

```css
body {
  /* assuming you want a transparent body */
  background: rgba(0, 0, 0, 0);
  
  /* you'll need the standard -moz- etc -- you are using a CSS preproc right? */
  transition: background 0 linear 1s;
}
body.transitioning {
  /* a different color that happens to also be transparent */
  background: rgba(1, 0, 0, 0);
}
```

### Options

Call `Meteor.Transitioner.setOptions` to set the transitioner's options. Current options:

- `before/after` - Provide callbacks to be run just before / after the transition happens.

### Example

See `/example/slider` in this application. Run it with `mrt`.