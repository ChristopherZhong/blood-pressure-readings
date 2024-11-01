/**
 * The configuration.
 *
 * @typedef {Object} Config
 * @property {Object} columns The indices of the columns.
 * @property {number} columns.date - The index of the date-time column.
 * @property {number[]} columns.toWatch - The indices of the columns to watch for edits.
 * @property {Object} sheet The sheet to watch.
 * @property {string} sheet.name - The name of the sheet to watch.
 */
/**
 * @typedef {Object} CheckResult
 * @property {GoogleAppsScript.Spreadsheet.Range} cell The date-time cell.
 * @property {GoogleAppsScript.Spreadsheet.Sheet} sheet The active sheet.
 */

/** The configuration. */
type Config = {
  /** The indices of the columns */
  readonly columns: {
    /** The index of the date-time column. */
    readonly date: number;
    /** The indices of the columns to watch for edits. */
    readonly toWatch: ReadonlyArray<number>;
  };
  /** Insert a new row at the given position. */
  readonly insertRowAt: 'first' | 'last';
  /** The sheet to watch. */
  readonly sheet: {
    /** The name of the sheet to watch. */
    readonly name: string;
  };
};

/**
 * Retrieve the configuration.
 *
 * @returns {Config} The configuration.
 */
function getConfig(): Config {
  return {
    columns: {
      date: 1, // the column to set the date and time. E.g., the first column
      toWatch: [2, 3, 4], // the columns to watch for edits. E.g., second column is systolic, third column is diastolic, and fourth column is pulse.
    },
    insertRowAt: 'first',
    sheet: {
      name: 'Readings', // the name of the sheet that contains the blood pressure readings
    },
  };
}

/**
 * The event handler triggered when editing the spreadsheet.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} event The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onEdit(event: GoogleAppsScript.Events.SheetsOnEdit) {
  Logger.log(`Processing onEdit ...`);
  Logger.log(`Event: ${JSON.stringify(event)}`);
  const config = getConfig();
  Logger.log(`Config: ${JSON.stringify(config)}`);
  const result = check(event, config);
  if (result) {
    const { cell, sheet } = result;
    insertDateTime(cell);
    addNewRow(cell, sheet, config);
  }
}

type CheckResult = {
  readonly cell: GoogleAppsScript.Spreadsheet.Range;
  readonly sheet: GoogleAppsScript.Spreadsheet.Sheet;
};

/**
 * Check if the event met the conditions and return the result or `false`
 * if the conditions are not met.
 *
 * @param {GoogleAppsScript.Events.SheetsOnEdit} event The onEdit event.
 * @param {Config} config The configuration.
 * @returns The result of the check or `false`.
 */
function check(
  event: GoogleAppsScript.Events.SheetsOnEdit,
  config: Config,
): CheckResult | false {
  const sheet = event.source.getActiveSheet();
  Logger.log(`Sheet: name=${sheet.getName()}`);
  if (sheet.getName() === config.sheet.name) {
    const cell = event.range;
    Logger.log(`Cell: column=${cell.getColumn()}, row=${cell.getRow()}`);
    if (config.columns.toWatch.includes(cell.getColumn())) {
      const dateCell = sheet.getRange(cell.getRow(), config.columns.date);
      if (dateCell.isBlank()) {
        const hasBlanks = config.columns.toWatch.some((column) => {
          return sheet.getRange(dateCell.getRow(), column).isBlank();
        });
        if (hasBlanks) {
          Logger.log(
            'Not doing anything since some of the cells are still blank!',
          );
        } else {
          return { cell: dateCell, sheet };
        }
      } else {
        Logger.log('Not doing anything since date and time are already set!');
      }
    } else {
      Logger.log('Not doing anything since it is not the right column!');
    }
  } else {
    Logger.log('Not doing anything since it is not the right sheet!');
  }
  return false;
}

function insertDateTime(cell: GoogleAppsScript.Spreadsheet.Range) {
  const date = new Date();
  Logger.log(`Setting the date and time: ${date}`);
  cell.setValue(date);
}

function addNewRow(
  cell: GoogleAppsScript.Spreadsheet.Range,
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  config: Config,
) {
  const row = config.insertRowAt === 'first' ? 1 : sheet.getLastRow();
  // assuming that the first row is the header, then the cell row should be 2
  if (cell.getRow() === (config.insertRowAt === 'first' ? row + 1 : row)) {
    Logger.log(
      `Cell is the ${config.insertRowAt} row, inserting a new row: cell.row=${cell.getRow()}, sheet.lastRow=${sheet.getLastRow()}`,
    );
    sheet.insertRowAfter(row);
  }
}
