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

const handlePasteImageToTextarea = async e => {
  try {
    /** Only work with image by check type of clipboard */
    if (
      e.clipboardData &&
      e.clipboardData.items &&
      e.clipboardData.types.indexOf('Files') !== -1
    ) {
      let form
      const items = e.clipboardData.items
      /** Get markdown content to append new link back to textarea */
      let markdownContent = editor.value

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          let file = items[i].getAsFile()
          form = new FormData()
          form.append('blog-img', file)
        }
      }

      /** When paste image is processing */
      editor.disabled = true
      editor.value = `${markdownContent}\nSaving an image, please wait...`

      const myAxios = new MyAxios()
      const result = await myAxios.fetch({
        url: `${DEFAULT_URL}/blog-images`,
        method: 'POST',
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const { data } = result
      const { imgPath } = data.data
      editor.disabled = false
      editor.value = `${markdownContent}\n![Alt text](${imgPath})`
    }
  } catch (error) {
    if (error.response) {
      const { data } = error.response
      const { message } = data
      ClientResponse.errorToast('Save file error', message)
    } else {
      console.log('====> error', error)
      ClientResponse.errorToast('Save file error', 'Server error')
    }
  }
}
