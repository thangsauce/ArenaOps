# ArenaOps Obsidian -> Notion Import

This folder contains a Notion-ready export of the ArenaOps Obsidian notes.

## Contents

- `markdown/`: cleaned Markdown pages for page import
- `todo.csv`: task list converted into a Notion-friendly table import

## Recommended Import Flow

1. In Notion, create a parent page named `ArenaOps`.
2. Import the files from `markdown/` into that page in one batch.
3. Import `todo.csv` as a database under the same parent page.
4. Set the database property types after import:
   - `Status`: `Status` or `Select`
   - `Area`: `Select`
   - `Done`: `Checkbox`
5. Open the imported `ArenaOps` home page and relink the references if Notion does not preserve all relative Markdown links during import.

## Notes

- Obsidian wiki-links were converted to standard Markdown links.
- Obsidian task checkboxes were moved into `todo.csv` so they map better to a Notion database.
- Code blocks, headings, lists, and tables were kept in Markdown because Notion imports them cleanly.
