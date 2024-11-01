export interface Plot {
  name: string
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
  data: {
    key: string
    value: number
    annotation?: string
  }[]
}
