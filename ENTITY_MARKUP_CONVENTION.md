# Entity Markup Convention for Fun Facts

This document explains the convention for marking entities in the `funFacts` field of song information files.

## Format

Use the format `[type:value]` where:
- `type` is the entity type (date, artist, album, song)
- `value` is the actual value to display

## Entity Types

### 1. Dates
- **Format**: `[date:1975]` or `[date:1975-1976]`
- **Color**: Blue (`text-blue-400`)
- **Example**: "This song was recorded in [date:1975]"

### 2. Artist Names
- **Format**: `[artist:Queen]` or `[artist:Freddie Mercury]`
- **Color**: Green (`text-green-400`)
- **Example**: "[artist:Freddie Mercury] wrote this song"

### 3. Album Names
- **Format**: `[album:A Night at the Opera]`
- **Color**: Purple (`text-purple-400`)
- **Example**: "The song appears on [album:A Night at the Opera]"

### 4. Song Titles
- **Format**: `[song:Bohemian Rhapsody]`
- **Color**: Yellow (`text-yellow-400`)
- **Example**: "[song:Bohemian Rhapsody] is a masterpiece"

## Features

- **Hover Effect**: All highlighted entities show an underline on hover
- **Tooltip**: Hovering shows a tooltip with the entity type and value
- **Bold Text**: All entities are displayed in bold for emphasis

## Example

```json
{
  "funFacts": "This iconic song was recorded in [date:1975] and features three distinct sections. [artist:Freddie Mercury] wrote the entire [song:Bohemian Rhapsody] on piano. The song appears on the album [album:A Night at the Opera]."
}
```

This will render with:
- "1975" in blue
- "Freddie Mercury" in green  
- "Bohemian Rhapsody" in yellow
- "A Night at the Opera" in purple

All with hover effects and tooltips. 