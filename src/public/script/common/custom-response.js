const ClientResponse = {
  successToast (title, message) {
    const titleElement = document.getElementById('toastSuccessTitle')
    const messageElement = document.getElementById('toastSuccessMessage')

    /** Add title & message */
    titleElement.innerText = title
    messageElement.innerText = message

    /** Show toast */
    $('#toastSuccess').toast('show')
  },

  errorToast (title, message) {
    const titleElement = document.getElementById('toastErrorTitle')
    const messageElement = document.getElementById('toastErrorMessage')

    /** Add title & message */
    titleElement.innerText = title
    messageElement.innerText = message

    /** Show toast */
    $('#toastError').toast('show')
  }
}
