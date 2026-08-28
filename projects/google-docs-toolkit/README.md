# Google Docs Toolkit

Since Google Docs often overrides system-level text replacements with its own internal settings, the most reliable way to get these working is to add them directly to the Google Docs "Substitutions" list.

## 1. How to Enable Shortcuts in Google Docs

Google Docs has a built-in feature that mirrors the macOS "Text Replacements." To add your tree symbols:

1. Open any Google Doc.
2. Go to **Tools > Preferences**.
3. Click the **Substitutions** tab.
4. In the **Replace** column, type your shortcut (e.g., `,,t`).
5. In the **With** column, paste the symbol (e.g., `├──` followed by one trailing space).
6. Ensure the **Automatic substitution** checkbox at the top is checked.

> **Note:** For the vertical line (`│`), make sure you include three spaces after it in the "With" box so the next line's branch aligns perfectly.

---

## 2. Automating Trees with Google Apps Script

Since you are already working with **Google Apps Script** for automation, you can create a custom function that turns a simple list of names into a formatted tree instantly. This is much faster than typing each branch manually for large folders.

You can add this script to a Google Doc (Extensions > Apps Script):

```javascript
/**
 * Generates a visual tree from a list of strings.
 * Use: Select text, then run this function from a custom menu.
 */
function generateTree() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (!selection) return;

  const elements = selection.getRangeElements();
  let treeOutput = '';

  elements.forEach((el, index) => {
    const text = el.getElement().asText().getText();
    const isLast = index === elements.length - 1;
    const prefix = isLast ? '└── ' : '├── ';

    treeOutput += prefix + text + '\n';
  });

  // Inserts the tree at the end of the selection
  const lastElement = elements[elements.length - 1].getElement();
  lastElement
    .getParent()
    .asBody()
    .appendParagraph(treeOutput)
    .setFontFamily('Roboto Mono'); // Auto-sets monospace for alignment
}

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🌲 Tree Tools')
    .addItem('Convert List to Tree', 'generateTree')
    .addToUi();
}
```

## 3. Why This Works for Your Workflow

- **Font Handling:** The script automatically applies **Roboto Mono** to the output. This solves the alignment issue where standard fonts make the tree look "crooked."
- **Automation Integration:** Since you've been exploring **GitHub Actions** and **CI/CD**, you could eventually modify a script like this to read a file structure from a GitHub repository and print the directory tree directly into a project "ReadMe" or a status Doc.
