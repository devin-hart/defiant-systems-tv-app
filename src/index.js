import Blits from '@lightningjs/blits'
import App from './App.js'

Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  debugLevel: 1,
  inspector: true,
  defaultFont: 'opensans',
  fonts: [
    {
      family: 'opensans',
      type: 'web',
      file: 'fonts/OpenSans-Medium.ttf',
    },
  ],
})
