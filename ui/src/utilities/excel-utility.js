import writeXlsxFile from 'write-excel-file';
import _ from 'lodash';

const defaultRowFormatter = (header, row) => row.map(value => ({
  value: _.toString(value),
  type: String,
}));

const createHeaderRow = headers =>
  headers.map(header => ({
    value: _.toString(header),
    backgroundColor: '#4472c4',
  }));

const calculateColumnWidths = (headers, rows) =>
  headers.map((header, colIndex) => {
    const headerLength = header.length;
    const maxRowLength = _.max(rows.map(row => _.toString(row[colIndex]).length));
    return Math.max(headerLength, maxRowLength) + 2;
  });

export const exportExcel = async (sheets) => {
  const results = sheets.map(({ headers, rows, sheet, rowFormatter = defaultRowFormatter }) => {
    const headerRow = createHeaderRow(headers);
    const dataRows = rows.map(row => rowFormatter(headerRow, row));
    const data = [headerRow, ...dataRows];
    const columns = calculateColumnWidths(headers, rows).map(width => ({ width }));

    return { sheet, columns, data };
  });

  const sheetData = results.map(x => x.data);
  const sheetColumns = results.map(x => x.columns);
  const sheetNames = results.map(x => x.sheet);

  return await writeXlsxFile(sheetData, {
    columns: sheetColumns,
    sheets: sheetNames,
  });
};
