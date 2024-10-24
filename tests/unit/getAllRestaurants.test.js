const restaurantService = require('../../services/restaurantService');
const Restaurant = require('../../models/Restaurant');

// Mock du modèle Restaurant pour Jest
jest.mock('../../models/Restaurant');

describe("Restaurant Service - getAllRestaurants", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Nettoyer les mocks après chaque test
  });

  it("devrait retourner tous les restaurants avec logo, cover et images", async () => {
    // Mock des données de restaurants à renvoyer
    const mockRestaurants = [
      {
        _id: "1",
        name: "Restaurant 1",
        address: "Address 1",
        phoneNumber: "1122334455",
        logo: "logo1.jpg",
        cover: "cover1.jpg",
        images: ["image1.jpg", "image2.jpg"],
        category: { name: "Fast Food" },
        openAt: "08:00",
        closeAt: "22:00",
      },
      {
        _id: "2",
        name: "Restaurant 2",
        address: "Address 2",
        phoneNumber: "2233445566",
        logo: "",  // Pas de logo fourni
        cover: "",  // Pas de cover fourni
        images: [], // Pas d'images fournies
        category: { name: "Italian" },
        openAt: "10:00",
        closeAt: "23:00",
      },
    ];

    // Simuler la fonction Restaurant.find() pour renvoyer les restaurants mockés
    Restaurant.find.mockResolvedValue(mockRestaurants);

    // Appeler la fonction à tester
    const restaurants = await restaurantService.getAllRestaurants();

    // Vérifier que Restaurant.find a bien été appelé
    expect(Restaurant.find).toHaveBeenCalledTimes(1);

    // Vérifier que le premier restaurant conserve ses logo, cover, et images
    expect(restaurants[0].logo).toEqual("logo1.jpg");
    expect(restaurants[0].cover).toEqual("cover1.jpg");
    expect(restaurants[0].images).toEqual(["image1.jpg", "image2.jpg"]);

    // Vérifier que le second restaurant a des valeurs par défaut pour logo, cover, et images
    expect(restaurants[1].images).toEqual([]);
  });

  it("devrait gérer une erreur si la récupération échoue", async () => {
    // Simuler une erreur avec Restaurant.find()
    Restaurant.find.mockRejectedValue(new Error("Erreur lors de la récupération des restaurants"));

    await expect(restaurantService.getAllRestaurants()).rejects.toThrow(
      "Erreur lors de la récupération des restaurants"
    );

    // Vérifier que Restaurant.find a bien été appelé
    expect(Restaurant.find).toHaveBeenCalledTimes(1);
  });
});
