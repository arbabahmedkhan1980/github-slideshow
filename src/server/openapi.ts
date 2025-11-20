export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "UniQube Pod Estimator API",
    version: "0.1.0"
  },
  servers: [{ url: "http://localhost:3000/api" }],
  paths: {
    "/projects": {
      get: {
        summary: "List projects",
        responses: {
          "200": { description: "Projects returned" }
        }
      },
      post: {
        summary: "Create project",
        requestBody: { required: true },
        responses: {
          "201": { description: "Project created" }
        }
      }
    },
    "/projects/{projectId}": {
      get: { summary: "Get project", responses: { "200": { description: "OK" } } },
      put: { summary: "Update project", responses: { "200": { description: "Updated" } } }
    },
    "/projects/{projectId}/floors": {
      get: { summary: "List floors", responses: { "200": { description: "OK" } } },
      post: { summary: "Create floor", responses: { "201": { description: "Created" } } }
    },
    "/floors/{floorId}/uploads": {
      post: { summary: "Upload floor plan", responses: { "200": { description: "Uploaded" } } }
    },
    "/projects/{projectId}/bathrooms": {
      get: { summary: "List bathrooms", responses: { "200": { description: "OK" } } },
      post: { summary: "Create bathrooms", responses: { "201": { description: "Created" } } }
    },
    "/projects/{projectId}/bathroom-types/group": {
      post: { summary: "Group bathrooms into types", responses: { "200": { description: "Grouped" } } }
    },
    "/bathroom-types/{bathroomTypeId}/spec": {
      get: { summary: "Get spec", responses: { "200": { description: "OK" } } },
      put: { summary: "Upsert spec", responses: { "200": { description: "Saved" } } }
    },
    "/bathroom-types/{bathroomTypeId}/cost": {
      post: { summary: "Calculate cost", responses: { "200": { description: "OK" } } }
    },
    "/projects/{projectId}/proposal": {
      post: { summary: "Generate proposal PDF", responses: { "200": { description: "PDF" } } }
    },
    "/rate-profiles": {
      get: { summary: "List rate profiles", responses: { "200": { description: "OK" } } },
      post: { summary: "Create rate profile", responses: { "201": { description: "Created" } } }
    }
  }
};
