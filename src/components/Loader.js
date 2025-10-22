import Blits from '@lightningjs/blits'

export default Blits.Component('Loader', {
  template: `
    <Element w="150" height="50" color="black">
      <Text
      content="Hello world!"
      size="20"
      :color="white"
      x="20"
      y="10"
    />
    </Element>
    `,
  hooks: {
    ready() {
      console.log('hello world!')
    },
  },
})
