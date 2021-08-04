const { CloudTasksClient } = require('@google-cloud/tasks');
const client = new CloudTasksClient();

module.exports = {
  createTask: async function (uri, queue, inSeconds, payload) {
    const parent = client.queuePath('apeseasons', 'europe-west3', queue);
    const task = {
      appEngineHttpRequest: {
        httpMethod: 'POST',
        relativeUri: uri,
        headers: { 'Content-Type': 'application/json' }
      },
    };

    if (payload) {
      task.appEngineHttpRequest.body = Buffer.from(JSON.stringify(payload));
    }

    task.scheduleTime = {
      seconds: inSeconds + Date.now() / 1000,
    }

    const [response] = await client.createTask({ parent, task })
    return response
  }
}