let editor = document.getElementById('editorOfOldBlog')
const markdownArea = document.getElementById('markdownOfOldBlog')

/** Scroll textarea and markdown display zone at the same time */
const selectScrollEditor = e => {
  markdownArea.scrollTop = editor.scrollTop
}
editor.addEventListener('scroll', selectScrollEditor)

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

/** Handle press publish mode dropdown */
const publishModeDropdown = document.getElementById(
  'oldBlogPublishModeDropdown'
)
const publishModeItems = document.getElementsByClassName(
  'old-blog-publish-mode-item'
)
for (let i = 0; i < publishModeItems.length; i++) {
  publishModeItems[i].addEventListener('click', () => {
    /** Change value of publish mode dropdown when click in each different dropdown item */
    const publishModeValue = publishModeItems[i].value
    publishModeDropdown.innerText = publishModeValue
    publishModeDropdown.value = publishModeValue
  })
}

const saveBlogChangeBtn = document.getElementById('saveBlogChangeBtn')
/** When press save change button */
saveBlogChangeBtn.addEventListener('click', async () => {
  try {
    const editor = document.getElementById('editorOfOldBlog')
    const blogTitleInput = document.getElementById('oldBlogTitle')
    const blogDateInput = document.getElementById('oldBlogDate')
    const blogTagsInput = document.getElementById('oldBlogTags')
    const blogPublishModeDropdown = document.getElementById(
      'oldBlogPublishModeDropdown'
    )

    /** Check fields empty */
    if (
      !checkInputEmpty(blogTitleInput, 'oldBlogTitleAlert') ||
      !checkInputEmpty(blogTagsInput, 'oldBlogTagsAlert')
    ) {
      return
    }

    let markdownContent = editor.value
    markdownContent = parseEmoji(markdownContent)
    const editFile = document.getElementById('editFileHidden').value
    const htmlContent = converter.render(markdownContent)
    const blogTitle = blogTitleInput.value
    const blogDate = blogDateInput.value || new Date()
    const blogTags = blogTagsInput.value
    const blogPublishMode = blogPublishModeDropdown.value
    const blogTagsArray = parseBlogTagsValueToArray(blogTags)

    /** Request to server to save file change */
    const myAxios = new MyAxios()
    const result = await myAxios.fetch({
      url: `${DEFAULT_URL}/blogs/${editFile}`,
      method: 'PUT',
      data: {
        markdownContent,
        htmlContent,
        metaDataObject: {
          title: blogTitle,
          tags: blogTagsArray,
          date: blogDate,
          publishMode: blogPublishMode
        }
      }
    })
    await myAxios.fetch({
      url: `${DEFAULT_URL}/tags/current-tags`,
      method: 'PUT',
      data: {}
    })
    /** Response to user */
    const { data } = result
    const { message } = data

    ClientResponse.successToast('Save file successfully', message)
    // window.location.href = `${DEFAULT_URL}`
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

/** When confirm delete blog */
const confirmDeleteBlogBtn = document.getElementById('confirmDeleteBlogBtn')
confirmDeleteBlogBtn.addEventListener('click', async () => {
  try {
    const markdownFile = confirmDeleteBlogBtn.value

    /** Request to server to save file change */
    const myAxios = new MyAxios()
    await myAxios.fetch({
      url: `${DEFAULT_URL}/blogs/${markdownFile}`,
      method: 'DELETE',
      data: {}
    })
    await myAxios.fetch({
      url: `${DEFAULT_URL}/tags/current-tags`,
      method: 'PUT',
      data: {}
    })

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
