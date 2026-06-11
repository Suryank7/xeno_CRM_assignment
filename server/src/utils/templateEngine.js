/**
 * Simple template engine that replaces {{variable}} placeholders
 * with actual values from a data object.
 *
 * @param {string} template - Message template, e.g. "Hi {{name}}!"
 * @param {Object} data - Key-value pairs, e.g. { name: "Rahul" }
 * @returns {string} Rendered message
 */
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined && data[key] !== null ? String(data[key]) : match;
  });
}

module.exports = { renderTemplate };
