# Chronologizer

A web-based timeline visualization tool for displaying time intervals ranging from years to millennia.

## Intent

Chronologizer is designed to help visualize and compare historical events, periods, and durations on a single timeline. Whether you're tracking events that span decades or marking single moments in history, Chronologizer provides an intuitive visual representation that automatically scales to accommodate any time range.

## Features

- **Flexible Date Input**: Support for simple years (e.g., 1066) or full ISO dates (e.g., 2024-01-15)
- **Dual Visualization**:
  - Duration events displayed as horizontal lines
  - Single-date events displayed as circles
- **Auto-scaling Timeline**: Automatically adjusts scale to fit all events proportionally
- **Interactive Labels**: Double-click any label to edit it inline
- **Individual Management**: Delete specific timeline entries with dedicated buttons
- **Clean Interface**: Minimalist design focused on clarity and usability

## Usage

1. Open `index.html` in your web browser
2. Enter a start date and end date
3. Optionally add a descriptive label (max 256 characters)
4. Click "Add Timeline" or press Enter
5. Double-click any label to edit it
6. Click the × button to remove individual timelines
7. Use "Clear All" to reset the entire timeline

## Examples

- **Historical Periods**: Visualize the duration of empires, wars, or cultural movements
- **Project Timelines**: Track project phases and milestones
- **Personal History**: Map significant life events and periods
- **Comparative History**: See how different historical events overlap in time

## Technical Details

Built with vanilla JavaScript, HTML5 SVG, and CSS3. No dependencies required.
