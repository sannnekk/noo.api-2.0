/* eslint-disable */
/**
 * Script to check if the version in config is the same as the one in package.json
 * and that the changelog contains an entry for the current version.
 */
import fs from 'fs'

const changelogPath = './changelog.json'
const configPath = './src/config.ts'
const packagePath = './package.json'

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
const changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'))
const config = fs.readFileSync(configPath, 'utf-8')

// check if the version in config is the same as the one in package.json
if (!config.includes(packageJson.version)) {
  console.error(
    '❌ The version in config.ts does not match the one in package.json'
  )
  process.exit(1)
}

// check if the changelog contains an entry for the current version
if (!changelog.find((entry) => entry.version === packageJson.version)) {
  console.error(
    '❌ The changelog does not contain an entry for the current version'
  )
  process.exit(1)
}

console.log('✅ Version check passed')
process.exit(0)
