import { defineConfig } from 'orval';

export default defineConfig({
  fanpulse: {
    input: 'http://localhost:5195/swagger/v1/swagger.json', 
    output: {
      mode: 'split',         
      target: './services/api/generated.ts',
      schemas: './services/api/model',
      client: 'react-query', 
      httpClient: 'axios',
      override: {
        mutator: {
          path: './services/api/axios.ts', 
          name: 'customInstance',
        },
      },
    },
  },
});
