const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

try {
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);
  const result = purify.sanitize('<b>hi</b>');
  console.log('Sanitized:', result);
} catch (e) {
  console.error('Error in sanitize:', e);
}
