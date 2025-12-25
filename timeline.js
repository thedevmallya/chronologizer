class Chronologizer {
    constructor() {
        this.timelines = [];
        this.svg = document.getElementById('timeline-svg');
        this.lineHeight = 60;
        this.padding = { left: 120, right: 120, top: 20 };
        this.editingIndex = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('add-timeline').addEventListener('click', () => this.addTimeline());
        document.getElementById('clear-all').addEventListener('click', () => this.clearAll());

        // Allow Enter key to add timeline
        ['start-date', 'end-date', 'label'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTimeline();
            });
        });
    }

    parseDate(dateStr) {
        // Handle various date formats: years (1066), ISO dates (2024-01-15), etc.
        dateStr = dateStr.trim();

        // Year with BC/BCE/AD/CE suffix (e.g., "428 BC", "100 BCE", "2024 AD")
        const eraMatch = dateStr.match(/^(\d{1,5})\s*(BC|BCE|AD|CE)$/i);
        if (eraMatch) {
            let year = parseInt(eraMatch[1]);
            const era = eraMatch[2].toUpperCase();
            if (era === 'BC' || era === 'BCE') {
                year = -year;
            }
            const date = new Date(0);
            date.setFullYear(year, 0, 1);
            return date;
        }

        // Just a year (positive or negative for BCE)
        if (/^-?\d{1,5}$/.test(dateStr)) {
            const year = parseInt(dateStr);
            const date = new Date(0);
            date.setFullYear(year, 0, 1);
            return date;
        }

        // ISO date format
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }

        return null;
    }

    formatDate(date) {
        const year = date.getFullYear();

        // For simple year display
        if (date.getMonth() === 0 && date.getDate() === 1) {
            return year < 0 ? `${Math.abs(year)} BCE` : `${year}`;
        }

        // Full date display
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    addTimeline() {
        const startDateStr = document.getElementById('start-date').value;
        const endDateStr = document.getElementById('end-date').value;
        const label = document.getElementById('label').value;

        if (!startDateStr || !endDateStr) {
            alert('Please enter both start and end dates');
            return;
        }

        const startDate = this.parseDate(startDateStr);
        const endDate = this.parseDate(endDateStr);

        if (!startDate || !endDate) {
            alert('Invalid date format. Use year (e.g., 1066, -500, 428 BC) or ISO format (e.g., 2024-01-15)');
            return;
        }

        if (startDate > endDate) {
            alert('Start date cannot be after end date');
            return;
        }

        this.timelines.push({
            startDate,
            endDate,
            label: label || `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`
        });

        // Clear inputs
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.getElementById('label').value = '';

        this.render();
    }

    clearAll() {
        this.timelines = [];
        this.render();
    }

    deleteTimeline(index) {
        this.timelines.splice(index, 1);
        this.render();
    }

    editLabel(index, currentLabel, x, y, textAnchor) {
        this.editingIndex = index;

        // Create foreignObject to hold HTML input
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('x', x - 100);
        foreignObject.setAttribute('y', y - 15);
        foreignObject.setAttribute('width', 200);
        foreignObject.setAttribute('height', 30);
        foreignObject.setAttribute('class', 'label-editor');

        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentLabel || '';
        input.maxLength = 256;
        input.style.width = '100%';
        input.style.padding = '4px';
        input.style.fontSize = '12px';
        input.style.border = '2px solid #667eea';
        input.style.borderRadius = '4px';
        input.style.textAlign = textAnchor === 'middle' ? 'center' : 'left';

        // Handle save on Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.timelines[index].label = input.value.trim();
                this.editingIndex = null;
                this.render();
            } else if (e.key === 'Escape') {
                this.editingIndex = null;
                this.render();
            }
        });

        // Handle blur (clicking away)
        input.addEventListener('blur', () => {
            setTimeout(() => {
                if (this.editingIndex === index) {
                    this.editingIndex = null;
                    this.render();
                }
            }, 100);
        });

        foreignObject.appendChild(input);
        this.svg.appendChild(foreignObject);

        // Focus and select the input
        setTimeout(() => input.focus(), 0);
    }

    calculateScale() {
        if (this.timelines.length === 0) return { min: 0, max: 1, scale: 1 };

        let minTime = Infinity;
        let maxTime = -Infinity;

        this.timelines.forEach(timeline => {
            minTime = Math.min(minTime, timeline.startDate.getTime());
            maxTime = Math.max(maxTime, timeline.endDate.getTime());
        });

        const svgWidth = this.svg.clientWidth;
        const availableWidth = svgWidth - this.padding.left - this.padding.right;
        let timeRange = maxTime - minTime;

        // Handle case where all events have the same date (timeRange = 0)
        if (timeRange === 0) {
            // Add padding of 1 year on each side for single-date events
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            minTime -= oneYear;
            maxTime += oneYear;
            timeRange = maxTime - minTime;
        }

        const scale = availableWidth / timeRange;

        return { min: minTime, max: maxTime, scale };
    }

    timeToX(date, scaleInfo) {
        const time = date.getTime();
        return this.padding.left + (time - scaleInfo.min) * scaleInfo.scale;
    }

    render() {
        // Clear existing content
        this.svg.innerHTML = '';

        if (this.timelines.length === 0) {
            this.svg.setAttribute('height', 100);
            return;
        }

        const scaleInfo = this.calculateScale();
        const totalHeight = this.padding.top + (this.timelines.length * this.lineHeight);
        this.svg.setAttribute('height', totalHeight);

        this.timelines.forEach((timeline, index) => {
            const y = this.padding.top + (index * this.lineHeight) + 30;
            const startX = this.timeToX(timeline.startDate, scaleInfo);
            const endX = this.timeToX(timeline.endDate, scaleInfo);

            // Create group for this timeline
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'timeline-group');

            // Check if this is a single point in time (start = end)
            const isSingleDate = timeline.startDate.getTime() === timeline.endDate.getTime();

            if (isSingleDate) {
                // Draw circle for single date event
                const eventCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                eventCircle.setAttribute('cx', startX);
                eventCircle.setAttribute('cy', y);
                eventCircle.setAttribute('r', 7);
                eventCircle.setAttribute('class', 'event-circle');
                group.appendChild(eventCircle);

                // Date text above circle
                const dateText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                dateText.setAttribute('x', startX);
                dateText.setAttribute('y', y - 25);
                dateText.setAttribute('text-anchor', 'middle');
                dateText.setAttribute('class', 'timeline-date');
                dateText.textContent = this.formatDate(timeline.startDate);
                group.appendChild(dateText);

                // Label text below circle
                if (timeline.label) {
                    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    labelText.setAttribute('x', startX);
                    labelText.setAttribute('y', y + 25);
                    labelText.setAttribute('text-anchor', 'middle');
                    labelText.setAttribute('class', 'timeline-label');
                    labelText.textContent = timeline.label;
                    labelText.style.cursor = 'text';

                    // Add double-click to edit
                    labelText.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        this.editLabel(index, timeline.label, startX, y + 25, 'middle');
                    });

                    group.appendChild(labelText);
                }

                // Show editor if this timeline is being edited
                if (this.editingIndex === index && timeline.label !== undefined) {
                    this.editLabel(index, timeline.label, startX, y + 25, 'middle');
                }
            } else {
                // Draw line for duration
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', startX);
                line.setAttribute('y1', y);
                line.setAttribute('x2', endX);
                line.setAttribute('y2', y);
                line.setAttribute('class', 'timeline-line');
                group.appendChild(line);

                // Start date text
                const startText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                startText.setAttribute('x', startX);
                startText.setAttribute('y', y - 10);
                startText.setAttribute('text-anchor', 'start');
                startText.setAttribute('class', 'timeline-date');
                startText.textContent = this.formatDate(timeline.startDate);
                group.appendChild(startText);

                // End date text
                const endText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                endText.setAttribute('x', endX);
                endText.setAttribute('y', y - 10);
                endText.setAttribute('text-anchor', 'end');
                endText.setAttribute('class', 'timeline-date');
                endText.textContent = this.formatDate(timeline.endDate);
                group.appendChild(endText);

                // Label text (below the line)
                if (timeline.label) {
                    const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    const labelX = (startX + endX) / 2;
                    labelText.setAttribute('x', labelX);
                    labelText.setAttribute('y', y + 20);
                    labelText.setAttribute('text-anchor', 'middle');
                    labelText.setAttribute('class', 'timeline-label');
                    labelText.textContent = timeline.label;
                    labelText.style.cursor = 'text';

                    // Add double-click to edit
                    labelText.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        this.editLabel(index, timeline.label, labelX, y + 20, 'middle');
                    });

                    group.appendChild(labelText);
                }

                // Show editor if this timeline is being edited
                if (this.editingIndex === index && timeline.label !== undefined) {
                    const labelX = (startX + endX) / 2;
                    this.editLabel(index, timeline.label, labelX, y + 20, 'middle');
                }
            }

            // Delete button
            const deleteButton = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            deleteButton.setAttribute('class', 'delete-button');
            deleteButton.style.cursor = 'pointer';

            // Position delete button: for single dates, move further right; for ranges, use endX
            const deleteX_pos = isSingleDate ? startX + 50 : endX + 30;

            const deleteCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            deleteCircle.setAttribute('cx', deleteX_pos);
            deleteCircle.setAttribute('cy', y);
            deleteCircle.setAttribute('r', 7);
            deleteButton.appendChild(deleteCircle);

            const deleteX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            deleteX.setAttribute('x', deleteX_pos);
            deleteX.setAttribute('y', y);
            deleteX.setAttribute('text-anchor', 'middle');
            deleteX.setAttribute('dominant-baseline', 'central');
            deleteX.setAttribute('class', 'delete-x');
            deleteX.textContent = '×';
            deleteButton.appendChild(deleteX);

            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTimeline(index);
            });

            group.appendChild(deleteButton);

            this.svg.appendChild(group);
        });
    }
}

// Initialize the app
const app = new Chronologizer();
