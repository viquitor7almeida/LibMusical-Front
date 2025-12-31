# Lib Musical Front-end

Single Page Application (SPA) designed for a dynamic and reactive musical catalog management experience.

## Technologies

* **Vue.js 3**
* **TypeScript**
* **Vite**
* **Vue Router**
* **Axios**

## API Integration

The interface interacts with the Spring Boot REST API by consuming JSON resources and managing reactive states.

### Communication Flow

1. **Routing**: Vue Router manages internal navigation such as /musics and /musics/new.
2. **Reactivity**: Music lists and user data are managed using the Vue reactivity system.
3. **Fetching**: Asynchronous Axios calls are triggered during component lifecycles to fetch data from the back-end.
4. 

## Project Structure

* **/src/views**: Main pages of the application (Dashboard, Catalog, Forms).
* **/src/components**: Reusable UI components.
* **/src/router**: Vue Router configuration and route definitions.
* **/src/services**: API abstraction layer for Axios instance and requests.

## Setup and Execution

1. Ensure the Back-end API is running at http://localhost:8080.
2. Install dependencies:
   ```bash
   npm install
