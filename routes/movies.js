const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { Pelicula, Horario, Sala, Sucursal, Venta } = require("../models/index");
const { Op, where, fn, col } = require("sequelize");

router.get("/get-movies", async (req, res) => {
  const url =
    "https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYTU5M2RjOTdkNDBjNDkyZmZiMzJlYzQ5MmM3ZWQwMSIsInN1YiI6IjY0ZDlhYjIzMzcxMDk3MDEzOTQ1NzU4YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hH_GqTZsjw6q2owfSNN1TqWfZ_0f60w4z-Ni3jF798c",
    },
  };
  const response = await fetch(url, options);
  const data = await response.json();

  res.json(data);
});

router.get("/", async (req, res) => {
  const getAllMovies = await Pelicula.findAll({
    where: {
      active: true,
    },
    include: {
      model: Horario,
      required: true,
    },
  });
  return res.json(getAllMovies);
});

router.post("/", async (req, res) => {
  const { movieId, title, image, price, startDate, endDate } = req.body;
  await Pelicula.create({
    movieId,
    title,
    image,
    price,
    startDate,
    endDate,
  });
  return res.json({ status: "success" });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const movie = await Pelicula.findOne({
    where: { id },
  });
  if (movie) {
    const url = `https://api.themoviedb.org/3/movie/${movie.movieId}?language=en-US`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYTU5M2RjOTdkNDBjNDkyZmZiMzJlYzQ5MmM3ZWQwMSIsInN1YiI6IjY0ZDlhYjIzMzcxMDk3MDEzOTQ1NzU4YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hH_GqTZsjw6q2owfSNN1TqWfZ_0f60w4z-Ni3jF798c",
      },
    };

    const response = await fetch(url, options);
    const infoMovie = await response.json();

    return res.json({
      ...movie.get(),
      genres: infoMovie.genres,
      overview: infoMovie.overview,
      release_date: infoMovie.release_date,
    });
  } else {
    return res.status(404).json("Movie doesn't exist");
  }
});

router.get("/:id/:selected_date", async (req, res) => {
  const { id, selected_date } = req.params;

  const movie = await Pelicula.findOne({
    where: [
      { id },
      { startDate: { [Op.lte]: selected_date } },
      { endDate: { [Op.gte]: selected_date } },
    ],
  });
  if (movie) {
    const sucursales = await Sucursal.findAll({
      include: {
        model: Sala,
        include: {
          model: Horario,
          include: {
            model: Pelicula,
            where: {
              id,
            },
            required: true,
          },
          required: true,
        },
        required: true,
      },
    });
    return res.json({ status: "success", data: sucursales });
  } else {
    return res.json({
      status: "success",
      data: [],
      message: "No functions available",
    });
  }
});

router.post("/:id/compra", (req, res) => {
  try {
    const { horario_id, seats, date_movie } = req.body;
    seats.forEach(async (item) => {
      await Venta.create({
        horarioId: horario_id,
        seat: item,
        dateMovie: date_movie,
        dateSale: new Date(),
      });
    });
    setTimeout(() => {
      return res.json({ status: "success" });
    }, 2000);
  } catch (e) {
    return res.json({ status: "error", message: e });
  }
});

router.get(
  "/:id/asientos-ocupados/:selected_date/horario/:horario",
  async (req, res) => {
    const { id, selected_date, horario } = req.params;
    console.log("selected_date", selected_date);
    const listVentas = await Venta.findAll({
      attributes: ["seat"],
      where: where(fn("date", col("dateMovie")), "=", selected_date),
      include: {
        model: Horario,
        where: {
          id: horario,
          idPelicula: id,
        },
      },
    });

    const ocupados = listVentas.map((item) => item.seat);

    return res.json({ ocupados });
  }
);

module.exports = router;
