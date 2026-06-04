import type { CreateVehicleInput } from "../schemas/vehicle-schemas.js";

export const seedVehicles: CreateVehicleInput[] = [
  {
    plate: "BRA1A23",
    brand: "Volkswagen",
    model: "Gol",
    year: 2020,
    color: "Prata"
  },
  {
    plate: "QWE1234",
    brand: "Fiat",
    model: "Uno",
    year: 2018,
    color: "Branco"
  },
  {
    plate: "RIO2B45",
    brand: "Chevrolet",
    model: "Onix",
    year: 2022,
    color: "Preto"
  },
  {
    plate: "XYZ9C87",
    brand: "Toyota",
    model: "Corolla",
    year: 2021,
    color: "Cinza"
  },
  {
    plate: "ABC4D56",
    brand: "Honda",
    model: "Civic",
    year: 2019,
    color: "Azul"
  }
];
