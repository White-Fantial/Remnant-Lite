// Levels index — ordered array of all tutorial level definitions

import { level01 } from './level-01.js';
import { level02 } from './level-02.js';
import { level03 } from './level-03.js';

/**
 * Ordered list of tutorial levels.
 * Add new levels here to extend the sequence.
 *
 * @type {Array<import('./level-01.js').LevelData>}
 */
export const levels = [level01, level02, level03];
