import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createResturantService, updateResturantService } from '../service/resturant.service';
import { prisma } from '../../prisma/client';

// Mock Prisma
vi.mock('../../prisma/client', () => {
  return {
    prisma: {
      resturants: {
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
    },
  };
});

describe('Restaurant Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createResturantService', () => {
    it('PASSING CASE: should successfully create a restaurant with all fields provided', async () => {
      const mockRestaurant = {
        id: 'rest_123',
        name: 'The Tasty Burger',
        streetAddress: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
        phone: '1234567890',
        email: 'tastyburger@example.com',
        userId: 'user_123',
      };

      vi.mocked(prisma.resturants.create).mockResolvedValue(mockRestaurant as any);

      const result = await createResturantService(
        'user_123',
        'The Tasty Burger',
        '123 Main St',
        'New York',
        'NY',
        'USA',
        '10001',
        '1234567890',
        'tastyburger@example.com',
        'https://facebook.com/tastyburger',
        'https://tiktok.com/@tastyburger',
        'https://instagram.com/tastyburger'
      );

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.message).toBe('Resturant created successfully');
      expect(result.data?.resturant).toEqual(mockRestaurant);
      expect(prisma.resturants.create).toHaveBeenCalled();
    });

    it('FAILING/ERROR CASE: should catch errors and return 500 when database insertion fails', async () => {
      // Mock db insertion failure (e.g. database disconnect or duplicate unique constraint on email)
      vi.mocked(prisma.resturants.create).mockRejectedValue(new Error('Unique constraint failed'));

      const result = await createResturantService(
        'user_123',
        'The Tasty Burger',
        '123 Main St',
        'New York',
        'NY',
        'USA',
        '10001',
        '1234567890',
        'tastyburger@example.com',
        'https://facebook.com/tastyburger',
        'https://tiktok.com/@tastyburger',
        'https://instagram.com/tastyburger'
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
      expect(result.error).toBe('Resturant creation failed');
    });
  });

  describe('updateResturantService', () => {
    it('PASSING CASE: should successfully update the restaurant profile', async () => {
      const updatedRestaurant = {
        id: 'rest_123',
        name: 'The Tasty Burger Updated',
        streetAddress: '456 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
        phone: '1234567890',
        email: 'tastyburger@example.com',
        userId: 'user_123',
      };

      vi.mocked(prisma.resturants.update).mockResolvedValue(updatedRestaurant as any);

      const result = await updateResturantService('user_123', {
        name: 'The Tasty Burger Updated',
        streetAddress: '456 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
        phone: '1234567890',
        email: 'tastyburger@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.code).toBe(200);
      expect(result.message).toBe('Resturant updated successfully');
      expect(result.data?.resturant).toEqual(updatedRestaurant);
    });

    it('FAILING/ERROR CASE: should catch errors and return 500 when update database execution fails', async () => {
      vi.mocked(prisma.resturants.update).mockRejectedValue(new Error('Record not found'));

      const result = await updateResturantService('user_123', {
        name: 'The Tasty Burger Updated',
        streetAddress: '456 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
        phone: '1234567890',
        email: 'tastyburger@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.code).toBe(500);
      expect(result.error).toBe('Resturant update failed');
    });
  });
});
