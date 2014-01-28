# Icebeam

A **component** is a tree of predefined HTML tags and CSS that display in a predefined way. The component has requirements for where it is applicable, and it has input arguments to customize its rendering.

Icebeam provides built-in components to generate common HTML layout patterns. These built-in components have the following requirements and input.

## Definitions

### Lengths

- W_ = Width prefix
- H_ = Height prefix
- _F = Fixed
- _S = Shrinks to children
- _E = Expands to parent
- _U = Unknown

*(Fixed means that it can be calculated or derived from other values, not necessarily that it is a user specified px value.)*

### Content

- T = Text
- I = Image
- F = Fill
- B = Background image

### Alignment

- TL = Top left
- TC = Top center
- TR = Top right
- ML = Middle left
- MC = Middle center
- MR = Middle right
- BL = Bottom left
- BC = Bottom center
- BR = Bottom right

### Context

- P() = Parent must satisfy the provided arguments
- C() - Children must satisfy the provided arguments

![Lapras, use Icebeam!](https://i.imgur.com/FtSg70O.gif)
