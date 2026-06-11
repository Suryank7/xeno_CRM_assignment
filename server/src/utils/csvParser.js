const { parse } = require('csv-parse');

/**
 * Parses a CSV buffer into an array of objects.
 * Handles common edge cases: BOM, empty rows, trimming.
 *
 * @param {Buffer} buffer - The raw file buffer from multer
 * @returns {Promise<Array<Object>>} Parsed rows as objects
 */
function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({
      columns: true, // Use first row as headers
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle UTF-8 BOM
      cast: (value, context) => {
        // Auto-cast numbers
        if (context.header) return value;
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        if (!isNaN(num) && value.trim() !== '') return num;
        return value;
      },
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve(records));

    parser.write(buffer);
    parser.end();
  });
}

module.exports = { parseCSV };
