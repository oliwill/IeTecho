const statusTone: Record<string, string> = {
  today: 'attention',
  future: 'info',
  overdue: 'warning',
  done: 'done',
  cancelled: 'default'
}

Component({
  properties: {
    reminder: { type: Object, value: {} },
    showActions: { type: Boolean, value: false }
  },
  data: { tone: 'default' },
  observers: {
    reminder(reminder) {
      this.setData({ tone: statusTone[reminder?.status] || 'default' })
    }
  },
  methods: {
    handleDone() {
      this.triggerEvent('done', { reminderId: this.data.reminder.id })
    },
    handleReschedule() {
      this.triggerEvent('reschedule', { reminderId: this.data.reminder.id })
    }
  }
})
