import { ExecutionContext } from '@nestjs/common';
import { CallHandler } from '@nestjs/common/interfaces';
import { firstValueFrom, of } from 'rxjs';

import { ResponseInterceptor } from '../../../src/common/interceptors/response.interceptor';

describe('ResponseInterceptor', () => {
  it('wraps controller payloads in the standard success envelope', async () => {
    const interceptor = new ResponseInterceptor();
    const callHandler: CallHandler = {
      handle: () => of({ message: 'Health status retrieved', payload: { api: 'ok' } }),
    };

    await expect(
      firstValueFrom(interceptor.intercept({} as ExecutionContext, callHandler)),
    ).resolves.toEqual({
      success: true,
      message: 'Health status retrieved',
      data: { api: 'ok' },
    });
  });
});
