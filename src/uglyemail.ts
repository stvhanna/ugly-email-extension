import Gmailjs from '../vendor/gmail-js';
import * as gmail from './utils/dom';
import * as database from './utils/database';
import indexedDB from './services/indexeddb';
import trackers from './services/trackers';
import './services/messenger';

(async () => {
  await Promise.all([
    indexedDB.init(),
    trackers.init(),
  ]);

  const currentVersion = await database.getCurrentVersion();

  if (!currentVersion) { // first time setup
    await database.setup(trackers.version);
  } else if (currentVersion !== trackers.version) {
    await database.upgrade(trackers.version);
    await database.flushUntracked();
  }

  /**
   * Runs every 2500ms
   */
  let timer: any;

  async function observe() {
    clearTimeout(timer);

    if (Gmailjs.check.is_inside_email()) {
      await gmail.checkThread();
    } else {
      await gmail.checkList();
    }

    timer = setTimeout(observe, 2500);
  }

  Gmailjs.observe.on('load', observe);
})();
