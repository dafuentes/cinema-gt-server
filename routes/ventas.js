const expres = require("express");
const router = expres.Router();
const { Venta, Horario, Pelicula, Sala } = require("../models");

router.get("/", async (req, res) => {
  const result = await Pelicula.findAll({
    include: {
      model: Horario,
      include: [
        {
          model: Venta,
        },
        {
          model: Sala,
        },
      ],
    },
  });

  return res.json(result);
});

module.exports = router;
