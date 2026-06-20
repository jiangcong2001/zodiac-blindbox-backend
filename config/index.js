module.exports = {
  APP_ID: process.env.WX_APP_ID || 'wx0000000000000000',
  APP_SECRET: process.env.WX_APP_SECRET || 'your_app_secret_here',
  MCH_ID: process.env.WX_MCH_ID || '',
  PAY_API_KEY: process.env.WX_PAY_KEY || '',
  ADMIN_OPENIDS: (process.env.ADMIN_OPENIDS || '').split(',').filter(Boolean),
  PORT: process.env.PORT || 3001
};
