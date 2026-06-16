import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

describe('uploads contract', () => {
  const contractPath = join(__dirname, '../../../../specs/002-services-blog-content/contracts/services-blog-content.openapi.yaml');
  const contractDocument = parse(readFileSync(contractPath, 'utf8'));

  it('documents multipart content image uploads', () => {
    const uploadOperation = contractDocument.paths['/admin/uploads'].post;

    expect(uploadOperation.security).toEqual([{ bearerAuth: [] }]);
    expect(uploadOperation.requestBody.content['multipart/form-data']).toBeDefined();
    expect(contractDocument.components.schemas.UploadedFile.required).toEqual([
      'id',
      'filename',
      'originalName',
      'publicUrl',
      'mimeType',
      'sizeBytes',
      'purpose',
      'createdAt',
    ]);
  });
});
