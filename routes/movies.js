const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { Pelicula, Horario, Sala, Sucursal } = require("../models/index");
const { Op } = require("sequelize");

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

  /* const { id } = req.params;

  const movie = await Pelicula.findOne({
    where: { id },
    include: {
      model: Horario,
      include: {
        model: Sala,
        include: {
          model: Sucursal,
        },
      },
      required: true,
    },
  });

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
 */
  /*   const getSucursales = movie
    .get()
    .Horarios.map((itemHorario) => itemHorario.Sala.Sucursal.name); */

  /* const set = new Set();
  movie.get().Horarios.forEach((item) => {
    set.add(item.Sala.Sucursal.name);
  }); */

  const getSucursales = [
    ...new Set(movie.get().Horarios.map((item) => item.Sala.Sucursal.name)),
  ];

  const getHorarios = getSucursales.map((currentSucursal) => {
    const infoSucursal = { name: currentSucursal };
    const horarios = movie.get().Horarios.map((itemHorario) => {
      if (itemHorario.Sala.Sucursal == currentSucursal) {
        return {
          sala: {
            name: itemHorario.Sala.name,
            description: itemHorario.Sala.description,
            horario: {
              start: itemHorario.startTime,
              end: itemHorario.endTime,
            },
          },
        };
      }
    });
    infoSucursal.horarios = horarios;
    return infoSucursal;
  });

  /* const resultSucursales = [];
  const infoSucursales = movie.get().horarios.forEach((itemHorario)=>{
    const sucursal = { };
    sucursal[itemHorario.Sala.Sucursal.name] = {
      ...itemHorario.Sala.Sucursal,

    }


  }); */

  return res.json({
    ...movie.get(),
    genres: infoMovie.genres,
    overview: infoMovie.overview,
    sucursales: getSucursales,
    horariost: getHorarios,
  });
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

module.exports = router;
