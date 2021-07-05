const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')

async function loadEnvironmentVariables() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const projectNumber = ''
  const secretsClient = new SecretManagerServiceClient()

  const secretNames = [
    'DB_PASSWORD',
    'JWT_SECRET'
  ]

  await loadSecrets(secretsClient, projectNumber, secretNames)
}

async function loadSecrets (secretsClient, projectNumber, secretNames) {
  await Promise.all(secretNames.map(async name => {
    if (process.env[name]) {
      return
    }

    try {
      const path = `projects/${projectNumber}/secrets/${name}/versions/latest`
      const [version] = await secretsClient.accessSecretVersion({
        name: path,
      })

      process.env[name] = version.payload.data.toString()
    } catch (e) {
      console.log(`Failed to load configuration value: ${name}`, e)
    }
  }))
}

module.exports = {
  loadEnvironmentVariables
}
