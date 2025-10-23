import Blits from '@lightningjs/blits'

export default Blits.Component('Button', {
  template: `
    <Element
      w="$width"
      h="$height"
      :color="$hasFocus ? '#121212' : '#000000AA'"
      :effects="[{type: 'radius', props: {radius: $radius}}]"
      y="100" >
        <Text
          :content="$buttonText"
          color="#00CC00"
          lineheight="$height"
          size="$fontSize"
          :x="10"
          :mount="{x: $mountX}"
          maxWidth="100%" />
    </Element>
  `,
  props: ['buttonText', 'song'],
  state() {
    return {
      backgroundColor: '#888',
      fontSize: 14,
      height: 60,
      radius: 0,
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
