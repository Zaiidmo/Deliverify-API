const request = require("supertest");
const express = require("express");
const { search } = require("../../controllers/searchController"); 
const Restaurant = require("../../models/Restaurant"); 
const Item = require("../../models/Item"); 

// Create a new Express app for testing
const app = express();
app.get("/search/search", search); 

// Mock the Restaurant and Item models
jest.mock("../../models/Restaurant");
jest.mock("../../models/Item");

describe("Search Functionality", () => {
  afterEach(() => {
    jest.clearAllMocks(); 
  });

  it("should return 400 if no query is provided", async () => {
    const response = await request(app).get("/search/search"); 
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please provide a search query");
  });

  it("should return results for restaurants and items", async () => {
    const query = "Pizza";
    const mockRestaurants = [{ name: "Pizza Hut" }, { name: "Pizza Express" }];
    const mockItems = [
      { name: "Margherita Pizza" },
      { name: "Pepperoni Pizza" },
    ];

    // Mock the database calls to return predefined values
    Restaurant.find.mockResolvedValue(mockRestaurants);
    Item.find.mockResolvedValue(mockItems);

    const response = await request(app).get(`/search/search?query=${query}`);
    expect(response.status).toBe(200);
    expect(response.body.totalRestaurants).toBe(mockRestaurants.length);
    expect(response.body.totalItems).toBe(mockItems.length);
    expect(response.body.restaurants).toEqual(mockRestaurants);
    expect(response.body.items).toEqual(mockItems);
  });

  it("should handle server errors gracefully", async () => {
    const query = "Burger";

    // Mock the database calls to throw an error
    Restaurant.find.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get(`/search/search?query=${query}`);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Database error");
  });
});
