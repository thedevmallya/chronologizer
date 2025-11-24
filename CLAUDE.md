# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chronologizer is a pure vanilla JavaScript timeline visualization app with no build system, dependencies, or frameworks. It displays time intervals (duration events as lines, single-date events as circles) on an auto-scaling SVG timeline.

## Running the App

Simply open `index.html` directly in a web browser. No server, build step, or installation required.

## Code Architecture

The app consists of three files that work together:

- **index.html**: Form inputs (start date, end date, label) and SVG container
- **styles.css**: Visual styling for UI and SVG elements
- **timeline.js**: Single `Chronologizer` class containing all logic

### Core Data Model

The `Chronologizer` class maintains:
- `this.timelines[]`: Array of timeline objects with `{startDate, endDate, label}`
- `this.editingIndex`: Tracks which timeline label is currently being edited (null when none)

### Key Architecture Patterns

**Single-Date vs Duration Events**:
- Detected by comparing `startDate.getTime() === endDate.getDate.getTime()`
- Single-date events render as circles, durations as horizontal lines
- Both share the same data structure and rendering pipeline

**Scale Calculation**:
- `calculateScale()` finds min/max times across all timelines and computes pixel scale
- Special handling: When all events have identical dates (timeRange = 0), adds ±1 year padding to prevent division by zero
- Returns `{min, max, scale}` used by `timeToX()` to convert dates to pixel positions

**Inline Label Editing**:
- Uses SVG `<foreignObject>` to embed HTML `<input>` directly over label text
- Triggered by double-click on label elements
- Save on Enter, cancel on Esc or blur
- Re-renders entire timeline after edit to maintain clean state

**Date Parsing**:
- `parseDate()` accepts simple years (1066, -500) or ISO dates (2024-01-15)
- Negative years represent BCE dates
- All dates stored as JavaScript `Date` objects internally

**Rendering Strategy**:
- Full re-render on every change (`render()` clears SVG and rebuilds from `this.timelines[]`)
- No virtual DOM or diffing
- Event listeners attached during each render

## Important Constraints

- **Label limit**: 256 characters (enforced in HTML `maxlength` and edit input)
- **Date validation**: Start date cannot be after end date (equals is allowed for single-date events)
- **SVG coordinates**: Padding of 120px left/right, 20px top for positioning
- **Line height**: 60px vertical spacing between timeline rows
- **Circle radius**: Single-date events use 7px radius (smaller than original to be subtle)
- **Delete button**: 7px radius, positioned 30px right of duration end or 50px right of single-date circle center

## Styling Conventions

SVG elements use CSS classes for styling:
- `.timeline-line`: Duration event lines
- `.event-circle`: Single-date event circles
- `.timeline-date`: Date text labels
- `.timeline-label`: User-provided descriptive text
- `.delete-button`: Delete button group with nested circle and × text

Hover effects change colors and increase stroke/radius slightly.
