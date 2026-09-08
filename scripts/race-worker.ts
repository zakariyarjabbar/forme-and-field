import { checkout } from '../lib/server/store';
try {
  const result = checkout(process.env.FF_TEST_WS!, JSON.parse(process.env.FF_TEST_INPUT!));
  console.log(result.order ? 'paid' : 'declined');
} catch {
  console.log('rejected');
}
