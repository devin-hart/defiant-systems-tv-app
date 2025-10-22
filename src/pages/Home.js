import Blits from '@lightningjs/blits'

import Button from '../components/Button.js'

const audio = new Audio('../../public/music/04-_.mp3')

export default Blits.Component('Home', {
  components: {
    Button,
  },
  template: `
    <Element w="1920" h="1080" color="#121212">
        <Button w="200" ref="button" textAlign="center" :for="(song, index) in $songs" :x="720" :y="80 * $index" :buttonText="$song" />
    </Element>
  `,
  state() {
    return {
      songs: [
        '01-bronson.mp3',
        '02-freebase.mp3',
        '03-nightstalker.mp3',
        '04-_.mp3',
        '05-junker.mp3',
        '06-killer-by-the-lake.mp3',
        '07-sc-2084.mp3',
      ],
    }
  },
  hooks: {},
  methods: {},
  input: {
    up() {
      // this.index = this.index === 0 ? this.focusable.length - 1 : this.index - 1
      // this.setFocus()
      audio.play()
      console.log('hello world!!!')
    },
    down() {
      // this.index = this.index === this.focusable.length - 1 ? 0 : this.index + 1
      // this.setFocus()
      audio.pause()
      audio.currentTime = 0
      console.log('hell world.')
    },
  },
})
