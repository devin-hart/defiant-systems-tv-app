import Blits from '@lightningjs/blits'

export default Blits.Component('Button', {
  template: `
    <Element w="$width" h="$height" :color="$hasFocus ? '#fff' : '#888'" :effects="[{type: 'radius', props: {radius: $radius}}]" y="100">
      <Text :content="$buttonText" color="#121212" lineheight="$height" size="$fontSize" :x="$x" :mount="{x: $mountX}" maxWidth="100%" />
    </Element>
  `,
  props: ['buttonText', 'song'],
  state() {
    return {
      backgroundColor: '#888',
      fontSize: 14,
      height: 60,
      radius: 8,
      width: 300,
    }
  },
  computed: {
    mountX() {
      return this.textAlign === 'right' ? 1 : this.textAlign === 'center' ? 0.5 : 0
    },
    x() {
      return this.textAlign === 'right'
        ? this.width - 20
        : this.textAlign === 'center'
          ? this.width / 2
          : 70
    },
  },
})
