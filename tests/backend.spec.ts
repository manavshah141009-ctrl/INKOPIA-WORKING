import { test, expect } from '@playwright/test';

const API_URL = 'http://127.0.0.1:5000/api';

test.describe('Backend Dynamic Schema API', () => {
  
  test('should fetch all schemas', async ({ request }) => {
    const response = await request.get(`${API_URL}/schemas`);
    expect(response.ok()).toBeTruthy();
    const schemas = await response.json();
    expect(Array.isArray(schemas)).toBeTruthy();
  });

  test('should create and delete a test schema', async ({ request }) => {
    // 1. Create a schema
    const uniqueName = `test_collection_${Date.now()}`;
    const newSchema = {
      collectionName: uniqueName,
      displayName: 'Test Collection',
      fields: [
        { name: 'test_field', label: 'Test Field', type: 'text', required: true }
      ]
    };

    const createResponse = await request.post(`${API_URL}/schemas`, {
      data: newSchema
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const created = await createResponse.json();
    expect(created.collectionName).toBe(uniqueName);
    const schemaId = created._id;

    // 2. Delete the schema
    const deleteResponse = await request.delete(`${API_URL}/schemas/${schemaId}`);
    expect(deleteResponse.ok()).toBeTruthy();
  });

  test('should handle file uploads', async ({ request }) => {
    // Note: This requires a sample file to upload
    // For now, we just check if the endpoint exists and returns 400 if no file is sent
    const response = await request.post(`${API_URL}/upload`);
    expect(response.status()).toBe(400);
  });
});
