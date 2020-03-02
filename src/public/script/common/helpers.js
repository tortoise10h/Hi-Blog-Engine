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

const parseBlogTagsValueToArray = blogTagsValue => {
  let blogTagsArray = blogTagsValue.split(',')

  /** Blank space element will be remove and trim all valid tag to make sure there is no space in tag*/
  blogTagsArray = blogTagsArray
    .filter(tag => {
      return /\w+/.test(tag)
    })
    .map(tag => tag.trim())

  return blogTagsArray
}

const parseEmoji = s => {
  return s.replace(/\ \:\b([a-z]+)\b\:/g, " <i class='em em-$1'></i>")
}
