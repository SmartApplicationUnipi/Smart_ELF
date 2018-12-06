# KB Analytics

Express.js-based application to quickly access logs and documentation of the data stored in the Knowledge Base.

## Dependencies

[Node.is](https://nodejs.org/) needs to be installed on the system to run the application.

To install all the requred dependencies, run the following from the root of the project:

```bash
npm install
```

## Running

To run the HTTP server just issue:

```bash
npm start
```

By default, logging is disabled. To enable logging, use the environment variable `DEBUG`:

```bash
DEBUG=kb-analytics:* npm start
```
