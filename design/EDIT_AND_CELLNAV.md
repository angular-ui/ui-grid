# Edit and CellNav, Focus in the Grid

Both edit and cellNav provide ways to focus particular cells in the grid.  This, and the associated
`editOnFocus` option have been a source of pain, but they are also (unfortunately) a very desirable
feature that we'd like to have working smoothly.

The current implementation is inspired by the google sheets implementation.  A key feature is that
the focus is held by the viewport, not by the individual cells, and focus is "faked" through use of 
css classes and directing keypresses to particular elements.

<< @swalters: is this only true for cellNav, or is it also true for edit?  It seems that edit must
be receiving focus or else some of the custom editors just wouldn't work >>

We continue to have difficulties with the interaction of these two modules, and with the behaviour 
upon events such as scrolling, scrolling that is triggered by typing (for a part-visible cell), 
`editOnFocus` and whether it works reliably.

This overview aims to document what we think our business features are, and then describe a framework
that we could move to that would make the logic cleaner and therefore easier to fix defects in.

## CellNav

The intention of cellNav is that a user can select a cell, and then use the keyboard to move around 
the grid.  When the focus is given to a particular cell the grid should attempt to scroll to make that
cell fully visible (if it's not already fully visible).  If the cell is too tall or too wide to be
fully visible, then the grid should show as much of the cell as possible whilst keeping the top left 
corner fully visible.

Keyboard actions that should move the focused cell are:
 - 4 arrow keys
 - pg up, pg down (move a page at a time)
 - enter (moves down)
 - shift+enter (moves up)
 - tab (moves right)
 - shift+tab (moves left)

Where a navigation hits the edge of the grid, the navigation should "wrap around".  If we move off
a row to the right, we should come back on 1 row down, in the leftmost focusable cell.  If we move
off a row to the left, we should come back 1 row up, in the rightmost focusable cell.  Similarly for 
moving up and down - if we hit enter till we get to the bottom of the grid, we should re-enter at the
top.

There are two exceptions to this behaviour.  When we exit the top left focusable cell, we should shift focus
off the grid entirely, to the previous widget on the page.  When we exit the bottom right focusable cell, we should
shift focus to the next widget on the page.

When we tab into the grid from another widget on the page, we should select the top left or bottom right 
focusable cell.

When we scroll we should remember which cell had focus.  If that cell remains visible then we should highlight
it as having the focus.  If that cell scrolls off the page then we should remember it, and highlight it again
when it comes visible.

A source of contention is that when we give a cell focus, we attempt to make it visible.  When a user manually
scrolls we reset the focus to the correct cell, but we don't want to automatically scroll to make it visible - this
will give jankiness to our scrolling as the focused cell moves off the page.

Another contention is that as we tab across a row we sometimes get scroll up and down for some reason to do with
native browser behaviour.


## Edit

Edit works by noticing that a cell has entered edit mode, and replacing the cell contents with the specified editor.
The editor will raise events for start_edit, end_edit and cancel_edit.  Upon end or cancel the edit feature will 
remove the editor and replace it with the normal cell template.

`editOnFocus` is a feature that works like a spreadsheet - when you enter a cell the editor is displayed and the 
cell is immediately editable.

Upon a cell becoming editable we should attempt to scroll it so that it is fully visible, and as with cellNav if we 
cannot make it fully visible we should do as good a job as we can whilst keeping the top left corner visible.

Editors often have default navigation actions.  For example, in an input box if you use the arrow keys to go to the
edge of the field and then off, it will shift focus to the next field.  This is effectively a cellNav.

Our different editors have slightly different desired default behaviours.

### Input

Upon an input field receiving focus all the text in that field should be automatically selected, the cell should
be scrolled so far as possible to make the field fully visible.  The arrow keys when pressed should remove the highlight
of all text, and move around within the field.  They should not exit the field when they reach the end.

Enter, shift+enter, tab, shift+tab should end editing, and should trigger a cellNav.  Perhaps these should still be
trapped by cellNav itself, and not by edit?  Is this possible with standard html5 widgets?

## Date

Ideally this would one day be a proper date picker.  Anyway, up and down arrow keys should adjust the current
date element we're on (the year, month or day), left and right arrow keys should select the next date part in that
direction.  They should not take us off the field to the left or right.

Enter, shift+enter, tab, shift+tab should end editing, and should trigger a cellNav.  Perhaps these should still be
trapped by cellNav itself, and not by edit?  Is this possible with standard html5 widgets?

## Dropdown

Starting edit should drop down the dropdown.  Up and down arrows should move the selection.  Left and right
arrows should move the selection the same as up and down.

Enter, shift+enter, tab, shift+tab should end editing, and should trigger a cellNav.  Perhaps these should still be
trapped by cellNav itself, and not by edit?  Is this possible with standard html5 widgets?

## Custom editors

In general custom editors should follow the pattern of only triggering a cellNav on Enter, shift+enter, tab, shift+tab,
this also means that custom editors should not use these keys for anything else.

## Deep edit

I can't remember why this is a good idea.  It seems that the semantics of the input field work fine without a deep edit 
concept.  I think it's more that when an editable field gets focus but hasn't yet entered edit mode, we still let the
left/right work with cellNav.  So maybe deep edit is sort of a halfway house of `editOnFocus` that we don't really need?

## Edit On Focus

Edit on focus should work that whenever a cell gets focus we should immediately enter edit mode.  Otherwise the 
behaviour should remain the same.

## Problems

Edit has a number of points of contention with cellNav, and the interoperation of the two is problematic (but also 
essential).  Areas of conflict are:

- when you're typing in a cell you can trigger a scroll if the cell isn't fully visible.  The scroll may change 
  which DOM elements are what, and therefore which DOM element it is that we're editing in.  The upshot is that 
  we tend to lose focus on the editor, and then gain focus again. When we gain focus again we're sometimes not
  where we used to be - for example on the input field we may select all the text rather than returning our cursor 
  to where it was.  These are usability issues for a user who is typing in the field
  
- some editors propagate events to the parent object, for example the standard input seems to propagate a right 
  arrow key at the end of the field to the parent, which in turn causes a cellNav.  This isn't our desired 
  behaviour
  
- if the user scrolls whilst a field is in edit mode we sometimes get unusual behaviour.  Really we want it to work 
  similarly to if a scroll happened whilst editing a field - we want our position in the editor at the end of the scroll
  to be the same as at the start, unless our field has gone off page, in which case we want to end edit mode
  
- edit on focus is hard because when a cell gets focus we start edit.  Starting edit then attempts to select all the
  text, and scroll so we're visible, which makes a mess
  
## Design thoughts

Can we agree that tab, shift+tab, enter, shift+enter are always trapped by cellNav, and that all editors must stay 
away from them?  Can we agree that other than those 4 keys, no editor will ever propagate navigation (and work out
how to make that true, as well as document how to do it for custom editors as well)?  

Can we define some sort of state callback for each editor (that each editor must create and respond to)?  So
when a scroll happens we'd call getState on the editor, then when the scroll completes we'd find the new instance
of that editor and call setState?  Then each editor is responsible for maintaining it's own state, or choosing not
to maintain it.  For some editors there may be no state at all (for a dropdown, the selected item is the state), for
others it's pretty basic (for input it's the cursor location and the selected text start and end).

Can we draw a distinction between getting focus through a user action (keyboard action or mouse click or touch), and
re-getting focus after a scroll or other grid rendering change?  Then we could choose not to select all the text 
and scroll to make a cell visible if we're re-getting focus as opposed to initially getting focus?


