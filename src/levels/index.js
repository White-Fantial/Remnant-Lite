// Levels index — ordered array of all tutorial level definitions

import { level01 } from './level-01.js';
import { level02 } from './level-02.js';
import { level03 } from './level-03.js';
import { level04 } from './level-04.js';
import { level05 } from './level-05.js';
import { level06 } from './level-06.js';
import { level07 } from './level-07.js';
import { level08 } from './level-08.js';
import { level09 } from './level-09.js';
import { level10 } from './level-10.js';

/**
 * Ordered list of tutorial levels.
 * Add new levels here to extend the sequence.
 *
 * @type {Array<import('./level-01.js').LevelData>}
 */
export const levels = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10];
