window.onload = () => {
  let fileName
  let category

  let editor = document.getElementById('editor')
  const markdownArea = document.getElementById('markdown')

  const convertTextToMarkdown = () => {
    let markdownText = editor.value
    const htmlContent = converter.render(markdownText)
    markdownArea.innerHTML = htmlContent
  }

  /** Event listener for everytime editor text in editor zone */
  editor.addEventListener('input', convertTextToMarkdown)

  /** Run everytime first enter page */
  convertTextToMarkdown()
}

/** Get elements */
const saveBlogButton = document.getElementById('saveBlogBtn')
const infoSavePopupBackground = document.getElementById(
  'infoSavePopupBackground'
)
const infoSavePopupCloseBtn = document.getElementById('infoSavePopupClose')
const confirmSaveBtn = document.getElementById('confirmSaveBtn')

/** ===== When press save button ===== */
saveBlogButton.addEventListener('click', () => {
  const infoSavePopup = document.getElementById('infoSavePopup')
  const blogTitleInput = document.getElementById('blogTitle')
  const blogTagsInput = document.getElementById('blogTags')

  /** Make sure all input fields already have data */
  if (
    !checkInputEmpty(blogTitleInput, 'blogTitleAlert') ||
    !checkInputEmpty(blogTagsInput, 'blogTagsAlert')
  ) {
    return
  }

  infoSavePopup.classList.toggle('show-info-save-popup')
  infoSavePopupBackground.style.display = 'block'
})

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
/** When press outside save info pop then close popup */
// infoSavePopupBackground.addEventListener('click', () => {
// const infoSavePopup = document.getElementById('infoSavePopup')

// infoSavePopup.classList.remove('show-info-save-popup')
// infoSavePopupBackground.style.display = 'none'
// })

/** When press close button of save popup */
const closeSavePopup = () => {
  const infoSavePopup = document.getElementById('infoSavePopup')

  infoSavePopup.classList.remove('show-info-save-popup')
  infoSavePopupBackground.style.display = 'none'
}

infoSavePopupCloseBtn.addEventListener('click', closeSavePopup)

/** When press confirm save */
confirmSaveBtn.addEventListener('click', async () => {
  try {
    const editor = document.getElementById('editor')
    const newFileNameBox = document.getElementById('newFileName')
    const fileNameAlertBox = document.getElementById('fileNameAlert')
    const blogTitleInput = document.getElementById('blogTitle')
    const blogDateInput = document.getElementById('blogDate')
    const blogTagsInput = document.getElementById('blogTags')
    const blogPublishModeSelect = document.getElementById('publishModeSelect')

    const newFileName = newFileNameBox.value
    const markdownContent = editor.value
    const htmlContent = converter.render(markdownContent)
    const blogTitle = blogTitleInput.value
    const blogDate = blogDateInput.value || new Date()
    const blogTags = blogTagsInput.value
    const blogPublishMode = blogPublishModeSelect.value
    const blogTagsArray = parseBlogTagsValueToArray(blogTags)

    /** Check file name */
    const [isFileValid, alertType, alertMessage] = checkFileName(newFileName)
    if (!isFileValid) {
      fileNameAlertBox.style.color = alertType === 'error' ? 'red' : 'orange'
      fileNameAlertBox.innerText = alertMessage
      return
    }

    /** Request to server to save files */
    const myAxios = new MyAxios()
    const result = await myAxios.fetch({
      url: `${DEFAULT_URL}/blogs`,
      method: 'POST',
      data: {
        newFileName,
        markdownContent,
        htmlContent,
        blogTitle,
        blogTagsArray,
        blogDate,
        blogPublishMode
      }
    })
    /** Response to user */
    const { data } = result
    const { message } = data

    ClientResponse.successToast('Save file successfully', message)
    window.location.href = `${DEFAULT_URL}`
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
})

const checkFileName = fileName => {
  /** Check file name empty */
  if (!fileName || fileName === '') {
    return [false, 'error', 'File name must not be empty']
  }

  if (!/^[\w,\s-]{1,255}$/.test(fileName)) {
    return [
      false,
      'error',
      'Your file name is not valid (file name must be NO SPACE and MAX 255 characters)'
    ]
  }
  return [true]
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
