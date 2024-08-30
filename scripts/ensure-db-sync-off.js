import fs from 'fs'

const dataSourcePath = './src/Core/Data/DataSource.ts'

const dataSource = fs.readFileSync(dataSourcePath, 'utf-8')

if (dataSource.includes('synchronize: true')) {
  console.error(
    '❌ The database sync is enabled. Please disable it before sending to production'
  )
  process.exit(1)
}

console.log('✅ Database sync is off')
process.exit(0)
