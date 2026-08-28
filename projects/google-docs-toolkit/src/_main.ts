/**
 * Generates a visual tree from selected lines in a Google Doc.
 */
function generateTree() {
  const document = DocumentApp.getActiveDocument();
  const selection = document.getSelection();

  if (!selection) {
    DocumentApp.getUi().alert(
      'Select one or more lines first, then run Convert List to Tree.'
    );
    return;
  }

  const selectedLines: string[] = [];

  selection.getRangeElements().forEach((rangeElement) => {
    const element = rangeElement.getElement();

    if (element.getType() !== DocumentApp.ElementType.TEXT) {
      return;
    }

    const textElement = element.asText();
    const fullText = textElement.getText();

    const start = rangeElement.getStartOffset();
    const end = rangeElement.getEndOffsetInclusive();

    const selectedText =
      start >= 0 && end >= 0 ? fullText.slice(start, end + 1) : fullText;

    selectedText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => selectedLines.push(line));
  });

  if (!selectedLines.length) {
    DocumentApp.getUi().alert(
      'No text lines were found in the current selection.'
    );
    return;
  }

  const treeOutput = selectedLines
    .map((line, index) => {
      const prefix = index === selectedLines.length - 1 ? '└── ' : '├── ';
      return `${prefix}${line}`;
    })
    .join('\n');

  const paragraph = document.getBody().appendParagraph(treeOutput);
  paragraph
    .editAsText()
    .setFontFamily(0, Math.max(treeOutput.length - 1, 0), 'Roboto Mono');
}

function onOpen() {
  DocumentApp.getUi()
    .createMenu('Tree Tools')
    .addItem('Convert List to Tree', 'generateTree')
    .addToUi();
}
