const catchAsync = require('../utils/catchAsync');
const mercadopago = require('mercadopago');

exports.mercadopago = catchAsync(async (req, res, next) => {
  mercadopago.configure({
    access_token:
      'APP_USR-6623451607855904-111502-1f258ab308efb0fb26345a2912a3cfa5-672708410',
  });
  let preference = {
    items: req.body.data,
  };

  const response = await mercadopago.preferences.create(preference);
  res.status(200).json({
    status: 'success',

    data: {
      response,
    },
  });
});
