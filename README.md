# Securin CVE server

This is the backend for the Securin CVE Dashboard, built with Node.js and Express.js. It provides APIs to fetch, store, and manage CVE (Common Vulnerabilities and Exposures) data.

My deployed link: https://securinserver.onrender.com/

## Salient Features

- RESTful APIs to fetch CVE data.
- Pagination support for large datasets.
- Customizable results per page.
- Data storage using MongoDB.
- Environment variable support for secure configurations

## Tech Stack

- Node.js - JavaScript runtime.
- Express.js - Web framework for Node.js.
- MongoDB - NoSQL database.
- Mongoose - ODM for MongoDB.
- dotenv - Environment variable management.
- Jest - JavaScript testing framework.

## Install Packages and Run the App

- Clone the repository

```bash
  git clone https://github.com/YadamVinay369/SecurinServer.git
```

- Install dependencies

```bash
  npm install
```

- Create a `.env` file in the root directory.
- Add the following configuration:

```bash
 PORT=8000
 MONGODB_URI=your_mongodb_connection_string
 CVE_API_URL=https://api.example.com/cve
```

- Run the server

```bash
  npm start
```

- Or for development:

```bash
  npm run dev
```

- Server will run at: http://localhost:8000

## API Reference

#### Get all items

```http
  GET /api/cve
```

![Screenshot of getCVE postman ](./screenshots/getCVE.png)

#### Get all items with page and limit

```http
  GET /api/cve?page=1&limit=10
```

![Screenshot of getCVEbyPageAndLimit postman ](./screenshots/getCVEbyPageAndLimit.png)

#### Get CVE based on `id`

```http
  GET /api/cve/:id
```

| Parameter | Type     | Description                      |
| :-------- | :------- | :------------------------------- |
| `id`      | `string` | **Required**. Id of CVE to fetch |

![Screenshot of getCVEbyID postman ](./screenshots/getCVEbyID.png)

#### Get item based on published `year`

```http
  GET /api/cve/year/:year
```

| Parameter | Type     | Description                         |
| :-------- | :------- | :---------------------------------- |
| `year`    | `string` | **Required**. published year of CVE |

![Screenshot of getCVEbyYear postman ](./screenshots/getCVEbyYear.png)

#### Get item based on `baseScore`

```http
  GET /api/cve/score/:score
```

| Parameter | Type     | Description                    |
| :-------- | :------- | :----------------------------- |
| `score`   | `string` | **Required**. baseScore of CVE |

![Screenshot of getCVEbyBaseScore postman ](./screenshots/getCVEbyBaseScore.png)

#### Get item based on `range`

```http
  GET /api/cve/lastModified/:range
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `range`   | `string` | **Required**. range of values to fetch |

![Screenshot of getCVEbyBaseScore postman ](./screenshots/getCVEbyRange.png)

## Running Tests

- Install Jest (if not already installed):

```bash
  npm install jest --save-dev
```

- Run the tests:

```bash
  npm test
```

- Tests are located in the `__tests__` folder, including:

- Unit tests for `cveController` logic.
- Example: `__tests__/cveController.test.js`

## Dependencies

- express: Fast and minimal web framework.
- mongoose: MongoDB object modeling.
- dotenv: Load environment variables.
- axios: For external API requests.
- jest: JavaScript testing framework for unit testing.
