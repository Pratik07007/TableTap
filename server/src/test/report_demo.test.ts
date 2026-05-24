import { describe, it, expect } from 'vitest';

describe('TableTap Backend - Demo Test Suite for Report', () => {
  // A clean, passing unit test
  it('SUCCESS CASE: mathematical operations on pricing should be accurate', () => {
    const basePrice = 12.99;
    const quantity = 3;
    const expectedTotal = 38.97;

    const actualTotal = Number((basePrice * quantity).toFixed(2));
    expect(actualTotal).toBe(expectedTotal);
  });

  // An intentionally failing unit test for report demonstration purposes
  it('FAILURE CASE: simulated verification error (designed to fail for report screenshot)', () => {
    const isTokenVerified = false;

    // This assertion will fail to demonstrate the test runner's failure output in the report.
    // It asserts that the unverified token is true, causing a failure.
    expect(isTokenVerified).toBe(true);
  });
});
