const autoBind = require('auto-bind');
const request = require('request-promise');
const fs = require('mz/fs');
const path = require('path');
const moment = require('moment');
const main = require('electron').remote.require('./main');

class Iksm {
  constructor() {
    this.endPoint = 'https://app.splatoon2.nintendo.net';
    this.fetchQueue = [];
    autoBind(this);
  }

  addLog(str) {
    let logElem = document.querySelector('#log');
    logElem.innerText = `${moment().format('hh:mm:ss')} ${str}\n` + logElem.innerText;
  }

  prepareDirectory() {
    let basePath = main.getAppPath();
    let pathname = path.join(basePath, 'results');
    return fs.mkdir(pathname)
    .then(() => Promise.resolve())
    .catch((err) => Promise.resolve());
  }

  startFetchingResults(elem) {
    this.fetchButton = elem;
    elem.innerText = 'Fetching....';
    elem.disabled = 'disabled';
    this.prepareDirectory()
    .then(this.fetch)
    .then(this.gotResultIndex)
    .catch((e) => {
      if (e.statusCode == 403) {
        this.addLog('Authentication failed. Please check your iksm session id is valid.');
      } else {
        this.addLog(e.message);
      }
    });
  }

  saveIksm(iksmSession) {
    localStorage.setItem('iksm_session', iksmSession);
  }

  fetch() {
    const iksmSession = localStorage.getItem('iksm_session');
    this.addLog('Start fetching results');
    console.log(this.endPoint);

    return request({
      url: `${this.endPoint}/api/results`,
      headers: {
        Accept: 'application/json',
        Cookie: `iksm_session=${iksmSession}`
      }
    });
  }

  fetchDetail(battleNumber) {
    const iksmSession = localStorage.getItem('iksm_session');
    this.addLog(`Fetching ${battleNumber}....`);

    return request({
      url: `${this.endPoint}/api/results/${battleNumber}`,
      headers: {
        Accept: 'application/json',
        Cookie: `iksm_session=${iksmSession}`
      }
    });
  }

  gotResultIndex(body) {
    let data = JSON.parse(body);
    this.addLog(`Got result list (record num: ${data.results.length})`);

    for (let i = 0; i < data.results.length; i++) {
      const result = data.results[i];
      const battleNumber = result.battle_number;
      this.fetchQueue.push(battleNumber);
    }

    setTimeout(this.fetchDequeue, 0);
  }

  fetchDequeue() {
    if (this.fetchQueue.length <= 0) {
      this.addLog('Fetch completed.');
      this.fetchButton.innerText = 'Fetch JSONs';
      this.fetchButton.disabled = '';

      return;
    }
    let battleNumber = this.fetchQueue[this.fetchQueue.length - 1];
    this.fetchQueue.pop();

    let pathname = path.join(__dirname, '..', '..', '..', '..', 'results', `${battleNumber}.json`);
    if (fs.existsSync(pathname)) {
      this.addLog(`Battle No.${battleNumber} exists. Skipping.`);
      setTimeout(this.fetchDequeue, 0);
      return;
    }

    this.fetchDetail(battleNumber)
    .then(this.saveDetail)
    .then(() => {
      setTimeout(this.fetchDequeue, 1000);
    });
  }

  saveDetail(body) {
    return new Promise(function(resolve, reject) {
      let data = JSON.parse(body);
      let basePath = main.getAppPath();
      let pathname = path.join(basePath, 'results', `${data.battle_number}.json`);
      fs.writeFileSync(pathname, body, 'utf-8');
      this.addLog(`Saved to "results/${data.battle_number}.json".`);
      resolve();
    }.bind(this));
  }

	sleep(time) {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, time);
		});
	}
};

module.exports = new Iksm();
