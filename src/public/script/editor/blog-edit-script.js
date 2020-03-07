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

const saveBlogChangeBtn = document.getElementById('saveBlogChangeBtn')
/** When press save change button */
saveBlogChangeBtn.addEventListener('click', async () => {
  try {
    const editor = document.getElementById('editorOfOldBlog')
    const blogTitleInput = document.getElementById('oldBlogTitle')
    const blogDateInput = document.getElementById('oldBlogDate')
    const blogTagsInput = document.getElementById('oldBlogTags')
    const blogPublishModeSelect = document.getElementById(
      'oldPublishModeSelect'
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
    const blogPublishMode = blogPublishModeSelect.value
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
