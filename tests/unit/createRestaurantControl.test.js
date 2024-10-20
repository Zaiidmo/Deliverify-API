const { createRestaurant } = require('../../controllers/restaurantController'); 
const { createRestaurantService } = require('../../services/restaurantService');

jest.mock('../../services/restaurantService');

describe('createRestaurant', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { body: { name: 'Test Restaurant', owner: 'ownerId' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test('devrait répondre avec un statut 201 et créer un restaurant', async () => {
    const mockRestaurant = { name: 'Test Restaurant' };
    createRestaurantService.mockResolvedValue(mockRestaurant);

    await createRestaurant(mockReq, mockRes);

    expect(createRestaurantService).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Restaurant créé avec succès',
      restaurant: mockRestaurant,
    });
  });

  test('devrait répondre avec un statut 500 en cas d\'erreur', async () => {
    const error = new Error('Erreur serveur');
    createRestaurantService.mockRejectedValue(error);

    await createRestaurant(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Erreur serveur' });
  });
});
