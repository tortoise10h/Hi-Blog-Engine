const editor = document.getElementById('editor')
const markdownArea = document.getElementById('markdown')

/** ===== Scroll textarea and markdown display zone at the same time ===== */
const selectScrollEditor = e => {
  markdownArea.scrollTop = editor.scrollTop
}
editor.addEventListener('scroll', selectScrollEditor, false)

/** ===== Load markdown text on left side and display as html on right side ===== */
window.onload = () => {
  const convertTextToMarkdown = () => {
    let markdownText = editor.value
    markdownText = parseEmoji(markdownText)
    const htmlContent = converter.render(markdownText)
    markdownArea.innerHTML = htmlContent
  }

  /** Event listener for everytime editor text in editor zone */
  editor.addEventListener('input', convertTextToMarkdown)

  /** Run everytime first enter page */
  convertTextToMarkdown()
}

/** ===== Hanle on paste image on text area ===== */
editor.addEventListener('paste', async e => {
  await handlePasteImageToTextarea(e)
})

/** ===== Handle press publish mode dropdown ===== */
const publishModeItems = document.getElementsByClassName(
  'blog-publish-mode-item'
)
for (let i = 0; i < publishModeItems.length; i++) {
  const publishModeDropdown = document.getElementById('blogPublishModeDropdown')
  publishModeItems[i].addEventListener('click', () => {
    /** Change value of publish mode dropdown when click in each different dropdown item */
    const publishModeValue = publishModeItems[i].value
    publishModeDropdown.innerText = publishModeValue
    publishModeDropdown.value = publishModeValue
  })
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
  const blogTitleInput = document.getElementById('blogTitle')
  const blogTagsInput = document.getElementById('blogTags')

  /** Make sure all input fields already have data */
  if (
    !checkInputEmpty(blogTitleInput, 'blogTitleAlert') ||
    !checkInputEmpty(blogTagsInput, 'blogTagsAlert')
  ) {
    return
  }

  /** Validate tag format */
  if (/^([\w+]|([\w+],[\w+]))*$/.test(blogTagsInput.value) === false) {
    document.getElementById('blogTagsAlert').style.color = 'red'
    document.getElementById('blogTagsAlert').innerText =
      'Please enter correct format: each tag has no space and split each other by comma (,). No comma and the end'
    window.scrollTo(0, 0)
    blogTagsInput.focus()
    return
  }

  $('#saveBlogModal').modal('show')
  /** Focus file name box when save blog modal open */
  document.getElementById('newFileName').focus()
})

/** ===== When press confirm save ===== */
confirmSaveBtn.addEventListener('click', async () => {
  try {
    const editor = document.getElementById('editor')
    const newFileNameBox = document.getElementById('newFileName')
    const fileNameAlertBox = document.getElementById('fileNameAlert')
    const blogTitleInput = document.getElementById('blogTitle')
    const blogDateInput = document.getElementById('blogDate')
    const blogTagsInput = document.getElementById('blogTags')
    const blogPublishModeDropdown = document.getElementById(
      'blogPublishModeDropdown'
    )

    const newFileName = newFileNameBox.value
    let markdownContent = editor.value
    markdownContent = parseEmoji(markdownContent)
    const htmlContent = converter.render(markdownContent)
    const blogTitle = blogTitleInput.value
    const blogDate = blogDateInput.value || new Date()
    const blogTags = blogTagsInput.value
    const blogPublishMode = blogPublishModeDropdown.value
    const blogTagsArray = parseBlogTagsValueToArray(blogTags)

    /** Check file name */
    const [isFileValid, alertType, alertMessage] = checkFileName(newFileName)
    if (!isFileValid) {
      console.log('error')
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

  if (!/^([\w+]\w+|[\.\-]\w+){1,255}$/.test(fileName)) {
    return [
      false,
      'error',
      'Your file name is not valid (file name must be NO SPACE, MAX 255 characters and no accept -. at the end or start of the name)'
    ]
  }
  return [true]
}
