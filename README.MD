# Only work with NodeJS v14.21.3

## Migrate database

```
node .\migrate-database\ -h        
Usage:
  node migrate-database [OPTION]

Options:
  -i, --input-file=ARG input filename in folder sql_files, default is sample.json
  -p, --db-prefix=ARG  database prefix, default is wi0000_
  -d, --delay=ARG      delay between each query, default is 1000ms
      --v              verbose mode
  -h, --help           display this help
```

### Step 1: update .env file sample from .env.sample
### Step 2: add file to migrate-database/sql_files