Component({
  properties: {
    variant: {
      type: String,
      value: 'primary'
    }
  },
  methods: {
    handleTap() {
      this.triggerEvent('tapbutton')
    }
  }
})
