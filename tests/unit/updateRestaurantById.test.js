const restaurantService = require('../../services/restaurantService');
const Restaurant = require('../../models/Restaurant');

jest.mock('../../models/Restaurant');

describe("Restaurant Service - updateRestaurantById", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait mettre à jour un restaurant avec les nouvelles données", async () => {
    // Mock du restaurant existant
    const mockRestaurant = {
      _id: "1",
      name: "Restaurant 1",
      address: "Address 1",
      phoneNumber: "1122334455",
      logo: "logo1.jpg",
      cover: "cover1.jpg",
      images: ["image1.jpg", "image2.jpg"],
      openAt: "08:00",
      closeAt: "22:00",
      category: { name: "Fast Food" },
      save: jest.fn().mockResolvedValue(this),
    };

    // Mock de Restaurant.findById pour renvoyer le restaurant existant
    Restaurant.findById.mockResolvedValue(mockRestaurant);

    const updateData = {
      name: "Updated Restaurant",
      address: "Updated Address",
      phoneNumber: "1234567890",
      logo: "updated-logo.jpg",
      cover: "updated-cover.jpg",
      images: ["updated-image1.jpg"],
    };

    const updatedRestaurant = await restaurantService.updateRestaurantById("1", updateData);

    // Vérifier que les champs ont bien été mis à jour
    expect(updatedRestaurant.name).toEqual("Updated Restaurant");
    expect(updatedRestaurant.address).toEqual("Updated Address");
    expect(updatedRestaurant.phoneNumber).toEqual("1234567890");
    expect(updatedRestaurant.logo).toEqual("updated-logo.jpg");
    expect(updatedRestaurant.cover).toEqual("updated-cover.jpg");
    expect(updatedRestaurant.images).toEqual(["updated-image1.jpg"]);

    // Vérifier que la méthode save a bien été appelée
    expect(mockRestaurant.save).toHaveBeenCalled();
  });

  it("devrait retourner une erreur si le restaurant n'existe pas", async () => {
    // Simuler un cas où le restaurant n'est pas trouvé
    Restaurant.findById.mockResolvedValue(null);

    await expect(restaurantService.updateRestaurantById("non_existing_id", {})).rejects.toThrow(
      "Restaurant non trouvé"
    );

    // Vérifier que Restaurant.findById a bien été appelé
    expect(Restaurant.findById).toHaveBeenCalledWith("non_existing_id");
  });

  it("devrait gérer une erreur lors de la mise à jour du restaurant", async () => {
    // Simuler une erreur avec Restaurant.findById()
    Restaurant.findById.mockRejectedValue(new Error("Erreur lors de la mise à jour du restaurant"));

    await expect(restaurantService.updateRestaurantById("1", {})).rejects.toThrow(
      "Erreur lors de la mise à jour du restaurant"
    );

    // Vérifier que Restaurant.findById a bien été appelé
    expect(Restaurant.findById).toHaveBeenCalledWith("1");
  });
});
