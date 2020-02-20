const checkInputEmpty = (inputTag, alertId) => {
  const inputValue = inputTag.value.trim()
  const alertElement = document.getElementById(alertId)
  if (!inputValue || inputValue === '') {
    alertElement.style.color = 'red'
    alertElement.innerText = 'This field must be not empty'
    window.scrollTo(0, 0)
    inputTag.focus()
    return false
  }
  alertElement.innerText = ''
  return true
}
